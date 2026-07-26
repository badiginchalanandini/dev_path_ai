import React from 'react';

const ErrorMessage = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="alert alert-error" style={{ padding: '1.4rem' }}>
      <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>⚠️ {title}</h4>
      <p style={{ fontSize: '0.92rem' }}>{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button
          className="btn btn-secondary"
          style={{ marginTop: '10px', fontSize: '0.85rem' }}
          onClick={onRetry}
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
