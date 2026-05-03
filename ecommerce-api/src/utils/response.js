/**
 * Helper to format consistent API responses
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Indicates if the request was successful
 * @param {string} message - Descriptive message
 * @param {any} [data=null] - Optional data payload
 */
const formatResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (success) {
    response.data = data;
  } else {
    response.errors = data || [];
  }

  return res.status(statusCode).json(response);
};

module.exports = { formatResponse };
