const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events.' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(500).json({ success: false, message: 'Error fetching event.' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin only
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, price, totalSeats, image, tags, rules, prizes, maxTeamSize } = req.body;

    if (!title || !description || !date || !time || !venue || totalSeats === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'other',
      date: new Date(date),
      time,
      venue,
      price: price || 0,
      totalSeats,
      availableSeats: totalSeats,
      image: image || '',
      tags: tags || [],
      rules: rules || '',
      prizes: prizes || '',
      maxTeamSize: maxTeamSize || 1,
      createdBy: req.user._id
    });

    const populated = await Event.findById(event._id).populate('createdBy', 'name email');
    res.status(201).json({ success: true, message: 'Event created successfully!', event: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Error creating event.' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin only
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const { totalSeats, ...otherFields } = req.body;

    // If totalSeats changed, adjust availableSeats accordingly
    if (totalSeats !== undefined) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      const newAvailable = totalSeats - bookedSeats;
      if (newAvailable < 0) {
        return res.status(400).json({ success: false, message: 'Cannot reduce total seats below already booked count.' });
      }
      otherFields.totalSeats = totalSeats;
      otherFields.availableSeats = newAvailable;
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { ...otherFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({ success: true, message: 'Event updated successfully!', event: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Error updating event.' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event.' });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/events/admin/stats
// @access  Admin only
const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalTickets = await Ticket.countDocuments({ status: { $ne: 'cancelled' } });
    const checkedIn = await Ticket.countDocuments({ status: 'checked-in' });

    const revenueData = await Ticket.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const events = await Event.find({ isActive: true }).select('title availableSeats totalSeats date category');

    const ticketsByEvent = await Ticket.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { eventName: '$event.title', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const categoryStats = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalTickets,
        checkedIn,
        totalRevenue,
        events: events.map(e => ({
          title: e.title,
          availableSeats: e.availableSeats,
          totalSeats: e.totalSeats,
          date: e.date,
          category: e.category,
          booked: e.totalSeats - e.availableSeats
        })),
        ticketsByEvent,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getDashboardStats };
