const express = require('express');
const router = express.Router();
const { bookTicket, getMyTickets, verifyTicket, getAllTickets } = require('../controllers/ticketController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/book', protect, bookTicket);
router.get('/my', protect, getMyTickets);
router.post('/verify', protect, restrictTo('admin'), verifyTicket);
router.get('/all', protect, restrictTo('admin'), getAllTickets);

module.exports = router;
