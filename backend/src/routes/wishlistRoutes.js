const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('user'), getWishlist);
router.post('/:propertyId', protect, authorize('user'), addToWishlist);
router.delete('/:propertyId', protect, authorize('user'), removeFromWishlist);
router.get('/check/:propertyId', protect, authorize('user'), checkWishlistStatus);

module.exports = router;
