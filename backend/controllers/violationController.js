const Violation = require('../models/Violation');

// @desc    Create a new violation report
// @route   POST /api/violations
// @access  Public
const createViolation = async (req, res) => {
  try {
    // Add Cloudinary URLs to request body
    if (req.files && req.files.evidencePhotos) {
      req.body.evidencePhotos = req.files.evidencePhotos.map(
        (file) => file.path // Cloudinary URL
      );
    }

    if (req.files && req.files.idProof) {
      req.body['reporter.idProof'] = req.files.idProof[0].path; // Cloudinary URL
    }

    // Create violation
    const violation = await Violation.create(req.body);

    res.status(201).json({
      success: true,
      data: violation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ... rest of the controller remains the same
// @desc    Get all violations with filtering and pagination
// @route   GET /api/violations
// @access  Private
const getViolations = async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || '';
    const violationType = req.query.violationType || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (violationType) {
      query.violationType = violationType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Execute query
    const total = await Violation.countDocuments(query);
    const violations = await Violation.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (startIndex + violations.length < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: violations.length,
      total,
      pagination,
      data: violations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single violation
// @route   GET /api/violations/:id
// @access  Private
const getViolation = async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id);

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: violation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update violation status (approve/reject)
// @route   PUT /api/violations/:id/status
// @access  Private
const updateViolationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // Find violation
    let violation = await Violation.findById(req.params.id);

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found',
      });
    }

    // Update fields
    violation.status = status;
    violation.reviewedBy = req.user.id;
    violation.reviewedAt = Date.now();

    if (status === 'approved') {
      // Set fine amount based on violation type
      const fineAmounts = {
        'signal-jumping': 1000,
        'wrong-route': 500,
        'no-helmet': 500,
        'over-speeding': 2000,
        'wrong-parking': 500,
        'triple-riding': 1000,
        'no-seatbelt': 500,
        'mobile-while-driving': 1000,
      };

      violation.fineAmount = fineAmounts[violation.violationType] || 500;
      violation.issuedChallan = `CH${Date.now()}`;
    } else if (status === 'rejected') {
      violation.rejectionReason = rejectionReason || 'Insufficient evidence';
    }

    // Save updated violation
    violation = await violation.save();

    res.status(200).json({
      success: true,
      data: violation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export violations as CSV
// @route   GET /api/violations/export
// @access  Private
const exportViolations = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get violations
    const violations = await Violation.find(query).sort({ createdAt: -1 });

    // Create CSV
    let csv = 'Violation ID,Vehicle Number,Violation Type,Date,Location,Fine Amount,Status,Issued At\n';

    violations.forEach((violation) => {
      csv += `${violation.violationId},${violation.vehicleNumber},${violation.violationType},${violation.date},${violation.location.address},${violation.fineAmount || 0},${violation.status},${violation.createdAt}\n`;
    });

    // Set headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="violations.csv"');

    // Send CSV
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createViolation,
  getViolations,
  getViolation,
  updateViolationStatus,
  exportViolations,
};