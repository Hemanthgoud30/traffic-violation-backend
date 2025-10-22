const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  violationType: {
    type: String,
    required: true,
    enum: [
      'signal-jumping',
      'wrong-route',
      'no-helmet',
      'over-speeding',
      'wrong-parking',
      'triple-riding',
      'no-seatbelt',
      'mobile-while-driving'
    ]
  },
  vehicleNumber: {
    type: String,
    required: true,
    match: [/^[A-Za-z]{2}[0-9]{2}[A-Za-z]{1,2}[0-9]{4}$/, 'Please enter a valid vehicle number']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: false
      },
      lng: {
        type: Number,
        required: false
      }
    }
  },
  additionalDetails: {
    type: String,
    maxlength: 500
  },
  evidenceFiles: [{
    filename: String,
    path: String,
    originalName: String,
    size: Number,
    mimetype: String
  }],
  reporter: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    idProof: {
      type: {
        type: String,
        enum: ['aadhaar', 'dl'],
        required: true
      },
      number: {
        type: String,
        required: true
      },
      file: {
        filename: String,
        path: String,
        originalName: String,
        size: Number,
        mimetype: String
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Violation', ViolationSchema);