import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        width: '100%',
        marginTop: '3rem',
        padding: '1.5rem 2rem',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.88rem'
      }}
    >
      <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontWeight: 600, color: '#f8fafc' }}>
          ⚡ DevPath AI — Plan Your Career. Build Flagship Projects. Get Internship Ready.
        </p>
        <p style={{ fontSize: '0.82rem' }}>
          © 2026 DevPath AI Platform. Powered by Node.js, Express, MySQL & Gemini AI.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
