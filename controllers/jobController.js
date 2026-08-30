const Job = require('../models/Job');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      description,
      location,
      employmentType,
      salaryRange,
      requiredSkills,
      experienceRequirement,
      applicationDeadline
    } = req.body;

    const job = await Job.create({
      title,
      companyName,
      description,
      location,
      employmentType,
      salaryRange,
      requiredSkills,
      experienceRequirement,
      applicationDeadline,
      employer: req.user._id
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    // Only return open jobs
    const jobs = await Job.find({ status: 'open' }).populate('employer', 'name email');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job postings by logged-in Employer
// @route   GET /api/jobs/my-jobs
// @access  Private/Employer
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');

    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private/Employer
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    // Ensure the logged-in user is the employer of the job
    if (job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to update this job posting'));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    // Ensure the logged-in user is the employer of the job
    if (job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to delete this job posting'));
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob
};
