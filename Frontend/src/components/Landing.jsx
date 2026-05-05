import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/landing.css';

const Landing = () => {
  const { user } = useContext(AuthContext);

  // If user is already logged in, redirect to chat (optional) or just let them navigate there
  // For standard behavior, if they hit the landing page and are logged in, maybe show a "Go to Chat" button instead.

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h1>Lexora</h1>
        </div>
        <div className="nav-links">
          {user ? (
            <Link to="/chat" className="btn-primary">Open Chat</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <h1 className="hero-title">Experience the Future of Conversation</h1>
          <p className="hero-subtitle">
            Lexora is your intelligent companion, capable of deep philosophical discussions, coding assistance, and answering your most complex questions.
          </p>
          <div className="cta-container">
            {user ? (
              <Link to="/chat" className="btn-primary btn-large">Continue Chatting</Link>
            ) : (
              <Link to="/register" className="btn-primary btn-large">Get Started for Free</Link>
            )}
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Intelligent Memory</h3>
            <p>I store memory in a vector database and use it to answer your questions with perfect context.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Powered by advanced AI models to deliver instant, accurate responses to your queries.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌙</div>
            <h3>Beautiful Interface</h3>
            <p>A sleek, distraction-free dark mode interface designed for late-night productivity.</p>
          </div>
        </div>
      </main>
      
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Lexora AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
