const rateLimitStore = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const timeframe = 60 * 1000; // 1 minute
  const maxRequests = 5;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requestTimes = rateLimitStore.get(ip).filter((time) => now - time < timeframe);
  requestTimes.push(now);
  rateLimitStore.set(ip, requestTimes);

  if (requestTimes.length > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. You can only perform 5 AI generations per minute.'
    });
  }

  next();
};

module.exports = rateLimiter;
