const { pool } = require('../config/db');

class HistoryModel {
  static async createEntry(userId, type, title, payload) {
    const [result] = await pool.query(
      'INSERT INTO generation_history (user_id, type, title, payload) VALUES (?, ?, ?, ?)',
      [userId, type, title, JSON.stringify(payload)]
    );
    return result.insertId;
  }

  static async getHistory(userId, search = '', filter = '', limit = 10, offset = 0) {
    let query = 'SELECT id, type, title, payload, is_favorite, created_at FROM generation_history WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    if (filter) {
      query += ' AND type = ?';
      params.push(filter);
    }

    const cleanLimit = Math.max(1, parseInt(limit) || 10);
    const cleanOffset = Math.max(0, parseInt(offset) || 0);

    query += ` ORDER BY created_at DESC LIMIT ${cleanLimit} OFFSET ${cleanOffset}`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countHistory(userId, search = '', filter = '') {
    let query = 'SELECT COUNT(*) as total FROM generation_history WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    if (filter) {
      query += ' AND type = ?';
      params.push(filter);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async toggleFavorite(userId, id) {
    await pool.query(
      'UPDATE generation_history SET is_favorite = NOT is_favorite WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  static async deleteEntry(userId, id) {
    await pool.query('DELETE FROM generation_history WHERE id = ? AND user_id = ?', [id, userId]);
  }
}

module.exports = HistoryModel;
