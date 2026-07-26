const { pool } = require('../config/db');

class OtpModel {
  // Save OTP code with expiration
  static async saveOtp(email, otpCode, expiresAt) {
    // Delete any old OTPs for this email first
    try {
      await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
    } catch (e) {
      await pool.query('DELETE FROM otps WHERE email = ?', [email]);
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
        [email, otpCode, expiresAt]
      );
      return result.insertId;
    } catch (e) {
      const [result] = await pool.query(
        'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
        [email, otpCode, expiresAt]
      );
      return result.insertId;
    }
  }

  // Get valid non-expired OTP for email
  static async findValidOtp(email, otpCode) {
    let rows;
    try {
      [rows] = await pool.query(
        'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email, otpCode]
      );
    } catch (e) {
      [rows] = await pool.query(
        'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email, otpCode]
      );
    }
    return rows[0] || null;
  }

  // Clear OTP after successful usage
  static async deleteOtp(email) {
    try {
      await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
    } catch (e) {
      await pool.query('DELETE FROM otps WHERE email = ?', [email]);
    }
  }
}

module.exports = OtpModel;
