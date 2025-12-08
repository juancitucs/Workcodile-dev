const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // If no token, continue without setting user
  if (!token) {
    return next();
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    // If token is not valid, continue without setting user
    next();
  }
};
