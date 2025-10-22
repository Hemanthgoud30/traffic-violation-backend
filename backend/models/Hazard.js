const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema({
  hazardId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'HZ' + Date.now();
    }
  },
  type: {
    type: String,
    required: [true, 'Please specify the hazard type'],
    enum: [
      'pothole',
      'accident',
      'waterlogging',
      'debris',
      'streetlight',
      'tree',
      'animal',
      'other'
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide the location'],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Please provide latitude'],
      },
      lng: {
        type: Number,
        required: [true, 'Please provide longitude'],
      },
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  photo: {
    type: String, // URL to the uploaded photo
  },
  reporter: {
    name: {
      type: String,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    }
  },
  status: {
    type: String,
    enum: ['reported', 'verified', 'resolved'],
    default: 'reported',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
  verifiedCount: {
    type: Number,
    default: 0,
  },
  resolvedDetails: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hazard', hazardSchema);