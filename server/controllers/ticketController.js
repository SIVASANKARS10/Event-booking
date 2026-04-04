const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendBookingConfirmation } = require('../utils/emailSender');
const { v4: uuidv4 } = require('uuid');

// @desc    Book a ticket
// @route   POST /api/tickets/book
// @access  Private (Student)
const bookTicket = async (req, res) => {
  try {
    const { eventId, paymentSimulation } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check if already booked
    const existing = await Ticket.findOne({
      userId: req.user._id,
      eventId,
      status: { $ne: 'cancelled' }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already booked a ticket for this event.' });
    }

    // Check availability
    if (event.availableSeats <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this event is sold out.' });
    }

    // Simulate payment
    let paymentStatus = 'free';
    let paymentId = '';

    if (event.price > 0) {
      // Simulate payment processing
      const paymentSuccess = paymentSimulation !== false; // Default true for simulation
      if (!paymentSuccess) {
        return res.status(402).json({ success: false, message: 'Payment failed. Please try again.' });
      }
      paymentStatus = 'paid';
      paymentId = 'SIM_' + uuidv4().split('-')[0].toUpperCase();
    }

    // Generate unique ticket ID
    const ticketId = 'TS-' + Date.now().toString(36).toUpperCase() + '-' + uuidv4().split('-')[0].toUpperCase();

    // Generate QR code with ticket data
    const qrPayload = {
      ticketId,
      userId: req.user._id.toString(),
      eventId: eventId.toString(),
      eventTitle: event.title,
      holderName: req.user.name,
      issuedAt: new Date().toISOString()
    };

    const { qrCode, qrData } = await generateQRCode(qrPayload);

    // Create ticket (use atomic operation to prevent race conditions)
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ success: false, message: 'Event is sold out.' });
    }

    const ticket = await Ticket.create({
      userId: req.user._id,
      eventId,
      ticketId,
      qrCode,
      qrData,
      status: 'booked',
      paymentStatus,
      paymentId,
      amountPaid: event.price
    });

    // Send confirmation email (async, don't await)
    sendBookingConfirmation({
      to: req.user.email,
      name: req.user.name,
      event,
      ticket,
      qrCode
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('eventId', 'title date time venue price category')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully! Confirmation email sent.',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Error booking ticket.' });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      userId: req.user._id,
      status: { $ne: 'cancelled' }
    })
      .populate('eventId', 'title date time venue price category image')
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tickets.' });
  }
};

// @desc    Verify ticket via QR
// @route   POST /api/tickets/verify
// @access  Private (Admin)
const verifyTicket = async (req, res) => {
  try {
    const { qrData, ticketId: manualTicketId } = req.body;

    let ticketIdentifier;

    if (qrData) {
      try {
        const parsed = JSON.parse(qrData);
        ticketIdentifier = parsed.ticketId;
      } catch {
        ticketIdentifier = qrData; // Maybe raw ticket ID was passed
      }
    } else if (manualTicketId) {
      ticketIdentifier = manualTicketId;
    } else {
      return res.status(400).json({ success: false, message: 'QR data or Ticket ID required.' });
    }

    const ticket = await Ticket.findOne({ ticketId: ticketIdentifier })
      .populate('userId', 'name email college')
      .populate('eventId', 'title date time venue');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid ticket. Not found in system.' });
    }

    if (ticket.status === 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already used. This person has already checked in.',
        ticket: {
          ticketId: ticket.ticketId,
          holderName: ticket.userId?.name,
          event: ticket.eventId?.title,
          checkedInAt: ticket.checkedInAt
        }
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This ticket has been cancelled.' });
    }

    // Mark as checked in
    ticket.status = 'checked-in';
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: '✅ Check-in successful!',
      ticket: {
        ticketId: ticket.ticketId,
        holderName: ticket.userId?.name,
        holderEmail: ticket.userId?.email,
        college: ticket.userId?.college,
        event: ticket.eventId?.title,
        venue: ticket.eventId?.venue,
        date: ticket.eventId?.date,
        checkedInAt: ticket.checkedInAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying ticket.' });
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets/all
// @access  Admin
const getAllTickets = async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('userId', 'name email college')
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, tickets, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tickets.' });
  }
};

module.exports = { bookTicket, getMyTickets, verifyTicket, getAllTickets };
