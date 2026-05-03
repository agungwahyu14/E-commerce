const { verifyToken } = require('../utils/jwt');
const { formatResponse } = require('../utils/response');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return formatResponse(res, 401, false, 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded.success) {
      return formatResponse(res, 401, false, 'Invalid or expired token');
    }

    const user = await User.findByPk(decoded.data.id);

    if (!user) {
      return formatResponse(res, 401, false, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return formatResponse(res, 500, false, 'Internal server error during authentication');
  }
};

module.exports = authMiddleware;
