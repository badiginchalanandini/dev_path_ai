import React from 'react';

const InterviewPrepView = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel content-card">
        <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem', fontSize: '1.4rem' }}>🎯 Targeted Interview Preparation</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {data.map((topic, idx) => (
            <div key={idx} style={{ padding: '1.2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '1.1rem' }}>{topic.topicName}</h4>
                <span className="badge badge-warning">{topic.difficulty}</span>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '6px' }}>
                <strong>Key Mock Question:</strong> "{topic.sampleQuestion}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepView;
