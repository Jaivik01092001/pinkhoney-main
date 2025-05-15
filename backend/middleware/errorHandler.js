/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = { errorHandler };
