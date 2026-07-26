import React, { useState, useEffect } from 'react';

const DashboardHomeView = ({ profile, insights, navigate, onEditProfile }) => {
  // Mock notifications for dashboard
  const notifications = [
    { title: '🔒 Account Secured', msg: 'JWT Access & Refresh Token cookies verified.', time: 'Just now' },
    { title: '🗺️ AI Roadmap Generated', msg: 'Your 90-day learning path is ready.', time: '10 mins ago' },
    { title: '🚀 Flagship Project Ready', msg: 'System architecture blueprint constructed.', time: '1 hour ago' }
  ];

  const storageKey = `devpath_milestones_${profile?.id || 'default'}`;

  // Helper to extract milestones from insights weekly plan
  const getInitialMilestones = () => {
    const weeks = insights?.learningPlan?.weeks;
    if (weeks && Array.isArray(weeks)) {
      return weeks.map(w => ({
        id: `week-${w.weekNumber}`,
        label: `Week ${w.weekNumber}`,
        task: w.theme || 'Core Study Topics',
        done: false
      }));
    }
    // Fallback standard 4 weeks
    return [
      { id: 'week-1', label: 'Week 1', task: 'Core Setup & Git workflows', done: false },
      { id: 'week-2', label: 'Week 2', task: 'REST APIs & Database modeling', done: false },
      { id: 'week-3', label: 'Week 3', task: 'Authentication & state integration', done: false },
      { id: 'week-4', label: 'Week 4', task: 'Testing, QA, and deployment setups', done: false }
    ];
  };

  const [milestones, setMilestones] = useState(() => {
    const initial = getInitialMilestones();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return initial.map(item => {
          const match = parsed.find(p => p.id === item.id);
          return match ? { ...item, done: match.done } : item;
        });
      }
    } catch (e) {
      console.warn('Error reading milestones from localStorage:', e);
    }
    return initial;
  });

  // Sync state if insights or profile changes
  useEffect(() => {
    const initial = getInitialMilestones();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = initial.map(item => {
          const match = parsed.find(p => p.id === item.id);
          return match ? { ...item, done: match.done } : item;
        });
        setMilestones(merged);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    setMilestones(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights, profile?.id]);

  const handleToggle = (id) => {
    const updated = milestones.map(m => m.id === id ? { ...m, done: !m.done } : m);
    setMilestones(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving milestones to localStorage:', e);
    }
  };

  // Calculations
  const total = milestones.length;
  const completed = milestones.filter(m => m.done).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP METRIC CARDS */}
      <div className="grid-3">
        <div className="glass-panel content-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🗺️ ACTIVE ROADMAPS</span>
          <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>1 Active</h2>
          <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Target: {profile?.career_goal || 'Software Engineer'}</span>
        </div>

        <div className="glass-panel content-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🚀 SAVED BLUEPRINTS</span>
          <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>3 Projects</h2>
          <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>Difficulty: Intermediate</span>
        </div>

        <div className="glass-panel content-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎓 COMPLETED LEARNING</span>
          <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>{percent}% Done</h2>
          <div style={{ height: '6px', width: '100%', background: '#1e293b', borderRadius: '3px', marginTop: '8px' }}>
            <div style={{ height: '100%', width: `${percent}%`, background: 'var(--success)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* LEFT COLUMN: PROGRESS GRAPH & TIMELINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Progress Timeline */}
          <div className="glass-panel content-card">
            <h3 style={{ color: '#a5b4fc', marginBottom: '1rem' }}>📈 Weekly Progress Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => handleToggle(milestone.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: milestone.done ? 'rgba(110, 231, 183, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                    border: milestone.done ? '1px solid rgba(110, 231, 183, 0.2)' : '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <strong style={{ color: milestone.done ? '#6ee7b7' : '#94a3b8' }}>
                      {milestone.label}
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: milestone.done ? '#cbd5e1' : '#94a3b8', marginTop: '2px' }}>{milestone.task}</p>
                  </div>
                  <span className={`badge ${milestone.done ? 'badge-success' : 'badge-outline'}`} style={{ textTransform: 'none' }}>
                    {milestone.done ? '✓ Done' : 'Mark Done'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-panel content-card">
            <h3 style={{ color: '#a5b4fc', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/career-mentor')}>
                🗺️ View Career Mentor
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/project-mentor')}>
                🏗️ Design Flagship Project
              </button>
              <button className="btn btn-outline" onClick={onEditProfile}>
                ✏️ Edit Student Form
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: NOTIFICATIONS & PROFILE MINI-CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Sidebar Info */}
          <div className="glass-panel content-card" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>👤 Student Profile</h3>
            <div style={{ fontSize: '0.9rem' }}>
              <p style={{ color: '#f8fafc', fontWeight: 600 }}>{profile?.student_name}</p>
              <p style={{ color: '#94a3b8' }}>{profile?.college}</p>
              <p style={{ color: '#a5b4fc', fontSize: '0.85rem', marginTop: '4px' }}>
                {profile?.degree} — CGPA: {profile?.cgpa}
              </p>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="glass-panel content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🔔 Notifications</h3>
              <span className="badge badge-warning">3 New</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  <strong style={{ color: '#f8fafc' }}>{notif.title}</strong>
                  <p style={{ color: '#94a3b8', marginTop: '2px' }}>{notif.msg}</p>
                  <span style={{ fontSize: '0.75rem', color: '#a5b4fc', display: 'block', marginTop: '4px' }}>
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardHomeView;
