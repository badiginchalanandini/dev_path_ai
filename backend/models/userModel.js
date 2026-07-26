const { pool } = require('../config/db');

class UserModel {
  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    // Map password to password_hash if present to ensure compatibility
    if (rows[0]) {
      rows[0].password = rows[0].password_hash || rows[0].password;
    }
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, profile_pic, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Create new user record
  static async create(name, email, hashedPassword) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 0)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  // Mark user account as verified
  static async setVerified(email) {
    const [result] = await pool.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
    return result.affectedRows > 0;
  }

  // Update password (for resets)
  static async updatePassword(email, hashedPassword) {
    const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [
      hashedPassword,
      email
    ]);
    return result.affectedRows > 0;
  }

  // Update core user profile fields
  static async updateProfile(id, name, email, profilePic) {
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, profile_pic = ? WHERE id = ?',
      [name, email, profilePic, id]
    );
    return result.affectedRows > 0;
  }

  // Delete user account cascade
  static async deleteUserAccount(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
