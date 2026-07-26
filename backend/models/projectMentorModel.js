const { pool } = require('../config/db');

class ProjectMentorModel {
  // Find project mentor profile inputs
  static async getProfileByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM project_mentor_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  // Save / Update project mentor profile inputs
  static async upsertProfile(userId, data) {
    const { skills, domain, difficulty, available_time, team_size, language } = data;
    const existing = await this.getProfileByUserId(userId);

    if (existing) {
      await pool.query(
        `UPDATE project_mentor_profiles SET 
          skills = ?, domain = ?, difficulty = ?, 
          available_time = ?, team_size = ?, language = ? 
        WHERE user_id = ?`,
        [skills, domain, difficulty, available_time, parseInt(team_size), language, userId]
      );
      return existing.id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO project_mentor_profiles 
          (user_id, skills, domain, difficulty, available_time, team_size, language) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, skills, domain, difficulty, available_time, parseInt(team_size), language]
      );
      return result.insertId;
    }
  }

  // Find saved project mentor blueprint
  static async getBlueprintByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM project_mentor_blueprints WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  // Save / Update generated project mentor blueprint
  static async saveBlueprint(userId, blueprint) {
    const {
      project_title,
      description,
      problem_statement,
      features,
      architecture,
      folder_structure,
      frontend,
      backend,
      database_schema,
      api_list,
      timeline,
      deployment,
      testing,
      future_scope,
      interview_questions
    } = blueprint;

    const existing = await this.getBlueprintByUserId(userId);

    if (existing) {
      await pool.query(
        `UPDATE project_mentor_blueprints SET 
          project_title = ?, description = ?, problem_statement = ?, 
          features = ?, architecture = ?, folder_structure = ?, 
          frontend = ?, backend = ?, database_schema = ?, 
          api_list = ?, timeline = ?, deployment = ?, 
          testing = ?, future_scope = ?, interview_questions = ? 
        WHERE user_id = ?`,
        [
          project_title,
          description,
          problem_statement,
          JSON.stringify(features),
          architecture,
          JSON.stringify(folder_structure),
          JSON.stringify(frontend),
          JSON.stringify(backend),
          JSON.stringify(database_schema),
          JSON.stringify(api_list),
          JSON.stringify(timeline),
          deployment,
          JSON.stringify(testing),
          JSON.stringify(future_scope),
          JSON.stringify(interview_questions),
          userId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO project_mentor_blueprints 
          (user_id, project_title, description, problem_statement, features, architecture, folder_structure, frontend, backend, database_schema, api_list, timeline, deployment, testing, future_scope, interview_questions) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          project_title,
          description,
          problem_statement,
          JSON.stringify(features),
          architecture,
          JSON.stringify(folder_structure),
          JSON.stringify(frontend),
          JSON.stringify(backend),
          JSON.stringify(database_schema),
          JSON.stringify(api_list),
          JSON.stringify(timeline),
          deployment,
          JSON.stringify(testing),
          JSON.stringify(future_scope),
          JSON.stringify(interview_questions)
        ]
      );
    }
  }
}

module.exports = ProjectMentorModel;
