const mongoose = require('mongoose');

const ChallanSchema = new mongoose.Schema({
  violationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Violation',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  violationType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  fineAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  issuedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  paymentMethod: String,
  paymentId: String
});

module.exports = mongoose.model('Challan', ChallanSchema);