const { pool } = require('../config/db');

class ProfileModel {
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM career_plans WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async upsertProfile(userId, data) {
    const {
      student_name,
      college,
      year,
      degree,
      branch,
      current_skills,
      interested_skills,
      career_goal,
      dream_company,
      daily_hours,
      cgpa
    } = data;

    const existing = await this.findByUserId(userId);

    if (existing) {
      await pool.query(
        `UPDATE career_plans SET 
          student_name = ?, college = ?, year = ?, degree = ?, branch = ?, 
          current_skills = ?, interested_skills = ?, career_goal = ?, 
          dream_company = ?, daily_hours = ?, cgpa = ? 
        WHERE user_id = ?`,
        [
          student_name,
          college,
          parseInt(year),
          degree,
          branch,
          current_skills,
          interested_skills,
          career_goal,
          dream_company,
          parseInt(daily_hours),
          parseFloat(cgpa),
          userId
        ]
      );
      return existing.id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO career_plans 
          (user_id, student_name, college, year, degree, branch, current_skills, interested_skills, career_goal, dream_company, daily_hours, cgpa) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          student_name,
          college,
          parseInt(year),
          degree,
          branch,
          current_skills,
          interested_skills,
          career_goal,
          dream_company,
          parseInt(daily_hours),
          parseFloat(cgpa)
        ]
      );
      return result.insertId;
    }
  }
}

module.exports = ProfileModel;
