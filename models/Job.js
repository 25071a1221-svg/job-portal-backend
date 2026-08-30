const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  employmentType: {
    type: String,
    required: [true, 'Please add an employment type'],
    enum: {
      values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      message: 'Employment type must be Full-time, Part-time, Contract, Internship, or Remote'
    }
  },
  salaryRange: {
    type: String,
    required: [true, 'Please add a salary range'],
    trim: true
  },
  requiredSkills: {
    type: [String],
    required: [true, 'Please add required skills']
  },
  experienceRequirement: {
    type: String,
    required: [true, 'Please add experience requirements'],
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  applicationDeadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please associate an employer to this job']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
