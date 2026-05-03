const { formatResponse } = require('../utils/response');

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return formatResponse(res, 403, false, 'Access denied. Admin only.');
  }
};

module.exports = adminMiddleware;
