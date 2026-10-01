const Wishlist = require('../models/Wishlist');
const Property = require('../models/Property');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private (User)
const getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'property',
        select: 'title description price purpose type area bedrooms bathrooms furnishing address city state latitude longitude images status approvalStatus',
        populate: {
          path: 'agent',
          select: 'fullName email phone avatar agencyName',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any where property may have been deleted
    const validItems = wishlistItems
      .filter((item) => item.property != null)
      .map((item) => item.property);

    res.status(200).json({
      success: true,
      count: validItems.length,
      wishlist: validItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:propertyId
// @access  Private (User)
const addToWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existing = await Wishlist.findOne({ user: req.user._id, property: propertyId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property is already in your wishlist',
      });
    }

    await Wishlist.create({
      user: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: 'Property added to wishlist',
      propertyId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
// @access  Private (User)
const removeFromWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const item = await Wishlist.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Property not found in wishlist',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property removed from wishlist',
      propertyId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if property is in wishlist
// @route   GET /api/wishlist/check/:propertyId
// @access  Private (User)
const checkWishlistStatus = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const item = await Wishlist.findOne({
      user: req.user._id,
      property: propertyId,
    });

    res.status(200).json({
      success: true,
      inWishlist: !!item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
};
