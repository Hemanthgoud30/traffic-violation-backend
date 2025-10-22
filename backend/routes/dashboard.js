const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingViolations,
  getApprovedViolations,
  exportViolations
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'police'), getDashboardStats);
router.get('/pending-violations', protect, authorize('admin', 'police'), getPendingViolations);
router.get('/approved-violations', protect, authorize('admin', 'police'), getApprovedViolations);
router.get('/export', protect, authorize('admin', 'police'), exportViolations);

module.exports = router;