const express = require('express');
const router = express.Router();
const {
  createVisit,
  getUserVisits,
  getAgentVisits,
  updateVisitStatus,
} = require('../controllers/visitController');
const Visit = require('../models/Visit');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// General list handler based on user role
router.get('/', protect, async (req, res, next) => {
  if (req.user.role === 'admin') {
    try {
      const visits = await Visit.find()
        .populate('user', 'fullName email phone')
        .populate('agent', 'fullName email phone')
        .populate('property', 'title price images address city')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: visits.length, visits });
    } catch (error) {
      return next(error);
    }
  } else if (req.user.role === 'agent') {
    return getAgentVisits(req, res, next);
  } else {
    return getUserVisits(req, res, next);
  }
});

router.get('/my-visits', protect, authorize('user'), getUserVisits);
router.get('/agent-visits', protect, authorize('agent', 'admin'), getAgentVisits);

router.post('/', protect, authorize('user'), createVisit);

router.put('/:id/status', protect, authorize('agent', 'admin'), updateVisitStatus);
router.put('/:id', protect, authorize('agent', 'admin'), updateVisitStatus);

module.exports = router;
