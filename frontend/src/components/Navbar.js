import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        <div className="brand-icon">⚡</div>
        <span className="brand-title">DevPath AI</span>
      </Link>

      <div className="nav-actions">
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#a5b4fc' }}>
              👤 {user.name}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
