const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Read Access Token from HTTP-only cookie OR Authorization Bearer header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'access_secret_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      isExpired: error.name === 'TokenExpiredError',
      message: 'Access token expired or invalid.'
    });
  }
};

module.exports = { protect };
