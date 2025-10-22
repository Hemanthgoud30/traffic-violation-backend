const Violation = require('../models/Violation');
const Hazard = require('../models/Hazard');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get violation statistics
    const totalViolations = await Violation.countDocuments();
    const pendingViolations = await Violation.countDocuments({ status: 'pending' });
    const approvedViolations = await Violation.countDocuments({ status: 'approved' });
    const rejectedViolations = await Violation.countDocuments({ status: 'rejected' });

    // Get hazard statistics
    const totalHazards = await Hazard.countDocuments();
    const reportedHazards = await Hazard.countDocuments({ status: 'reported' });
    const verifiedHazards = await Hazard.countDocuments({ status: 'verified' });
    const resolvedHazards = await Hazard.countDocuments({ status: 'resolved' });

    // Get recent violations
    const recentViolations = await Violation.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent hazards
    const recentHazards = await Hazard.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly violation data for the past year
    const monthlyViolations = await Violation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Get violation type distribution
    const violationTypes = await Violation.aggregate([
      {
        $group: {
          _id: '$violationType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get hazard type distribution
    const hazardTypes = await Hazard.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        violations: {
          total: totalViolations,
          pending: pendingViolations,
          approved: approvedViolations,
          rejected: rejectedViolations,
          recent: recentViolations,
          monthly: monthlyViolations,
          types: violationTypes,
        },
        hazards: {
          total: totalHazards,
          reported: reportedHazards,
          verified: verifiedHazards,
          resolved: resolvedHazards,
          recent: recentHazards,
          types: hazardTypes,
        },
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
  getDashboardStats,
};