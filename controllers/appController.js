const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Job Seeker
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeLink } = req.body;

    if (!jobId) {
      res.status(400);
      return next(new Error('Please provide a jobId'));
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    // Check if job is closed
    if (job.status === 'closed') {
      res.status(400);
      return next(new Error('Cannot apply to a closed job posting'));
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      res.status(400);
      return next(new Error('Application deadline has passed'));
    }

    // Check for duplicate application
    const alreadyApplied = await Application.findOne({
      job: jobId,
      jobSeeker: req.user._id
    });
    if (alreadyApplied) {
      res.status(400);
      return next(new Error('You have already applied for this job'));
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user._id,
      coverLetter,
      resumeLink
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View submitted applications (by Seeker)
// @route   GET /api/applications/my-applications
// @access  Private/Job Seeker
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user._id })
      .populate({
        path: 'job',
        select: 'title companyName location employmentType salaryRange'
      });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View applications received for a specific job (by Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    // Ensure the logged-in user is the employer of the job
    if (job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to view applications for this job'));
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('jobSeeker', 'name email profile');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (by Employer)
// @route   PUT /api/applications/:id/status
// @access  Private/Employer
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400);
      return next(new Error('Please provide status'));
    }

    // Check status values
    const allowedStatus = ['applied', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!allowedStatus.includes(status)) {
      res.status(400);
      return next(new Error(`Invalid status: must be one of ${allowedStatus.join(', ')}`));
    }

    // Find the application and populate the job to check ownership
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    // Check ownership of the job
    if (application.job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to update application status for this job'));
    }

    // Update status
    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};
