const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Adjust expiry based on config
  if (process.env.JWT_EXPIRE && process.env.JWT_EXPIRE.endsWith('d')) {
    const days = parseInt(process.env.JWT_EXPIRE);
    options.expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  // Remove password from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    profile: user.profile
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: userResponse
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, profile } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    // Set default profile if seeker is registering with profile details
    let profileData = {};
    if (role === 'seeker') {
      profileData = {
        skills: profile?.skills || [],
        experience: profile?.experience || [],
        education: profile?.education || []
      };
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'seeker',
      profile: profileData
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      res.status(403);
      return next(new Error('Your account has been suspended by an administrator'));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Basic fields update
    user.name = req.body.name || user.name;

    // Seeker-only profile details
    if (user.role === 'seeker') {
      if (req.body.profile) {
        user.profile.skills = req.body.profile.skills || user.profile.skills;
        user.profile.experience = req.body.profile.experience || user.profile.experience;
        user.profile.education = req.body.profile.education || user.profile.education;
      }
    }

    // Handle password update if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Remove password from response
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      profile: updatedUser.profile
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile
};
