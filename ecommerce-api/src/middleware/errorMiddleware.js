const { formatResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error caught by errorMiddleware:', err);

  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => e.message).join(', ');
    return formatResponse(res, 409, false, `Duplicate Entry: ${message}`);
  }

  // Handle Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    return formatResponse(res, 400, false, `Validation Error: ${message}`);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return formatResponse(res, 401, false, 'Invalid or expired token');
  }

  // Handle general errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return formatResponse(res, statusCode, false, message);
};

module.exports = errorMiddleware;
