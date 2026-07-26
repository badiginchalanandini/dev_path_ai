import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiMode, setAiMode] = useState('Standard Gemini 1.5 Flash');

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: '300px' }}>
        <div className="glass-panel content-card">
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>⚙️ Application Settings</h2>

          <div className="form-group">
            <label className="form-label">AI Mentorship Engine Model</label>
            <select
              className="form-select"
              value={aiMode}
              onChange={(e) => setAiMode(e.target.value)}
            >
              <option value="Standard Gemini 1.5 Flash">Gemini 1.5 Flash (Fast & Structured)</option>
              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Email Learning Reminders & Progress Digest
            </label>
          </div>

          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
