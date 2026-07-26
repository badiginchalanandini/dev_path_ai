import React from 'react';

const Loading = ({ message = 'Loading AI content...' }) => {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }} className="glass-panel">
      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
      <p style={{ color: '#a5b4fc', fontWeight: 600 }}>{message}</p>
    </div>
  );
};

export default Loading;
