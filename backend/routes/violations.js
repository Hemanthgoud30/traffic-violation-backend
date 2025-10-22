const express = require('express');
const {
  createViolation,
  getViolations,
  getViolation,
  updateViolationStatus,
  exportViolations,
} = require('../controllers/violationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/', upload.fields([
  { name: 'evidencePhotos', maxCount: 5 },
  { name: 'idProof', maxCount: 1 }
]), createViolation);

// Protected routes
router.get('/', protect, getViolations);
router.get('/export', protect, exportViolations);
router.get('/:id', protect, getViolation);
router.put('/:id/status', protect, authorize('police', 'admin'), updateViolationStatus);

module.exports = router;