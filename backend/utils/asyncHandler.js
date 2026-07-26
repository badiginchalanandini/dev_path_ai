// Async Handler Utility to eliminate try-catch boilerplate in Controllers

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
