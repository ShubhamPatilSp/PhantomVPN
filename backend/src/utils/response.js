/**
 * Standardized API response helpers.
 * Eliminates repetitive try/catch + res.json patterns in controllers.
 */

/**
 * Send a success response.
 * @param {Object} res - Express response
 * @param {Object} data - Response payload
 * @param {number} statusCode - HTTP status (default 200)
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send an error response.
 * @param {Object} res - Express response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status (default 500)
 * @param {Object} extra - Additional error data
 */
const sendError = (res, message = 'Internal server error', statusCode = 500, extra = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
};

/**
 * Wraps an async controller to avoid try/catch boilerplate.
 * Catches errors and passes them to Express error handler.
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { sendSuccess, sendError, asyncHandler };
