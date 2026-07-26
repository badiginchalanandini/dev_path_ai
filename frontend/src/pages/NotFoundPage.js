import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div className="glass-panel content-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', color: '#6366f1', marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.8rem' }}>
          The path or resource you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          🏠 Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
