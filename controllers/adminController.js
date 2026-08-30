const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      res.status(400);
      return next(new Error('Please provide status as active or suspended'));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Delete user's jobs if they are an employer
    if (user.role === 'employer') {
      await Job.deleteMany({ employer: user._id });
    }

    // Delete user's applications if they are a job seeker
    if (user.role === 'seeker') {
      await Application.deleteMany({ jobSeeker: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and their related data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (including closed jobs)
// @route   GET /api/admin/jobs
// @access  Private/Admin
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('employer', 'name email');
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a job by ID
// @route   GET /api/admin/jobs/:id
// @access  Private/Admin
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) {
      res.status(404);
      return next(new Error('Job posting not found'));
    }
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/remove appropriate job posting
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      return next(new Error('Job posting not found'));
    }

    // Delete applications for this job first
    await Application.deleteMany({ job: job._id });

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and related applications deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const seekerCount = await User.countDocuments({ role: 'seeker' });
    const employerCount = await User.countDocuments({ role: 'employer' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          seekers: seekerCount,
          employers: employerCount,
          admins: adminCount
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          closed: closedJobs
        },
        applications: {
          total: totalApplications
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  getJobById,
  deleteJob,
  getPlatformStats
};
