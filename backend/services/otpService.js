const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6 digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
const sendOTPEmail = async (email, otpCode) => {
  console.log(`\n========================================`);
  console.log(`🔑 DEV MODE OTP FOR [${email}]: ${otpCode}`);
  console.log(`========================================\n`);

  const mailOptions = {
    from: `"DevPath AI" <${process.env.EMAIL_USER || 'noreply@devpathai.com'}>`,
    to: email,
    subject: 'DevPath AI - Verification OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">DevPath AI Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up for DevPath AI. Please use the following 6-digit OTP code to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background: #EEF2FF; padding: 10px 20px; border-radius: 8px;">
            ${otpCode}
          </span>
        </div>
        <p>This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">DevPath AI Team &copy; 2026</p>
      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'demo@devpathai.com') {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.warn('⚠️ Nodemailer warning (Fallback to console log):', error.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
