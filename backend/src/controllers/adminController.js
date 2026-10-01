const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Visit = require('../models/Visit');
const Inquiry = require('../models/Inquiry');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get Admin Dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAgents,
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      totalBookings,
      pendingBookings,
      totalInquiries,
      totalVisits,
      recentUsers,
      recentProperties,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
      Property.countDocuments(),
      Property.countDocuments({ approvalStatus: 'Pending' }),
      Property.countDocuments({ approvalStatus: 'Approved' }),
      Property.countDocuments({ approvalStatus: 'Rejected' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Inquiry.countDocuments(),
      Visit.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Property.find().populate('agent', 'fullName email').sort({ createdAt: -1 }).limit(5),
      Booking.find()
        .populate('user', 'fullName email')
        .populate('property', 'title price')
        .populate('agent', 'fullName')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalProperties,
        pendingProperties,
        approvedProperties,
        rejectedProperties,
        totalBookings,
        pendingBookings,
        totalInquiries,
        totalVisits,
      },
      recent: {
        users: recentUsers,
        properties: recentProperties,
        bookings: recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytical reports for charts
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res, next) => {
  try {
    const [
      propertiesByType,
      propertiesByPurpose,
      propertiesByApproval,
      propertiesByStatus,
      bookingsByStatus,
      visitsByStatus,
      propertiesByCity,
    ] = await Promise.all([
      // Properties grouped by Type
      Property.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $project: { type: '$_id', count: 1, avgPrice: { $round: ['$avgPrice', 0] }, _id: 0 } },
      ]),
      // Properties by Purpose (Buy vs Rent)
      Property.aggregate([
        { $group: { _id: '$purpose', count: { $sum: 1 } } },
        { $project: { purpose: '$_id', count: 1, _id: 0 } },
      ]),
      // Properties by Approval Status
      Property.aggregate([
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      // Properties by Listing Status (Available, Sold, Rented)
      Property.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      // Bookings by Status
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      // Visits by Status
      Visit.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      // Top Cities
      Property.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { city: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalVisits = await Visit.countDocuments();

    res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        totalAgents,
        totalProperties,
        totalBookings,
        totalVisits,
      },
      reports: {
        propertiesByType,
        propertiesByPurpose,
        propertiesByApproval,
        propertiesByStatus,
        bookingsByStatus,
        visitsByStatus,
        propertiesByCity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search, role filter, pagination)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active / inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been set to ${status}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all agents with property counts
// @route   GET /api/admin/agents
// @access  Private (Admin)
const getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password').sort({ createdAt: -1 });

    const agentsWithCount = await Promise.all(
      agents.map(async (agent) => {
        const propertyCount = await Property.countDocuments({ agent: agent._id });
        const approvedCount = await Property.countDocuments({ agent: agent._id, approvalStatus: 'Approved' });
        const pendingCount = await Property.countDocuments({ agent: agent._id, approvalStatus: 'Pending' });

        return {
          ...agent.toObject(),
          totalProperties: propertyCount,
          approvedProperties: approvedCount,
          pendingProperties: pendingCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: agentsWithCount.length,
      agents: agentsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties for admin management (including pending/rejected)
// @route   GET /api/admin/properties
// @access  Private (Admin)
const getAllPropertiesAdmin = async (req, res, next) => {
  try {
    const { approvalStatus, purpose, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (approvalStatus && approvalStatus !== 'All') {
      query.approvalStatus = approvalStatus;
    }
    if (purpose && purpose !== 'All') {
      query.purpose = purpose;
    }
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { city: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('agent', 'fullName email phone agencyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin)
const approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'fullName email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.approvalStatus = 'Approved';
    property.rejectionReason = '';
    await property.save();

    // Send notification to Agent
    await createNotification({
      recipient: property.agent._id,
      title: 'Property Listing Approved! 🎉',
      message: `Your property listing "${property.title}" has been approved by the Admin and is now publicly live.`,
      type: 'property_approved',
      link: `/properties/${property._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Property approved successfully and is now publicly visible.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject property
// @route   PUT /api/admin/properties/:id/reject
// @access  Private (Admin)
const rejectProperty = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const property = await Property.findById(req.params.id).populate('agent', 'fullName email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.approvalStatus = 'Rejected';
    property.rejectionReason = rejectionReason || 'Property details require revision.';
    await property.save();

    // Send notification to Agent
    await createNotification({
      recipient: property.agent._id,
      title: 'Property Listing Rejected',
      message: `Your property listing "${property.title}" was rejected. Reason: ${property.rejectionReason}`,
      type: 'property_rejected',
      link: `/agent/properties`,
    });

    res.status(200).json({
      success: true,
      message: 'Property has been rejected.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'fullName email phone')
        .populate('agent', 'fullName email phone')
        .populate('property', 'title price purpose images city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminReports,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllAgents,
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  getAllBookingsAdmin,
};
