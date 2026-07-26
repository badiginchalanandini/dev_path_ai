const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public Authentication Endpoints
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Authentication Endpoints
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
