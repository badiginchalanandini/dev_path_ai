const { pool } = require('../config/db');

class CareerMentorModel {
  static async saveResults(userId, data) {
    const {
      skill_gap_analysis,
      roadmap_90_day,
      weekly_learning_plan,
      monthly_goals,
      recommended_courses,
      books,
      youtube_channels,
      projects_to_build,
      interview_topics
    } = data;

    // Check if results already exist for user
    const [existing] = await pool.query(
      'SELECT id FROM career_mentor_results WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE career_mentor_results SET 
          skill_gap_analysis = ?, roadmap_90_day = ?, weekly_learning_plan = ?, 
          monthly_goals = ?, recommended_courses = ?, books = ?, 
          youtube_channels = ?, projects_to_build = ?, interview_topics = ? 
        WHERE user_id = ?`,
        [
          JSON.stringify(skill_gap_analysis),
          JSON.stringify(roadmap_90_day),
          JSON.stringify(weekly_learning_plan),
          JSON.stringify(monthly_goals),
          JSON.stringify(recommended_courses),
          JSON.stringify(books),
          JSON.stringify(youtube_channels),
          JSON.stringify(projects_to_build),
          JSON.stringify(interview_topics),
          userId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO career_mentor_results 
          (user_id, skill_gap_analysis, roadmap_90_day, weekly_learning_plan, monthly_goals, recommended_courses, books, youtube_channels, projects_to_build, interview_topics) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          JSON.stringify(skill_gap_analysis),
          JSON.stringify(roadmap_90_day),
          JSON.stringify(weekly_learning_plan),
          JSON.stringify(monthly_goals),
          JSON.stringify(recommended_courses),
          JSON.stringify(books),
          JSON.stringify(youtube_channels),
          JSON.stringify(projects_to_build),
          JSON.stringify(interview_topics)
        ]
      );
    }
  }

  static async getResults(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM career_mentor_results WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }
}

module.exports = CareerMentorModel;
