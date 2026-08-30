const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Application must be linked to a job']
  },
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Application must be linked to a job seeker']
  },
  coverLetter: {
    type: String,
    trim: true
  },
  resumeLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a job seeker cannot apply for the same job more than once
ApplicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
