const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  violationId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'TV' + Date.now();
    }
  },
  violationType: {
    type: String,
    required: [true, 'Please specify the violation type'],
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
    required: [true, 'Please provide the vehicle number'],
    match: [/^[A-Za-z]{2}[0-9]{2}[A-Za-z]{1,2}[0-9]{4}$/, 'Please provide a valid vehicle number']
  },
  date: {
    type: Date,
    required: [true, 'Please provide the date of violation'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide the location'],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    }
  },
  reporter: {
    name: {
      type: String,
      required: [true, 'Please provide reporter name'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide reporter phone'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    upi: {
      type: String,
      required: [true, 'Please provide UPI ID'],
    },
    idType: {
      type: String,
      enum: ['aadhaar', 'dl'],
      required: [true, 'Please specify ID type'],
    },
    idNumber: {
      type: String,
      required: [true, 'Please provide ID number'],
    },
    idProof: {
      type: String, // URL to the uploaded ID proof
      required: [true, 'Please upload ID proof'],
    }
  },
  additionalDetails: {
    type: String,
  },
  evidencePhotos: [{
    type: String, // URLs to the uploaded photos
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  fineAmount: {
    type: Number,
  },
  rejectionReason: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  issuedChallan: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  paidAt: {
    type: Date,
  },
  commissionPaid: {
    type: Boolean,
    default: false,
  },
  commissionPaidAt: {
    type: Date,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Violation', violationSchema);