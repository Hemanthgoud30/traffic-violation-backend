const Violation = require('../models/Violation');
const Challan = require('../models/Challan');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Violation.countDocuments();
    const approvedReports = await Violation.countDocuments({ status: 'approved' });
    const pendingReports = await Violation.countDocuments({ status: 'pending' });
    const rejectedReports = await Violation.countDocuments({ status: 'rejected' });
    
    const totalFines = await Challan.aggregate([
      { $group: { _id: null, total: { $sum: '$fineAmount' } } }
    ]);
    
    const collectedFines = await Challan.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        approvedReports,
        pendingReports,
        rejectedReports,
        totalFines: totalFines[0]?.total || 0,
        collectedFines: collectedFines[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get pending violations
// @route   GET /api/dashboard/pending-violations
// @access  Private
const getPendingViolations = async (req, res) => {
  try {
    const violations = await Violation.find({ status: 'pending' })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      count: violations.length,
      data: violations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get approved violations (challans)
// @route   GET /api/dashboard/approved-violations
// @access  Private
const getApprovedViolations = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('violationId', 'reporter')
      .sort('-issuedAt');

    res.status(200).json({
      success: true,
      count: challans.length,
      data: challans
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Export approved violations as CSV
// @route   GET /api/dashboard/export
// @access  Private
const exportViolations = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('violationId', 'reporter')
      .sort('-issuedAt');

    // Create CSV string
    let csv = 'Challan ID,Vehicle Number,Violation Type,Location,Date,Fine Amount,Status,Issued At,Paid At\n';
    
    challans.forEach(challan => {
      csv += `${challan._id},${challan.vehicleNumber},${challan.violationType},${challan.location},${challan.date.toISOString().split('T')[0]},${challan.fineAmount},${challan.status},${challan.issuedAt.toISOString().split('T')[0]},${challan.paidAt ? challan.paidAt.toISOString().split('T')[0] : ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=violations.csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Export all functions
module.exports = {
  getDashboardStats,
  getPendingViolations,
  getApprovedViolations,
  exportViolations
};