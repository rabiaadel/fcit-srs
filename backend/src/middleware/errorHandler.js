const logger = require('../utils/logger');

/**
 * Central error handler
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  // Validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Database unique constraint violations
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  // Database foreign key violations
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found' });
  }

  // Known business logic errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Default 500
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return res.status(500).json({ success: false, message });
};

/**
 * 404 handler
 */
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
};

module.exports = { errorHandler, notFound };
