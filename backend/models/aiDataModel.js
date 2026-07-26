const { pool } = require('../config/db');

class AiDataModel {
  // 1. Roadmap
  static async saveRoadmap(userId, targetRole, roadmapData) {
    await pool.query('DELETE FROM career_roadmaps WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO career_roadmaps (user_id, target_role, roadmap_data) VALUES (?, ?, ?)',
      [userId, targetRole, JSON.stringify(roadmapData)]
    );
    return result.insertId;
  }

  static async getRoadmap(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM career_roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0] ? rows[0].roadmap_data : null;
  }

  // 2. Skill Gap
  static async saveSkillGap(userId, gapData) {
    await pool.query('DELETE FROM skill_gaps WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO skill_gaps (user_id, gap_data) VALUES (?, ?)',
      [userId, JSON.stringify(gapData)]
    );
    return result.insertId;
  }

  static async getSkillGap(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM skill_gaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0] ? rows[0].gap_data : null;
  }

  // 3. Learning Plan
  static async saveLearningPlan(userId, planData) {
    await pool.query('DELETE FROM learning_plans WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO learning_plans (user_id, plan_data) VALUES (?, ?)',
      [userId, JSON.stringify(planData)]
    );
    return result.insertId;
  }

  static async getLearningPlan(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM learning_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0] ? rows[0].plan_data : null;
  }

  // 4. Projects
  static async saveProjects(userId, projectsData) {
    await pool.query('DELETE FROM project_recommendations WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO project_recommendations (user_id, projects_data) VALUES (?, ?)',
      [userId, JSON.stringify(projectsData)]
    );
    return result.insertId;
  }

  static async getProjects(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM project_recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0] ? rows[0].projects_data : null;
  }

  // 5. Interview Prep
  static async saveInterviewPrep(userId, prepData) {
    await pool.query('DELETE FROM interview_preps WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO interview_preps (user_id, prep_data) VALUES (?, ?)',
      [userId, JSON.stringify(prepData)]
    );
    return result.insertId;
  }

  static async getInterviewPrep(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM interview_preps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0] ? rows[0].prep_data : null;
  }
}

module.exports = AiDataModel;
