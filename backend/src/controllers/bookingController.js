const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, bookingType, preferredDate, preferredTime, message } = req.body;

    if (!propertyId || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Property, preferred date, and preferred time are required.',
      });
    }

    const property = await Property.findById(propertyId).populate('agent', 'fullName email');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.approvalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a property that is not approved.',
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: property._id,
      agent: property.agent._id,
      bookingType: bookingType || (property.purpose === 'Rent' ? 'Rental Booking' : 'Purchase Booking'),
      preferredDate,
      preferredTime,
      message: message || '',
      status: 'Pending',
    });

    // Notify Agent
    await createNotification({
      recipient: property.agent._id,
      title: 'New Booking Request Received',
      message: `${req.user.fullName} submitted a booking request for "${property.title}" on ${new Date(preferredDate).toLocaleDateString()}.`,
      type: 'booking_created',
      link: '/agent/bookings',
    });

    // Notify User confirmation
    await createNotification({
      recipient: req.user._id,
      title: 'Booking Request Submitted',
      message: `Your booking request for "${property.title}" has been sent to agent ${property.agent.fullName}.`,
      type: 'booking_created',
      link: '/dashboard/bookings',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title price images address city')
      .populate('agent', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title price purpose type images address city status')
      .populate('agent', 'fullName email phone avatar agencyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent's booking requests
// @route   GET /api/bookings/agent-bookings
// @access  Private (Agent)
const getAgentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ agent: req.user._id })
      .populate('property', 'title price purpose type images address city')
      .populate('user', 'fullName email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve, Reject, Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Agent, Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, responseNotes } = req.body;
    if (!['Approved', 'Rejected', 'Completed', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title')
      .populate('user', 'fullName email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    // Role check: Admin or the assigned agent
    if (req.user.role !== 'admin' && booking.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this booking' });
    }

    booking.status = status;
    if (responseNotes !== undefined) booking.responseNotes = responseNotes;
    await booking.save();

    // Send notification to User about status update
    await createNotification({
      recipient: booking.user._id,
      title: `Booking Request ${status}`,
      message: `Your booking request for "${booking.property.title}" has been updated to: ${status}. ${responseNotes ? `Note: ${responseNotes}` : ''}`,
      type: 'booking_status',
      link: '/dashboard/bookings',
    });

    res.status(200).json({
      success: true,
      message: `Booking has been marked as ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAgentBookings,
  updateBookingStatus,
};
