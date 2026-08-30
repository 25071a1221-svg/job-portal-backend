const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  getJobById,
  deleteJob,
  getPlatformStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply admin access check to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);

router.route('/jobs')
  .get(getAllJobs);

router.route('/jobs/:id')
  .get(getJobById)
  .delete(deleteJob);

module.exports = router;
