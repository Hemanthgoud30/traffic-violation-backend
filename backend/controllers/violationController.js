const Violation = require('../models/Violation');
const Challan = require('../models/Challan');
const { sendEmail } = require('../utils/email');

// @desc    Create a new violation report
// @route   POST /api/violations
// @access  Public
const createViolation = async (req, res) => {
  try {
    // Add user to req.body
    req.body.reporter = {
      name: req.body.reporterName,
      phone: req.body.reporterPhone,
      email: req.body.reporterEmail,
      idProof: {
        type: req.body.idProofType,
        number: req.body.reporterId,
        file: req.body.idProofFile
      }
    };

    // Handle evidence files
    if (req.files && req.files.evidence) {
      const evidenceFiles = req.files.evidence.map(file => ({
        filename: file.filename,
        path: file.path,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));
      req.body.evidenceFiles = evidenceFiles;
    }

    // Handle ID proof file
    if (req.files && req.files.idProof) {
      req.body.reporter.idProof.file = {
        filename: req.files.idProof[0].filename,
        path: req.files.idProof[0].path,
        originalName: req.files.idProof[0].originalname,
        size: req.files.idProof[0].size,
        mimetype: req.files.idProof[0].mimetype
      };
    }

    // Create violation
    const violation = await Violation.create(req.body);

    // Send confirmation email to reporter
    if (req.body.reporterEmail) {
      try {
        await sendEmail({
          email: req.body.reporterEmail,
          subject: 'Traffic Violation Report Submitted',
          message: `Dear ${req.body.reporterName},\n\nYour traffic violation report has been submitted successfully.\n\nReport Details:\n- Report ID: ${violation._id}\n- Vehicle Number: ${violation.vehicleNumber}\n- Violation Type: ${violation.violationType}\n- Date: ${violation.date}\n\nThank you for helping make our roads safer.\n\nTraffic Police Department`
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue even if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Violation report submitted successfully',
      data: violation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get all violations
// @route   GET /api/violations
// @access  Private
const getViolations = async (req, res) => {
  try {
    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by violation type if provided
    if (req.query.type) {
      query.violationType = req.query.type;
    }

    const violations = await Violation.find(query)
      .sort('-createdAt')
      .populate('reviewedBy', 'name');

    res.status(200).json({
      success: true,
      count: violations.length,
      data: violations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get single violation
// @route   GET /api/violations/:id
// @access  Private
const getViolation = async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id)
      .populate('reviewedBy', 'name');

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }

    res.status(200).json({
      success: true,
      data: violation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Update violation status
// @route   PUT /api/violations/:id
// @access  Private
const updateViolationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const violation = await Violation.findById(req.params.id);

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }

    violation.status = status;
    violation.reviewedBy = req.user.id;
    violation.reviewedAt = Date.now();

    if (status === 'rejected') {
      violation.rejectionReason = rejectionReason;
    }

    await violation.save();

    // If approved, create a challan
    if (status === 'approved') {
      const fineAmount = getFineAmount(violation.violationType);
      
      const challan = await Challan.create({
        violationId: violation._id,
        vehicleNumber: violation.vehicleNumber,
        violationType: violation.violationType,
        location: violation.location.address,
        date: violation.date,
        fineAmount,
        issuedBy: req.user.id
      });

      // Send notification to reporter
      if (violation.reporter.email) {
        try {
          await sendEmail({
            email: violation.reporter.email,
            subject: 'Traffic Violation Report Approved',
            message: `Dear ${violation.reporter.name},\n\nGood news! Your traffic violation report has been approved.\n\nA challan has been issued to the vehicle owner.\n\nChallan Details:\n- Challan ID: ${challan._id}\n- Vehicle Number: ${violation.vehicleNumber}\n- Fine Amount: ₹${fineAmount}\n- Your Commission (15%): ₹${Math.round(fineAmount * 0.15)}\n\nYou will receive your commission once the fine is paid.\n\nThank you for your contribution to road safety.\n\nTraffic Police Department`
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Violation approved and challan created',
        data: { violation, challan }
      });
    }

    // Send notification to reporter if rejected
    if (status === 'rejected' && violation.reporter.email) {
      try {
        await sendEmail({
          email: violation.reporter.email,
          subject: 'Traffic Violation Report Rejected',
          message: `Dear ${violation.reporter.name},\n\nWe regret to inform you that your traffic violation report has been rejected.\n\nReason: ${rejectionReason}\n\nIf you believe this is a mistake, please contact us with additional evidence.\n\nReport ID: ${violation._id}\n\nTraffic Police Department`
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Violation ${status}`,
      data: violation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Helper function to get fine amount based on violation type
const getFineAmount = (violationType) => {
  const fines = {
    'signal-jumping': 1000,
    'wrong-route': 500,
    'no-helmet': 500,
    'over-speeding': 2000,
    'wrong-parking': 500,
    'triple-riding': 1000,
    'no-seatbelt': 500,
    'mobile-while-driving': 1000
  };
  return fines[violationType] || 500;
};

// Export all functions
module.exports = {
  createViolation,
  getViolations,
  getViolation,
  updateViolationStatus
};