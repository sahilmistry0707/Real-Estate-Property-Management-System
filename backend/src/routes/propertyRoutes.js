const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updatePropertyStatus,
  getMapProperties,
} = require('../controllers/propertyController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public route for map
router.get('/map/all', getMapProperties);

// Agent specific properties
router.get('/agent/my-properties', protect, authorize('agent', 'admin'), getMyProperties);

// General properties list (public, approved only)
router.get('/', getProperties);

// Single property details (public, but auth-aware for draft/pending visibility)
router.get('/:id', optionalAuth, getPropertyById);

// Create property (Agents & Admin, with image upload)
router.post('/', protect, authorize('agent', 'admin'), upload.array('images', 10), createProperty);

// Update property
router.put('/:id', protect, authorize('agent', 'admin'), upload.array('images', 10), updateProperty);

// Delete property
router.delete('/:id', protect, authorize('agent', 'admin'), deleteProperty);

// Status update (Available/Sold/Rented)
router.patch('/:id/status', protect, authorize('agent', 'admin'), updatePropertyStatus);

module.exports = router;
