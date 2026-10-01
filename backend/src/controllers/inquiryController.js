const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Send an inquiry for a property
// @route   POST /api/inquiries
// @access  Public / Optional Auth
const createInquiry = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, message) are required.',
      });
    }

    const property = await Property.findById(propertyId).populate('agent', 'fullName email');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiry = await Inquiry.create({
      user: req.user ? req.user._id : null,
      property: property._id,
      agent: property.agent._id,
      name,
      email,
      phone,
      message,
      status: 'New',
    });

    // Notify Agent
    await createNotification({
      recipient: property.agent._id,
      title: 'New Property Inquiry Received',
      message: `${name} inquired about "${property.title}": "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
      type: 'inquiry_received',
      link: '/agent/inquiries',
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! The agent has been notified.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiries sent by logged in user
// @route   GET /api/inquiries/my-inquiries
// @access  Private (User)
const getUserInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    })
      .populate('property', 'title price images address city')
      .populate('agent', 'fullName email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiries received by agent
// @route   GET /api/inquiries/agent-inquiries
// @access  Private (Agent)
const getAgentInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ agent: req.user._id })
      .populate('property', 'title price images address city')
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an inquiry
// @route   PUT /api/inquiries/:id/reply
// @access  Private (Agent, Admin)
const replyInquiry = async (req, res, next) => {
  try {
    const { reply } = req.body;
    if (!reply || reply.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate('property', 'title');
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (req.user.role !== 'admin' && inquiry.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reply to this inquiry' });
    }

    inquiry.reply = reply;
    inquiry.status = 'Replied';
    await inquiry.save();

    // If user is a registered user, send notification
    if (inquiry.user) {
      await createNotification({
        recipient: inquiry.user,
        title: 'Agent Replied to Your Inquiry',
        message: `Response for "${inquiry.property ? inquiry.property.title : 'Property'}": "${reply.substring(0, 100)}"`,
        type: 'inquiry_replied',
        link: '/dashboard/inquiries',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status (New, Replied, Resolved)
// @route   PUT /api/inquiries/:id/status
// @access  Private (Agent, Admin)
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['New', 'Replied', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid inquiry status' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (req.user.role !== 'admin' && inquiry.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getUserInquiries,
  getAgentInquiries,
  replyInquiry,
  updateInquiryStatus,
};
