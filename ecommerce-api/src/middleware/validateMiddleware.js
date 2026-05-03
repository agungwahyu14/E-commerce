const { validationResult } = require('express-validator');
const { formatResponse } = require('../utils/response');

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return formatResponse(res, 400, false, 'Validation failed', errors.array());
  }
  next();
};

module.exports = validateMiddleware;
