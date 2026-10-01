const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same user and property
wishlistSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
