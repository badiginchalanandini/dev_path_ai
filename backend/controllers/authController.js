const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const OtpModel = require('../models/otpModel');
const SessionModel = require('../models/sessionModel');
const { generateOTP, sendOTPEmail } = require('../services/otpService');
const { validateEmail, validateStrongPassword } = require('../utils/validators');

// Helper to generate Access and Refresh JWT Tokens & set HTTP-Only Cookies
const setTokenCookies = async (user, res, req) => {
  const payload = { id: user.id, email: user.email, name: user.name };

  // 1. Generate 15-minute Short-Lived Access Token
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'access_secret_key_2026', {
    expiresIn: '15m'
  });

  // 2. Generate 7-day Long-Lived Refresh Token
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'refresh_secret_key_2026', {
    expiresIn: '7d'
  });

  // Save refresh token session in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await SessionModel.createSession(
    user.id,
    refreshToken,
    req.headers['user-agent'],
    req.ip || req.connection.remoteAddress,
    expiresAt
  );

  const isProd = process.env.NODE_ENV === 'production';

  // Cookie Configurations (HTTP-Only, SameSite, Secure in Production)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

// 1. SIGNUP USER
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const passValidation = validateStrongPassword(password);
    if (!passValidation.isValid) {
      return res.status(400).json({ success: false, message: passValidation.message });
    }

    // Duplicate Email Check
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.is_verified) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!existingUser) {
      await UserModel.create(name, email, hashedPassword);
    } else {
      await UserModel.updatePassword(email, hashedPassword);
    }

    // Generate 6-digit Email OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpModel.saveOtp(email, otpCode, expiresAt);
    await sendOTPEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: 'Account created! Verification OTP code sent to your email address.',
      email,
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

// 2. VERIFY EMAIL OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP code.' });
    }

    const validOtp = await OtpModel.findValidOtp(email, otpCode);
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    await UserModel.setVerified(email);
    await OtpModel.deleteOtp(email);

    const user = await UserModel.findByEmail(email);
    const { accessToken } = await setTokenCookies(user, res, req);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to DevPath AI.',
      user: { id: user.id, name: user.name, email: user.email, is_verified: 1 },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

// 3. LOGIN USER
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    if (!user.is_verified) {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OtpModel.saveOtp(email, otpCode, expiresAt);
      await sendOTPEmail(email, otpCode);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'Account not verified. A new OTP has been sent to your email.',
        email,
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
      });
    }

    const { accessToken } = await setTokenCookies(user, res, req);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: { id: user.id, name: user.name, email: user.email, is_verified: user.is_verified },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

// 4. REFRESH TOKEN (Silent Auth Renewal)
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    const session = await SessionModel.findSession(refreshToken);
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'refresh_secret_key_2026');
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    // Issue fresh Access Token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'access_secret_key_2026',
      { expiresIn: '15m' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken,
      user
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
};

// 5. FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Return generic message for privacy/enumeration protection
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a 6-digit password reset OTP has been sent.'
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpModel.saveOtp(email, otpCode, expiresAt);
    await sendOTPEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'A 6-digit password reset OTP has been sent to your email.',
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

// 6. RESET PASSWORD
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields (email, OTP code, new password).' });
    }

    const passValidation = validateStrongPassword(newPassword);
    if (!passValidation.isValid) {
      return res.status(400).json({ success: false, message: passValidation.message });
    }

    const validOtp = await OtpModel.findValidOtp(email, otpCode);
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.updatePassword(email, hashedPassword);
    await OtpModel.deleteOtp(email);
    await SessionModel.deleteAllUserSessions(user.id); // Revoke active sessions for security

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// 7. LOGOUT USER
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await SessionModel.deleteSession(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// 8. GET CURRENT AUTHENTICATED USER
exports.getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// 9. RESEND OTP VERIFICATION
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpModel.saveOtp(email, otpCode, expiresAt);
    await sendOTPEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'A new 6-digit OTP code has been sent to your email.',
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

