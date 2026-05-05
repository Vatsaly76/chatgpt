import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/theme.css';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat', { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [validation, setValidation] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Real-time validation
  const validateField = (name, value) => {
    let isValid = false;
    let message = '';

    switch (name) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        message = isValid ? '' : 'Please enter a valid email address';
        break;
      }
      case 'password': {
        isValid = value.length >= 6;
        message = isValid ? '' : 'Password must be at least 6 characters';
        break;
      }
      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [name]: { isValid, message }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccess('');

    // Validate all fields
    const isFormValid = Object.values(validation).every(field => field.isValid);
    
    if (!isFormValid) {
      setErrors(['Please enter valid credentials.']);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email: formData.email,
        password: formData.password      
      }, {
        withCredentials: true
      });

      console.log('Login successful:', response.data);
      setSuccess('Login successful! Redirecting...');
      login(response.data.user); // Assuming the user object is in response.data.user
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/chat');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      setErrors([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element floating-element-1"></div>
        <div className="floating-element floating-element-2"></div>
        <div className="floating-element floating-element-3"></div>
        <div className="floating-element floating-element-4"></div>
        <div className="floating-element floating-element-5"></div>
      </div>

      <div className="auth-card modern-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your journey</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="message success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}
        
        {errors.length > 0 && (
          <div className="message error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </div>
        )}

        <form className="auth-form modern-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email Address
            </label>
            <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${validation.email.isValid ? 'valid' : ''} ${validation.email.message && formData.email ? 'invalid' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input modern-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
              />
              {validation.email.isValid && (
                <div className="input-validation-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            {validation.email.message && formData.email && (
              <div className="validation-message">{validation.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label htmlFor="password" className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Password
              </label>
              <Link to="#" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${validation.password.isValid ? 'valid' : ''} ${validation.password.message && formData.password ? 'invalid' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input modern-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
              {validation.password.isValid && (
                <div className="input-validation-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            {validation.password.message && formData.password && (
              <div className="validation-message">{validation.password.message}</div>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-checkmark"></span>
              <span className="checkbox-text">Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary modern-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="divider">
            <span>or</span>
          </div>
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
