import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ProjectsView from '../components/ProjectsView';
import { projectMentorAPI, aiAPI } from '../services/api';

const ProjectMentorPage = () => {
  const [formData, setFormData] = useState({
    skills: '',
    domain: '',
    difficulty: 'Intermediate',
    available_time: '4 Weeks',
    team_size: 1,
    language: 'JavaScript / Node.js'
  });

  const [blueprint, setBlueprint] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' or 'recommended'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Blueprint if it exists
      try {
        const res = await projectMentorAPI.getBlueprint();
        if (res.data && res.data.success) {
          setBlueprint(res.data.data);
          if (res.data.profile) {
            setFormData({
              skills: res.data.profile.skills,
              domain: res.data.profile.domain,
              difficulty: res.data.profile.difficulty,
              available_time: res.data.profile.available_time,
              team_size: res.data.profile.team_size,
              language: res.data.profile.language
            });
          }
        }
      } catch (bpErr) {
        // No blueprint saved yet, which is fine
      }

      // 2. Fetch Career Insights (for Recommended Projects)
      try {
        const insightsRes = await aiAPI.getAllInsights();
        if (insightsRes.data && insightsRes.data.data) {
          const raw = insightsRes.data.data;
          setInsights({
            projects: raw.projects || raw.projects_to_build
          });
        }
      } catch (insightsErr) {
        // No insights saved yet, which is fine
      }
    } catch (err) {
      setError('Error loading Project Mentor resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      const res = await projectMentorAPI.generateBlueprint(formData);
      if (res.data && res.data.success) {
        setBlueprint(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating blueprint.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Page Header */}
        <div className="glass-panel content-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🚀 AI Project Mentor</h2>
          <p style={{ color: '#94a3b8' }}>
            Input your technical skills and domain to generate comprehensive flagship system plans.
          </p>
        </div>

        {/* View Navigation Tabs */}
        <div className="tab-container" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab-btn ${activeTab === 'blueprint' ? 'active' : ''}`}
            onClick={() => setActiveTab('blueprint')}
          >
            🏗️ Flagship Blueprint
          </button>
          <button
            className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            🚀 Recommended Projects
          </button>
        </div>

        {loading ? (
          <Loading message="Loading Project Mentor details..." />
        ) : activeTab === 'recommended' ? (
          insights && insights.projects ? (
            <ProjectsView data={insights.projects} />
          ) : (
            <div className="glass-panel content-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <span style={{ fontSize: '3rem' }}>💡</span>
              <h3 style={{ fontSize: '1.4rem', marginTop: '1rem', color: '#f8fafc' }}>No Recommended Projects</h3>
              <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '10px auto 1.5rem' }}>
                Complete your Career Mentor student profile on the dashboard to view personalized AI recommendations.
              </p>
            </div>
          )
        ) : (
          <>
            {/* Input Form */}
            <form className="glass-panel content-card" onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: '1.2rem', color: '#a5b4fc' }}>📝 Project Scope Definition</h3>
              {error && <ErrorMessage message={error} />}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Available Skills (Comma Separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    name="skills"
                    required
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, CSS, Express, MySQL"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Project Domain</label>
                  <input
                    type="text"
                    className="form-input"
                    name="domain"
                    required
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="E-Commerce, Social Network, Finance"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Difficulty Target</label>
                  <select className="form-select" name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Dev Time</label>
                  <input
                    type="text"
                    className="form-input"
                    name="available_time"
                    required
                    value={formData.available_time}
                    onChange={handleChange}
                    placeholder="4 Weeks / 2 Months"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Team Size</label>
                  <input
                    type="number"
                    className="form-input"
                    name="team_size"
                    min={1}
                    max={20}
                    required
                    value={formData.team_size}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Language / Tech Preference</label>
                  <input
                    type="text"
                    className="form-input"
                    name="language"
                    required
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="JavaScript (React / Node)"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '14px' }}
                disabled={actionLoading}
              >
                {actionLoading ? '🧠 Architectural planning in progress...' : '🏗️ Generate AI Project Blueprint'}
              </button>
            </form>

            {/* AI Generated Blueprint Output */}
            {blueprint && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="glass-panel content-card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <span className="badge badge-success">Flagship Project Concept</span>
                  <h3 style={{ fontSize: '1.6rem', marginTop: '8px', color: '#f8fafc' }}>
                    ⚡ {blueprint.project_title}
                  </h3>
                  <p style={{ marginTop: '10px', color: '#e2e8f0' }}>{blueprint.description}</p>
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: '6px' }}>
                    <strong style={{ color: '#a5b4fc' }}>Problem Statement:</strong>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>{blueprint.problem_statement}</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '1rem' }}>📋 Core Features & Requirements</h3>
                  <ul style={{ paddingLeft: '20px', color: '#e2e8f0' }}>
                    {blueprint.features?.map((feat, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{feat}</li>)}
                  </ul>
                </div>

                {/* System Architecture */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '8px' }}>⚙️ System Architecture Overview</h3>
                  <p style={{ color: '#e2e8f0' }}>{blueprint.architecture}</p>
                </div>

                {/* Tech Components Stack & Folder Structure */}
                <div className="grid-2">
                  <div className="glass-panel content-card">
                    <h3 style={{ color: '#a5b4fc', marginBottom: '10px' }}>📦 Technical Layout</h3>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: '#6ee7b7' }}>Frontend Components:</strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0 12px' }}>
                        {blueprint.frontend?.components?.map((c, i) => (
                          <span key={i} className="badge badge-primary" style={{ textTransform: 'none' }}>{c}</span>
                        ))}
                      </div>
                      <strong style={{ color: '#6ee7b7' }}>Backend Middlewares:</strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {blueprint.backend?.middlewares?.map((m, i) => (
                          <span key={i} className="badge badge-success" style={{ textTransform: 'none' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel content-card">
                    <h3 style={{ color: '#a5b4fc', marginBottom: '10px' }}>📂 Folder Directory Tree</h3>
                    <pre style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', color: '#6ee7b7', fontSize: '0.82rem' }}>
                      {JSON.stringify(blueprint.folder_structure, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* DB Schema */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '12px' }}>🗄️ Relational Database Schema</h3>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {blueprint.database_schema?.map((tbl, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: '6px', minWidth: '220px' }}>
                        <strong style={{ color: '#6ee7b7' }}>Table: {tbl.table}</strong>
                        <ul style={{ paddingLeft: '14px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                          {tbl.columns?.map((col, cIdx) => <li key={cIdx}>{col}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '10px' }}>🌐 REST API Definition List</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '6px', color: '#94a3b8' }}>Method</th>
                        <th style={{ padding: '6px', color: '#94a3b8' }}>Path</th>
                        <th style={{ padding: '6px', color: '#94a3b8' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprint.api_list?.map((api, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 6px', color: '#ef4444', fontWeight: 700 }}>{api.method}</td>
                          <td style={{ padding: '8px 6px', color: '#6ee7b7', fontWeight: 600 }}>{api.path}</td>
                          <td style={{ padding: '8px 6px', color: '#e2e8f0' }}>{api.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Timeline */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '10px' }}>📅 Development Milestone Timeline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {blueprint.timeline?.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#e2e8f0' }}>{t.milestone}</span>
                        <strong style={{ color: '#a5b4fc' }}>{t.duration}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment & Testing */}
                <div className="grid-2">
                  <div className="glass-panel content-card">
                    <h3 style={{ color: '#a5b4fc', marginBottom: '8px' }}>☁️ Deployment Plan</h3>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{blueprint.deployment}</p>
                  </div>

                  <div className="glass-panel content-card">
                    <h3 style={{ color: '#a5b4fc', marginBottom: '8px' }}>🧪 Testing Matrix</h3>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      {blueprint.testing?.map((t, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{t}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Future Scope */}
                <div className="glass-panel content-card">
                  <h3 style={{ color: '#a5b4fc', marginBottom: '8px' }}>🔮 Future Enhancement Scope</h3>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    {blueprint.future_scope?.map((scope, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{scope}</li>)}
                  </ul>
                </div>

                {/* Technical Interview Questions */}
                <div className="glass-panel content-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <h3 style={{ color: '#a5b4fc', marginBottom: '12px' }}>🎯 Flagship Defense Interview Prep</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {blueprint.interview_questions?.map((q, idx) => (
                      <div key={idx}>
                        <strong style={{ color: '#fcd34d', fontSize: '0.95rem' }}>Q: {q.question}</strong>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '3px' }}>A: {q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProjectMentorPage;
