import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CareerMentorPage from './pages/CareerMentorPage';
import ProjectMentorPage from './pages/ProjectMentorPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <Loading message="Authenticating user session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Home Landing Component
const HomeLanding = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <section className="hero-banner">
        <span className="hero-tag">🎓 Internship-Ready Career Platform</span>
        <h1 className="hero-title">
          Plan Your Career. <br /> Build Amazing Projects. Get Internship Ready.
        </h1>
        <p className="hero-subtitle">
          DevPath AI matches your education details, skills, and target roles to construct custom career roadmaps, skill gap reports, weekly timetables, flagship project blueprints, and interview prep.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            ⚡ Get Started Free
          </a>
          <a href="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            🔑 Sign In
          </a>
        </div>
      </section>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <div style={{ flex: 1 }} className="app-container">
            <Routes>
              <Route path="/" element={<HomeLanding />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-mentor"
                element={
                  <ProtectedRoute>
                    <CareerMentorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-mentor"
                element={
                  <ProtectedRoute>
                    <ProjectMentorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
