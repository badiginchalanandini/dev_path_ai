import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar glass-panel" style={{ padding: '1.2rem', width: '240px', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/career-mentor"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          🗺️ Career Mentor
        </NavLink>

        <NavLink
          to="/project-mentor"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          🚀 Project Mentor
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          📜 Learning History
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          👤 My Profile
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          ⚙️ Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
