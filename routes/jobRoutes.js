const express = require('express');
const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('employer'), createJob)
  .get(getJobs);

router.get('/my-jobs', protect, authorize('employer'), getMyJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('employer'), updateJob)
  .delete(protect, authorize('employer'), deleteJob);

module.exports = router;
