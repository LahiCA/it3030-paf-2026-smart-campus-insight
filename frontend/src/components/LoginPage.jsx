import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import './LoginPage.css';

/**
 * LoginPage Component
 * 
 * Landing page for unauthenticated users
 * Displays application title, description, and Google login button
 * 
 * Features:
 * - Responsive design
 * - Branding with Smart Campus logo/name
 * - Clear call-to-action
 * - Login error handling
 */

const LoginPage = () => {
  const [error, setError] = React.useState(null);

  const handleLoginError = (errorMsg) => {
    setError(errorMsg);
  };

  const handleLoginSuccess = () => {
    setError(null);
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-decoration"></div>

      {/* Login container */}
      <div className="login-container">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🏛️</span>
          </div>
          <h1>Smart Campus Insight</h1>
          <p className="tagline">Operations Management and Facility Optimization Hub</p>
        </div>

        {/* Description */}
        <div className="login-description">
          <h2>Welcome Back</h2>
          <p>
            Manage facilities, bookings, and support tickets efficiently.
            Sign in with your Google account to continue.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Login Failed</strong>
              <p>{error}</p>
            </div>
            <button
              className="error-close"
              onClick={() => setError(null)}
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Login button */}
        <div className="login-action">
          <GoogleLoginButton
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            text="signin_with"
            size="large"
          />
        </div>

        {/* Features list */}
        <div className="login-features">
          <h3>Key Features</h3>
          <ul>
            <li>
              <span className="feature-icon">📝</span>
              <div>
                <strong>Booking Management</strong>
                <p>Reserve facilities and manage bookings easily</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🎫</span>
              <div>
                <strong>Support Tickets</strong>
                <p>Create and track facility maintenance requests</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔔</span>
              <div>
                <strong>Real-time Notifications</strong>
                <p>Get instant updates on bookings and tickets</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">👥</span>
              <div>
                <strong>Role-based Access</strong>
                <p>Different features based on your role</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Protected with OAuth 2.0 and JWT authentication
          </p>
          <p className="footer-note">
            © 2026 Smart Campus Operations. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
