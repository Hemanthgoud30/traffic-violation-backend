const express = require('express');
const router = express.Router();
const {
  createViolation,
  getViolations,
  getViolation,
  updateViolationStatus
} = require('../controllers/violationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .post(
    upload.fields([
      { name: 'evidence', maxCount: 5 },
      { name: 'idProof', maxCount: 1 }
    ]),
    createViolation
  )
  .get(protect, authorize('admin', 'police'), getViolations);

router
  .route('/:id')
  .get(protect, authorize('admin', 'police'), getViolation)
  .put(protect, authorize('admin', 'police'), updateViolationStatus);

module.exports = router;