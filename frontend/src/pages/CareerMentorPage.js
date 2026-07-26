import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RoadmapView from '../components/RoadmapView';
import SkillGapView from '../components/SkillGapView';
import LearningPlanView from '../components/LearningPlanView';
import Loading from '../components/Loading';
import { aiAPI } from '../services/api';

const CareerMentorPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('roadmap');
  const navigate = useNavigate();

  const normalizeInsights = (raw) => {
    if (!raw) return null;
    return {
      roadmap: raw.roadmap || raw.roadmap_90_day,
      skillGap: raw.skillGap || raw.skill_gap_analysis,
      learningPlan: raw.learningPlan || raw.weekly_learning_plan,
      monthlyGoals: raw.monthlyGoals || raw.monthly_goals,
      courses: raw.courses || raw.recommended_courses,
      books: raw.books,
      youtubeChannels: raw.youtubeChannels || raw.youtube_channels,
      projects: raw.projects || raw.projects_to_build,
      interviewPrep: raw.interviewPrep || raw.interview_topics
    };
  };

  const fetchCareerInsights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiAPI.getAllInsights();
      if (res.data && res.data.data) {
        setInsights(normalizeInsights(res.data.data));
      } else {
        setError('No career roadmap found. Please complete your student profile on the dashboard to generate your AI mentorship insights.');
      }
    } catch (err) {
      setError('No career roadmap found. Please complete your student profile on the dashboard to generate your AI mentorship insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareerInsights();
  }, [fetchCareerInsights]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Page Header */}
        <div className="glass-panel content-card">
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🗺️ AI Career Mentor & Roadmap Navigator</h2>
          <p style={{ color: '#94a3b8' }}>
            Structured learning timeline stages, skill match scoring, and missing competency fixes.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading AI Career Mentor data..." />
        ) : error || !insights ? (
          <div className="glass-panel content-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <span style={{ fontSize: '3rem' }}>🎯</span>
            <h3 style={{ fontSize: '1.4rem', marginTop: '1rem', color: '#f8fafc' }}>Student Profile Not Completed</h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '10px auto 1.5rem' }}>
              Fill out your education background, current skills, and target role on the dashboard to generate your custom AI career mentorship plan.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              ⚡ Complete Profile on Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* View Navigation Tabs */}
            <div className="tab-container">
              <button
                className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
                onClick={() => setActiveTab('roadmap')}
              >
                🗺️ 90-Day Roadmap
              </button>
              <button
                className={`tab-btn ${activeTab === 'skillgap' ? 'active' : ''}`}
                onClick={() => setActiveTab('skillgap')}
              >
                ⚡ Skill Gap Analysis
              </button>
              <button
                className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
              >
                📅 Learning Timetable
              </button>
            </div>

            {/* Sub-View Renderers */}
            {activeTab === 'roadmap' && <RoadmapView data={insights.roadmap} />}
            {activeTab === 'skillgap' && <SkillGapView data={insights.skillGap} />}
            {activeTab === 'learning' && <LearningPlanView data={insights.learningPlan} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerMentorPage;
