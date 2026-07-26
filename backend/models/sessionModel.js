const { pool } = require('../config/db');

class SessionModel {
  // Store new session token
  static async createSession(userId, sessionToken, userAgent, ipAddress, expiresAt) {
    const [result] = await pool.query(
      'INSERT INTO user_sessions (user_id, session_token, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [userId, sessionToken, userAgent || '', ipAddress || '', expiresAt]
    );
    return result.insertId;
  }

  // Find active session by token
  static async findSession(sessionToken) {
    const [rows] = await pool.query(
      'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    return rows[0] || null;
  }

  // Delete specific session (Logout)
  static async deleteSession(sessionToken) {
    await pool.query('DELETE FROM user_sessions WHERE session_token = ?', [sessionToken]);
  }

  // Delete all sessions for a user (Password reset or global logout)
  static async deleteAllUserSessions(userId) {
    await pool.query('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
  }
}

module.exports = SessionModel;
