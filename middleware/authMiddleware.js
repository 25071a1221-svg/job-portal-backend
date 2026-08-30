const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Get token from cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      return next(new Error('User not found'));
    }

    // Check if user is suspended
    if (req.user.status === 'suspended') {
      res.status(403);
      return next(new Error('Your account has been suspended by an administrator'));
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized, token failed or expired'));
  }
};

module.exports = { protect };
