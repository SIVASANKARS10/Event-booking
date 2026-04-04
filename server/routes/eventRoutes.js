const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getDashboardStats } = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Admin stats
router.get('/admin/stats', protect, restrictTo('admin'), getDashboardStats);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Admin only
router.post('/', protect, restrictTo('admin'), createEvent);
router.put('/:id', protect, restrictTo('admin'), updateEvent);
router.delete('/:id', protect, restrictTo('admin'), deleteEvent);

module.exports = router;
