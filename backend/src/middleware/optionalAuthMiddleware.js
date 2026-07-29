const jwt = require('jsonwebtoken');
const config = require('../config/env');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded.user;
    } catch (err) {
        // token invalid, continue without user
    }
    next();
};
