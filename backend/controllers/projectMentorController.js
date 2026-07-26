const ProjectMentorModel = require('../models/projectMentorModel');
const HistoryModel = require('../models/historyModel');
const { generateProjectMentorBlueprint } = require('../services/geminiService');

exports.generateBlueprint = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Save profile inputs to MySQL
    await ProjectMentorModel.upsertProfile(userId, req.body);

    // 2. Generate blueprint via Gemini API or fallback
    const blueprint = await generateProjectMentorBlueprint(req.body);

    // 3. Save generated blueprint to MySQL
    await ProjectMentorModel.saveBlueprint(userId, blueprint);

    // 4. Push into Unified History
    await HistoryModel.createEntry(
      userId,
      'project_plan',
      `System Architecture for: ${blueprint.project_title}`,
      blueprint
    );

    res.status(200).json({
      success: true,
      message: 'Project Mentor blueprint generated and saved successfully.',
      data: blueprint
    });
  } catch (error) {
    next(error);
  }
};

exports.getBlueprint = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await ProjectMentorModel.getProfileByUserId(userId);
    const blueprint = await ProjectMentorModel.getBlueprintByUserId(userId);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'No project blueprint generated yet.'
      });
    }

    res.status(200).json({
      success: true,
      profile,
      data: {
        project_title: blueprint.project_title,
        description: blueprint.description,
        problem_statement: blueprint.problem_statement,
        features: JSON.parse(blueprint.features),
        architecture: blueprint.architecture,
        folder_structure: JSON.parse(blueprint.folder_structure),
        frontend: JSON.parse(blueprint.frontend),
        backend: JSON.parse(blueprint.backend),
        database_schema: JSON.parse(blueprint.database_schema),
        api_list: JSON.parse(blueprint.api_list),
        timeline: JSON.parse(blueprint.timeline),
        deployment: blueprint.deployment,
        testing: JSON.parse(blueprint.testing),
        future_scope: JSON.parse(blueprint.future_scope),
        interview_questions: JSON.parse(blueprint.interview_questions)
      }
    });
  } catch (error) {
    next(error);
  }
};
