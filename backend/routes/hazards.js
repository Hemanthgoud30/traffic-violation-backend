const express = require('express');
const {
  createHazard,
  getHazards,
  getHazard,
  updateHazardStatus,
  getHazardStats,
} = require('../controllers/hazardController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/', upload.single('photo'), createHazard);
router.get('/', getHazards);
router.get('/stats', getHazardStats);
router.get('/:id', getHazard);

// Protected routes
router.put('/:id/status', protect, authorize('police', 'admin'), updateHazardStatus);

module.exports = router;