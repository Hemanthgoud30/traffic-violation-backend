const Hazard = require('../models/Hazard');

// @desc    Create a new hazard report
// @route   POST /api/hazards
// @access  Public
const createHazard = async (req, res) => {
  try {
    // Add file path to request body if photo was uploaded
    if (req.file) {
      req.body.photo = `/uploads/hazards/${req.file.filename}`;
    }

    // Create hazard
    const hazard = await Hazard.create(req.body);

    res.status(201).json({
      success: true,
      data: hazard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all hazards with filtering and pagination
// @route   GET /api/hazards
// @access  Public
const getHazards = async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const type = req.query.type || '';
    const severity = req.query.severity || '';
    const status = req.query.status || '';

    // Build query
    const query = {};

    if (type) {
      query.type = type;
    }

    if (severity) {
      query.severity = severity;
    }

    if (status) {
      query.status = status;
    }

    // Execute query
    const total = await Hazard.countDocuments(query);
    const hazards = await Hazard.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (startIndex + hazards.length < total) {
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
      count: hazards.length,
      total,
      pagination,
      data: hazards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single hazard
// @route   GET /api/hazards/:id
// @access  Public
const getHazard = async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id);

    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hazard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update hazard status (verify/resolve)
// @route   PUT /api/hazards/:id/status
// @access  Private
const updateHazardStatus = async (req, res) => {
  try {
    const { status, resolvedDetails } = req.body;

    // Find hazard
    let hazard = await Hazard.findById(req.params.id);

    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found',
      });
    }

    // Update fields
    hazard.status = status;

    if (status === 'verified') {
      hazard.verifiedBy = req.user.id;
      hazard.verifiedAt = Date.now();
      hazard.verifiedCount += 1;
    } else if (status === 'resolved') {
      hazard.resolvedBy = req.user.id;
      hazard.resolvedAt = Date.now();
      hazard.resolvedDetails = resolvedDetails || 'Hazard has been resolved';
    }

    // Save updated hazard
    hazard = await hazard.save();

    res.status(200).json({
      success: true,
      data: hazard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get hazard statistics
// @route   GET /api/hazards/stats
// @access  Public
const getHazardStats = async (req, res) => {
  try {
    // Get counts by type
    const typeStats = await Hazard.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by severity
    const severityStats = await Hazard.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by status
    const statusStats = await Hazard.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent hazards
    const recentHazards = await Hazard.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        typeStats,
        severityStats,
        statusStats,
        recentHazards,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createHazard,
  getHazards,
  getHazard,
  updateHazardStatus,
  getHazardStats,
};