const { generateCareerMentorInsights, generateRecommendedProjectBlueprint, callGeminiStreamAPI } = require('../services/geminiService');
const CareerMentorModel = require('../models/careerMentorModel');
const ProfileModel = require('../models/profileModel');
const HistoryModel = require('../models/historyModel');

// Streaming SSE endpoint for Career Mentor
exports.streamCareerInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Please complete your student profile inputs before generating career insights.'
      });
    }

    // Set Headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullTextBuffer = '';

    const prompt = `
      You are an elite career mentor. Create a structured mentorship package for:
      Name: ${profile.student_name}
      College: ${profile.college}
      Year: ${profile.year}
      Degree: ${profile.degree} in ${profile.branch}
      Current Skills: ${profile.current_skills}
      Interested Skills: ${profile.interested_skills}
      Career Goal: ${profile.career_goal}
      Dream Company: ${profile.dream_company}
      Daily Hours: ${profile.daily_hours} hrs/day
      Current CGPA: ${profile.cgpa}

      Return JSON matching this exact structure:
      {
        "skill_gap_analysis": {
          "matchPercentage": 75,
          "acquiredSkills": ["skill1"],
          "missingSkills": [{"skill": "skill", "importance": "High", "reason": "reason", "howToLearn": "how"}]
        },
        "roadmap_90_day": {
          "title": "90 Day Career Roadmap",
          "phases": [
            {"phaseNumber": 1, "timeframe": "Days 1-30", "title": "Phase Title", "focus": "Focus", "milestone": "Milestone"}
          ]
        },
        "weekly_learning_plan": {
          "weeks": [
            {"weekNumber": 1, "theme": "Theme", "dailyBreakdown": [{"day": "Day 1-2", "topic": "Topic", "hours": 3}]}
          ]
        },
        "monthly_goals": [
          {"month": 1, "goal": "Goal 1", "metrics": "Metrics"}
        ],
        "recommended_courses": [
          {"title": "Course Title", "platform": "Coursera/Udemy/etc", "reason": "Why this course"}
        ],
        "books": [
          {"title": "Book Name", "author": "Author", "keyTakeaway": "Takeaway"}
        ],
        "youtube_channels": [
          {"name": "Channel Name", "focus": "What they teach"}
        ],
        "projects_to_build": [
          {"title": "Project Title 1", "difficulty": "Medium", "description": "Description of project 1", "techStack": ["React", "Node.js"]},
          {"title": "Project Title 2", "difficulty": "Hard", "description": "Description of project 2", "techStack": ["Go", "Redis", "Docker"]},
          {"title": "Project Title 3", "difficulty": "Easy", "description": "Description of project 3", "techStack": ["JavaScript", "HTML", "CSS"]}
        ],
        "interview_topics": [
          {"topicName": "Topic", "difficulty": "Medium", "sampleQuestion": "Question"}
        ]
      }
    `;

    // Stream from Gemini
    await callGeminiStreamAPI(prompt, (chunk) => {
      fullTextBuffer += chunk;
      // Write chunk to client stream
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Save final parsed results to MySQL
    let finalData;
    try {
      finalData = JSON.parse(fullTextBuffer);
      await CareerMentorModel.saveResults(userId, finalData);
    } catch (dbErr) {
      console.warn('⚠️ Stream finished but buffer parsing/save failed. Saving fallback insights.');
      finalData = await generateCareerMentorInsights(profile);
      await CareerMentorModel.saveResults(userId, finalData);
    }

    // Push into History
    await HistoryModel.createEntry(
      userId,
      'career_plan',
      `Career Path to ${profile.career_goal} at ${profile.dream_company}`,
      finalData
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('🔥 Streaming Error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

exports.generateAllInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await ProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    const insights = await generateCareerMentorInsights(profile);
    await CareerMentorModel.saveResults(userId, insights);

    // Push into History
    await HistoryModel.createEntry(
      userId,
      'career_plan',
      `Career Path to ${profile.career_goal} at ${profile.dream_company}`,
      insights
    );

    res.status(200).json({ success: true, message: 'Insights generated successfully.', data: insights });
  } catch (error) {
    next(error);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const results = await CareerMentorModel.getResults(userId);
    if (!results) {
      return res.status(404).json({ success: false, message: 'No insights generated yet.' });
    }
    const safeParse = (field) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (err) {
          console.warn('⚠️ safeParse warning:', err.message);
        }
      }
      return field;
    };

    res.status(200).json({
      success: true,
      data: {
        skillGap: safeParse(results.skill_gap_analysis),
        roadmap: safeParse(results.roadmap_90_day),
        learningPlan: safeParse(results.weekly_learning_plan),
        monthlyGoals: safeParse(results.monthly_goals),
        courses: safeParse(results.recommended_courses),
        books: safeParse(results.books),
        youtubeChannels: safeParse(results.youtube_channels),
        projects: safeParse(results.projects_to_build),
        interviewTopics: safeParse(results.interview_topics)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.generateProjectBlueprint = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { projectTitle } = req.body;

    if (!projectTitle) {
      return res.status(400).json({ success: false, message: 'Project Title is required.' });
    }

    // Fetch user profile for personalization
    const profile = await ProfileModel.findByUserId(userId);

    // Call service to generate blueprint
    const blueprint = await generateRecommendedProjectBlueprint(projectTitle, profile);

    res.status(200).json({
      success: true,
      data: blueprint
    });
  } catch (error) {
    next(error);
  }
};
