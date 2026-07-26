import React from 'react';

const RoadmapView = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 90 Day Phases */}
      <div className="glass-panel content-card">
        <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem', fontSize: '1.4rem' }}>🗺️ 90-Day Career Roadmap</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {data.phases?.map((phase, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.2rem',
                borderLeft: '4px solid var(--primary)',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '0 8px 8px 0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>
                  {phase.timeframe} — {phase.title}
                </strong>
                <span className="badge badge-primary">Phase {phase.phaseNumber}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '8px' }}>{phase.focus}</p>
              <div style={{ fontSize: '0.88rem', color: '#6ee7b7' }}>
                <strong>🏆 Milestone Checkpoint:</strong> {phase.milestone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
