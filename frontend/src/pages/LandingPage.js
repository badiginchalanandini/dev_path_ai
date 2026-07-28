import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing">

      {/* Navbar */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-box">⚡</div>

          <h2>DevPath AI</h2>

        </div>

        <div className="nav-buttons">

          <Link to="/login" className="login-btn">
            Sign In
          </Link>

          <Link to="/signup" className="signup-btn">
            Register
          </Link>

        </div>

      </nav>

      {/* Hero */}

      <section className="hero">

        <div className="hero-left">

          <span className="badge">
            🚀 AI Powered Career Guidance
          </span>

          <h1>

            Build Your

            <span> Dream Tech Career </span>

            with AI

          </h1>

          <p>

            DevPath AI helps students discover career paths,
            identify skill gaps, build personalized roadmaps,
            and receive AI-powered project recommendations.

          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="primary-btn">
              Get Started
            </Link>

            <Link to="/login" className="secondary-btn">
              Sign In
            </Link>

          </div>

        </div>

        <div className="hero-right">

          <div className="glass-card">

            <h3>🤖 AI Career Mentor</h3>

            <p>✔ Personalized Roadmaps</p>

            <p>✔ Skill Gap Analysis</p>

            <p>✔ AI Project Mentor</p>

            <p>✔ Progress Tracking</p>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="features">

        <h2>Everything You Need</h2>

        <div className="cards">

          <div className="card">

            <h3>🎯 Career Mentor</h3>

            <p>
              Receive personalized AI career guidance
              based on your interests and skills.
            </p>

          </div>

          <div className="card">

            <h3>📚 Learning Roadmaps</h3>

            <p>
              Generate structured learning paths
              for your dream career.
            </p>

          </div>

          <div className="card">

            <h3>🚀 Project Mentor</h3>

            <p>
              Get AI-generated project ideas,
              architecture and implementation guidance.
            </p>

          </div>

          <div className="card">

            <h3>📈 Progress Tracker</h3>

            <p>
              Track your skills,
              completed projects
              and learning journey.
            </p>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="cta">

        <h2>

          Ready to Start Your Journey?

        </h2>

        <p>

          Join DevPath AI and build an industry-ready career.

        </p>

        <Link to="/signup" className="primary-btn">
          Start Now
        </Link>

      </section>

    </div>
  );
};

export default LandingPage;