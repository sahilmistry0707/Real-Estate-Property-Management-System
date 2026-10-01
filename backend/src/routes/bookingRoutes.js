const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAgentBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// General list handler based on user role
router.get('/', protect, async (req, res, next) => {
  if (req.user.role === 'admin') {
    try {
      const bookings = await Booking.find()
        .populate('user', 'fullName email phone')
        .populate('agent', 'fullName email phone')
        .populate('property', 'title price purpose images city')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: bookings.length, bookings });
    } catch (error) {
      return next(error);
    }
  } else if (req.user.role === 'agent') {
    return getAgentBookings(req, res, next);
  } else {
    return getUserBookings(req, res, next);
  }
});

// Explicit role endpoints
router.get('/my-bookings', protect, authorize('user'), getUserBookings);
router.get('/agent-bookings', protect, authorize('agent', 'admin'), getAgentBookings);

// Create booking
router.post('/', protect, authorize('user'), createBooking);

// Update booking status
router.put('/:id/status', protect, authorize('agent', 'admin'), updateBookingStatus);
router.put('/:id', protect, authorize('agent', 'admin'), updateBookingStatus);

module.exports = router;
