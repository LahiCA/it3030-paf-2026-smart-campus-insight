import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import './LoginPage.css';

const FEATURES = [
  {
    icon: '🗓️',
    title: 'Booking Management',
    description: 'Reserve lecture halls, labs, and shared spaces with streamlined scheduling.',
  },
  {
    icon: '🎫',
    title: 'Support Tickets',
    description: 'Report, prioritize, and track maintenance or facility issues with clarity.',
  },
  {
    icon: '🔔',
    title: 'Real-time Notifications',
    description: 'Stay updated instantly on approvals, requests, and operational changes.',
  },
  {
    icon: '👥',
    title: 'Role-based Access',
    description: 'Secure, personalized access for students, staff, admins, and facility teams.',
  },
];

const LoginPage = () => {
  const [error, setError] = React.useState(null);

  const handleLoginError = (errorMsg) => {
    setError(errorMsg || 'Something went wrong while signing in.');
  };

  const handleLoginSuccess = () => {
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-page__bg">
        <div className="bg-orb bg-orb--one"></div>
        <div className="bg-orb bg-orb--two"></div>
        <div className="bg-grid"></div>
      </div>

      <main className="login-shell">
        <div className="login-shell__container">
        {/* LEFT COLUMN: FEATURES SHOWCASE */}
        <section className="features-panel">
          <div className="features-panel__header">
            <h3>Key Features</h3>
            <p>Designed to simplify modern campus operations end to end.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-card__icon">{feature.icon}</div>
                <div className="feature-card__content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <section className="login-card">
          <div className="login-card__glow"></div>

          <header className="login-header">
            <div className="login-badge">
              <span className="login-badge__dot"></span>
              Campus Operations Platform
            </div>

            <div className="login-logo">
              <div className="login-logo__mark">🎓</div>
            </div>

            <h1 className="login-title">Smart Campus Insight</h1>
            <p className="login-tagline">
              Operations Management and Facility Optimization Hub
            </p>
          </header>

          <section className="login-hero">
            <h2 className="login-hero__title">Welcome back</h2>
            <p className="login-hero__text">
              Manage facilities, bookings, and support tickets efficiently.
              Sign in with your Google account to continue.
            </p>
          </section>

          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              <div className="login-error__icon">⚠️</div>
              <div className="login-error__content">
                <strong>Login failed</strong>
                <p>{error}</p>
              </div>
              <button
                className="login-error__close"
                onClick={() => setError(null)}
                aria-label="Close error message"
                type="button"
              >
                ✕
              </button>
            </div>
          )}

          <section className="login-action">
            <div className="login-action__buttonWrap">
              <GoogleLoginButton
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                text="signin_with"
                size="large"
              />
            </div>

            <p className="login-action__hint">
              Secure sign-in powered by Google OAuth 2.0
            </p>
          </section>

          <footer className="login-footer">
            <p className="login-footer__security">
              Protected with OAuth 2.0 and JWT authentication
            </p>
            <p className="login-footer__note">
              © 2026 Smart Campus Operations. All rights reserved.
            </p>
          </footer>
        </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;