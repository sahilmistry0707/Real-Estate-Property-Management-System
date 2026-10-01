const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes strictly require authentication and 'admin' role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports', getAdminReports);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/agents', getAllAgents);
router.get('/properties', getAllPropertiesAdmin);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.get('/bookings', getAllBookingsAdmin);

module.exports = router;
