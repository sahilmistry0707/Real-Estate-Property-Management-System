const Visit = require('../models/Visit');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Schedule property visit
// @route   POST /api/visits
// @access  Private (User)
const createVisit = async (req, res, next) => {
  try {
    const { propertyId, visitDate, visitTime, message } = req.body;

    if (!propertyId || !visitDate || !visitTime) {
      return res.status(400).json({
        success: false,
        message: 'Property, visit date, and visit time are required.',
      });
    }

    const property = await Property.findById(propertyId).populate('agent', 'fullName email');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.approvalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule a visit for an unapproved property.',
      });
    }

    const visit = await Visit.create({
      user: req.user._id,
      property: property._id,
      agent: property.agent._id,
      visitDate,
      visitTime,
      message: message || '',
      status: 'Pending',
    });

    // Notify Agent
    await createNotification({
      recipient: property.agent._id,
      title: 'New Site Visit Scheduled',
      message: `${req.user.fullName} requested a visit to "${property.title}" on ${new Date(visitDate).toLocaleDateString()} at ${visitTime}.`,
      type: 'visit_created',
      link: '/agent/visits',
    });

    // Notify User
    await createNotification({
      recipient: req.user._id,
      title: 'Site Visit Scheduled',
      message: `Your visit request for "${property.title}" on ${new Date(visitDate).toLocaleDateString()} at ${visitTime} is pending agent confirmation.`,
      type: 'visit_created',
      link: '/dashboard/visits',
    });

    const populatedVisit = await Visit.findById(visit._id)
      .populate('property', 'title price images address city')
      .populate('agent', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Property visit request submitted successfully!',
      visit: populatedVisit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's visits
// @route   GET /api/visits/my-visits
// @access  Private (User)
const getUserVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find({ user: req.user._id })
      .populate('property', 'title price purpose type images address city status')
      .populate('agent', 'fullName email phone avatar agencyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent's visit requests
// @route   GET /api/visits/agent-visits
// @access  Private (Agent)
const getAgentVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find({ agent: req.user._id })
      .populate('property', 'title price purpose type images address city')
      .populate('user', 'fullName email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visit request status
// @route   PUT /api/visits/:id/status
// @access  Private (Agent, Admin)
const updateVisitStatus = async (req, res, next) => {
  try {
    const { status, responseNotes } = req.body;
    if (!['Approved', 'Rejected', 'Completed', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const visit = await Visit.findById(req.params.id)
      .populate('property', 'title')
      .populate('user', 'fullName email');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found' });
    }

    if (req.user.role !== 'admin' && visit.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this visit request' });
    }

    visit.status = status;
    if (responseNotes !== undefined) visit.responseNotes = responseNotes;
    await visit.save();

    // Notify User
    await createNotification({
      recipient: visit.user._id,
      title: `Property Visit Request ${status}`,
      message: `Your visit to "${visit.property.title}" has been ${status}. ${responseNotes ? `Agent Note: ${responseNotes}` : ''}`,
      type: 'visit_status',
      link: '/dashboard/visits',
    });

    res.status(200).json({
      success: true,
      message: `Visit request marked as ${status}`,
      visit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisit,
  getUserVisits,
  getAgentVisits,
  updateVisitStatus,
};
