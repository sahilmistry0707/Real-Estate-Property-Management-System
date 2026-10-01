const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getUserInquiries,
  getAgentInquiries,
  replyInquiry,
  updateInquiryStatus,
} = require('../controllers/inquiryController');
const Inquiry = require('../models/Inquiry');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// General list handler based on user role
router.get('/', protect, async (req, res, next) => {
  if (req.user.role === 'admin') {
    try {
      const inquiries = await Inquiry.find()
        .populate('property', 'title price images address city')
        .populate('agent', 'fullName email phone')
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: inquiries.length, inquiries });
    } catch (error) {
      return next(error);
    }
  } else if (req.user.role === 'agent') {
    return getAgentInquiries(req, res, next);
  } else {
    return getUserInquiries(req, res, next);
  }
});

router.get('/my-inquiries', protect, getUserInquiries);
router.get('/agent-inquiries', protect, authorize('agent', 'admin'), getAgentInquiries);

router.post('/', optionalAuth, createInquiry);

router.put('/:id/reply', protect, authorize('agent', 'admin'), replyInquiry);
router.put('/:id/status', protect, authorize('agent', 'admin'), updateInquiryStatus);
router.put('/:id', protect, authorize('agent', 'admin'), updateInquiryStatus);

module.exports = router;
