// Custom Operational Error Class
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 404 Route Not Found Middleware
const notFoundHandler = (req, res, next) => {
  const error = new ErrorResponse(`Resource Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Centralized Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error details to server console
  console.error(`🔥 [API ERROR] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // MySQL Duplicate Entry (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate field value entered.';
    error.statusCode = 400;
  }

  // JWT Verification Error
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid authentication token. Please log in again.';
    error.statusCode = 401;
  }

  // JWT Expiration Error
  if (err.name === 'TokenExpiredError') {
    error.message = 'Authentication token expired. Please log in again.';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  ErrorResponse,
  notFoundHandler,
  errorHandler
};
