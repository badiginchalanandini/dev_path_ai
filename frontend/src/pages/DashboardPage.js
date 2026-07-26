import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ProfileForm from '../components/ProfileForm';
import DashboardHomeView from '../components/DashboardHomeView';
import { profileAPI, aiAPI } from '../services/api';

const DashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);

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

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await profileAPI.getProfile();
      if (profileRes.data && profileRes.data.profile) {
        setProfile(profileRes.data.profile);
        const insightsRes = await aiAPI.getAllInsights();
        if (insightsRes.data && insightsRes.data.data) {
          setInsights(normalizeInsights(insightsRes.data.data));
        } else {
          setShowEditProfile(true);
        }
      } else {
        setShowEditProfile(true);
      }
    } catch (err) {
      setShowEditProfile(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleInsightsGenerated = (data) => {
    setInsights(normalizeInsights(data));
    setShowEditProfile(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {loading ? (
          <Loading message="Fetching your personalized dashboard..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadDashboardData} />
        ) : showEditProfile || !insights ? (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <h2>⚡ Profile & AI Generator</h2>
              {insights && (
                <button className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>
                  ← Back to Dashboard
                </button>
              )}
            </div>
            <ProfileForm onInsightsGenerated={handleInsightsGenerated} initialProfile={profile} />
          </div>
        ) : (
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '1.2rem 1.8rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>Student AI Career Overview</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Target Role: <strong style={{ color: '#a5b4fc' }}>{profile?.career_goal || profile?.target_role || 'Software Engineer'}</strong>
                </p>
              </div>
              <button className="btn btn-outline" onClick={() => setShowEditProfile(true)}>
                ✏️ Edit Profile & Regenerate
              </button>
            </div>

            <DashboardHomeView
              profile={profile}
              insights={insights}
              navigate={navigate}
              onEditProfile={() => setShowEditProfile(true)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
