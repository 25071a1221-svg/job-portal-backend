const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/appController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('seeker'), applyForJob);

router.get('/my-applications', protect, authorize('seeker'), getMyApplications);

router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);

router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
