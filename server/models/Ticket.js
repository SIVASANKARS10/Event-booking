const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: {
    type: String, // base64 data URL
    required: true
  },
  qrData: {
    type: String, // JSON string encoded in QR
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'checked-in', 'cancelled'],
    default: 'booked'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'free'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  checkedInAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster lookups
ticketSchema.index({ userId: 1, eventId: 1 });
ticketSchema.index({ ticketId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
