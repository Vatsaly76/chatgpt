import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/theme.css';
import '../styles/auth.css';

const Home = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className="theme-toggle-icon">
          {theme === 'light' ? '🌙' : '☀️'}
        </span>
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome</h1>
          <p className="auth-subtitle">Choose an option to get started</p>
        </div>

        <div className="auth-form">
          <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Sign In
          </Link>
          
          <Link to="/register" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
