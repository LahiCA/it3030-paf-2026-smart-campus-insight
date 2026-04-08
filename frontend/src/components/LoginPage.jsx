import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';

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
    <>
      <style>{`
        @keyframes lp-float { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-30px)} 66%{transform:translate(-20px,20px)} }
        @keyframes lp-glow { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes lp-slideInUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 10px rgba(20,184,166,0.6)} 50%{opacity:0.6;transform:scale(1.3);box-shadow:0 0 20px rgba(20,184,166,0.3)} }
        @keyframes lp-slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

        .lp-page { height:100vh; max-height:100vh; background:linear-gradient(135deg,#0a2342 0%,#0f766e 50%,#14B8A6 100%); position:fixed; top:0; left:0; right:0; bottom:0; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:24px 20px; font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell',sans-serif; }
        .lp-page::-webkit-scrollbar, .lp-page *::-webkit-scrollbar { display:none; }

        .lp-bg { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .lp-orb { position:absolute; border-radius:50%; filter:blur(120px); opacity:0.12; animation:lp-float 20s ease-in-out infinite; }
        .lp-orb--one { width:600px; height:600px; background:radial-gradient(circle,#14B8A6,transparent); top:-300px; left:-300px; }
        .lp-orb--two { width:700px; height:700px; background:radial-gradient(circle,#2DD4BF,transparent); bottom:-350px; right:-350px; animation-delay:-5s; }
        .lp-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(20,184,166,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,0.04) 1px,transparent 1px); background-size:80px 80px; opacity:0.5; }

        .lp-shell { position:relative; z-index:10; width:100%; max-width:1100px; margin:0 auto; }
        .lp-container { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:40px; align-items:stretch; background:rgba(255,255,255,0.08); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.15); border-radius:28px; padding:36px; }

        .lp-features { min-width:0; display:flex; flex-direction:column; justify-content:center; animation:lp-slideInUp 0.8s cubic-bezier(0.34,1.56,0.64,1); }
        .lp-features__title { font-size:26px; font-weight:800; color:white; letter-spacing:-1px; margin-bottom:8px; line-height:1.2; text-shadow:0 2px 10px rgba(0,0,0,0.2); }
        .lp-features__sub { font-size:14px; color:rgba(255,255,255,0.9); line-height:1.5; margin:0; letter-spacing:0.3px; }

        .lp-fgrid { display:grid; gap:12px; width:100%; }
        .lp-fcard { background:rgba(255,255,255,0.14); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1.5px solid rgba(255,255,255,0.3); border-radius:14px; padding:16px 18px; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); cursor:default; position:relative; overflow:hidden; }
        .lp-fcard::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 20% 50%,rgba(45,212,191,0.1),transparent); opacity:0; transition:opacity 0.4s ease; }
        .lp-fcard:hover { transform:translateY(-12px) translateX(8px); background:rgba(255,255,255,0.18); border-color:rgba(255,255,255,0.4); box-shadow:0 20px 40px -10px rgba(0,0,0,0.2),0 0 40px rgba(20,184,166,0.2); }
        .lp-fcard:hover::before { opacity:1; }
        .lp-fcard__icon { font-size:28px; display:block; margin-bottom:8px; line-height:1; filter:drop-shadow(0 4px 12px rgba(20,184,166,0.15)); transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .lp-fcard:hover .lp-fcard__icon { transform:scale(1.15) rotate(5deg); }
        .lp-fcard h4 { font-size:14px; font-weight:700; color:white; margin-bottom:4px; line-height:1.3; letter-spacing:-0.3px; text-shadow:0 2px 4px rgba(0,0,0,0.1); }
        .lp-fcard p { font-size:12px; color:rgba(255,255,255,0.95); margin:0; line-height:1.5; text-shadow:0 1px 2px rgba(0,0,0,0.1); letter-spacing:0.2px; }

        .lp-card { min-width:0; display:flex; flex-direction:column; justify-content:center; background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(152,229,195,0.92); border-radius:24px; padding:30px 32px; box-shadow:0 8px 32px 0 rgba(31,38,135,0.15),0 0 60px rgba(20,184,166,0.15),inset 0 1px 1px rgba(255,255,255,0.8); position:relative; overflow:hidden; animation:lp-slideInRight 0.8s cubic-bezier(0.34,1.56,0.64,1); }
        .lp-card::before { content:''; position:absolute; inset:-2px; background:linear-gradient(135deg,rgba(20,184,166,0.3),rgba(45,212,191,0.2),rgba(20,184,166,0.3)); border-radius:28px; z-index:-1; filter:blur(30px); opacity:0; animation:lp-glow 3s ease-in-out infinite; }
        .lp-card__glow { position:absolute; top:-100px; right:-100px; width:300px; height:300px; background:radial-gradient(circle,rgba(20,184,166,0.15),transparent 70%); border-radius:50%; filter:blur(50px); z-index:-1; pointer-events:none; }

        .lp-header { margin-bottom:16px; text-align:center; }
        .lp-badge { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,rgba(20,184,166,0.12),rgba(45,212,191,0.08)); color:#0f766e; padding:6px 16px; border-radius:100px; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:14px; border:1px solid rgba(20,184,166,0.25); }
        .lp-badge__dot { width:6px; height:6px; background:#14B8A6; border-radius:50%; box-shadow:0 0 10px rgba(20,184,166,0.6); animation:lp-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .lp-logo { font-size:64px; display:block; line-height:1; animation:lp-bounce 3s cubic-bezier(0.68,-0.55,0.265,1.55) infinite; text-shadow:0 10px 30px rgba(20,184,166,0.2); margin-bottom:10px; }
        .lp-title { font-size:28px; font-weight:800; letter-spacing:-1px; margin-bottom:6px; line-height:1.2; background:linear-gradient(135deg,#0a1929 0%,#0f766e 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-tagline { font-size:13px; color:#64748b; line-height:1.5; letter-spacing:0.2px; }

        .lp-hero { margin-bottom:18px; padding:16px; background:linear-gradient(135deg,rgba(20,184,166,0.08),rgba(45,212,191,0.04)); border:1px solid rgba(20,184,166,0.2); border-radius:16px; border-left:4px solid #14B8A6; transition:all 0.3s ease; position:relative; overflow:hidden; }
        .lp-hero::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(20,184,166,0.4),transparent); }
        .lp-hero:hover { background:linear-gradient(135deg,rgba(20,184,166,0.12),rgba(45,212,191,0.06)); border-color:rgba(20,184,166,0.3); box-shadow:0 8px 24px -8px rgba(20,184,166,0.2); }
        .lp-hero__title { font-size:18px; font-weight:700; color:#0a1929; margin-bottom:6px; letter-spacing:-0.3px; }
        .lp-hero__text { font-size:13px; color:#64748b; line-height:1.6; margin:0; }

        .lp-error { display:flex; gap:16px; align-items:flex-start; background:linear-gradient(135deg,#fee2e2,#fecaca); border:1.5px solid #fca5a5; border-radius:12px; padding:16px 20px; margin-bottom:30px; animation:lp-slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1); backdrop-filter:blur(10px); }
        .lp-error__icon { font-size:24px; flex-shrink:0; line-height:1.4; }
        .lp-error strong { display:block; color:#b91c1c; font-weight:700; margin-bottom:4px; font-size:15px; }
        .lp-error p { color:#991b1b; font-size:14px; margin:0; line-height:1.5; }
        .lp-error__close { background:none; border:none; color:#dc2626; font-size:20px; cursor:pointer; flex-shrink:0; padding:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; border-radius:6px; }
        .lp-error__close:hover { background:rgba(220,38,38,0.1); color:#b91c1c; }

        .lp-action { margin-bottom:14px; display:flex; flex-direction:column; align-items:center; }
        .lp-action__wrap { margin-bottom:10px; position:relative; display:flex; justify-content:center; align-items:center; width:100%; max-width:360px; }
        .lp-action__hint { text-align:center; font-size:11px; color:#94a3b8; margin:0; letter-spacing:0.3px; font-weight:500; }

        .lp-footer { text-align:center; padding-top:16px; margin-top:16px; border-top:1px solid rgba(20,184,166,0.2); display:flex; flex-direction:column; gap:4px; }
        .lp-footer__security { font-size:11px; color:#475569; margin:0 0 8px 0; line-height:1.6; letter-spacing:0.3px; font-weight:500; }
        .lp-footer__note { font-size:11px; color:#64748b; margin:0; letter-spacing:0.2px; }

        .google-login-button-container { width:100%!important; display:flex!important; justify-content:center!important; align-items:center!important; position:relative; z-index:2; }
        .google-login-button-container > div { width:100%!important; display:flex!important; justify-content:center!important; align-items:center!important; }
        .google-login-button-container > div > div { width:100%!important; display:flex!important; justify-content:center!important; }
        .google-login-button-container button, .google-login-button-container [role="button"] { min-width:280px!important; width:100%!important; max-width:320px!important; padding:10px 24px!important; border-radius:12px!important; box-shadow:0 4px 16px rgba(0,0,0,0.1)!important; border:1.5px solid #93bbfd!important; font-size:14px!important; font-weight:600!important; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)!important; background:#187014!important; color:white!important; display:flex!important; justify-content:center!important; align-items:center!important; }
        .google-login-button-container button:hover, .google-login-button-container [role="button"]:hover { border-color:#14B8A6!important; box-shadow:0 12px 32px rgba(59,130,246,0.25),0 4px 12px rgba(0,0,0,0.12)!important; transform:translateY(-3px)!important; border-width:2px!important; }

        @media (max-width:1200px) {
          .lp-container { grid-template-columns:1fr; gap:40px; }
          .lp-features { display:none; }
          .lp-card { padding:36px 32px; }
          .lp-title { font-size:30px; }
        }
        @media (max-width:768px) {
          .lp-page { padding:16px; }
          .lp-container { gap:30px; padding:24px; border-radius:22px; }
          .lp-card { padding:28px 24px; border-radius:20px; }
          .lp-title { font-size:26px; }
          .lp-hero { padding:14px; margin-bottom:14px; }
          .lp-logo { font-size:56px; }
        }
        @media (max-width:480px) {
          .lp-container { padding:16px; border-radius:18px; }
          .lp-card { padding:22px 18px; border-radius:16px; }
          .lp-header { margin-bottom:12px; }
          .lp-title { font-size:22px; }
          .lp-tagline { font-size:12px; }
          .lp-hero { padding:12px; margin-bottom:12px; }
          .lp-hero__title { font-size:16px; }
          .lp-logo { font-size:48px; }
          .lp-features { display:none; }
        }
      `}</style>

      <div className="lp-page">
        <div className="lp-bg">
          <div className="lp-orb lp-orb--one"></div>
          <div className="lp-orb lp-orb--two"></div>
          <div className="lp-grid"></div>
        </div>

        <main className="lp-shell">
          <div className="lp-container">
            {/* LEFT COLUMN: FEATURES SHOWCASE */}
            <section className="lp-features">
              <div style={{ marginBottom: '20px' }}>
                <h3 className="lp-features__title">Key Features</h3>
                <p className="lp-features__sub">Designed to simplify modern campus operations end to end.</p>
              </div>

              <div className="lp-fgrid">
                {FEATURES.map((feature) => (
                  <article className="lp-fcard" key={feature.title}>
                    <div className="lp-fcard__icon">{feature.icon}</div>
                    <div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* RIGHT COLUMN: LOGIN CARD */}
            <section className="lp-card">
              <div className="lp-card__glow"></div>

              <header className="lp-header">
                <div className="lp-badge">
                  <span className="lp-badge__dot"></span>
                  Campus Operations Platform
                </div>

                <div className="lp-logo">🎓</div>

                <h1 className="lp-title">Smart Campus Insight</h1>
                <p className="lp-tagline">
                  Operations Management and Facility Optimization Hub
                </p>
              </header>

              <section className="lp-hero">
                <h2 className="lp-hero__title">Welcome back</h2>
                <p className="lp-hero__text">
                  Manage facilities, bookings, and support tickets efficiently.
                  Sign in with your Google account to continue.
                </p>
              </section>

              {error && (
                <div className="lp-error" role="alert" aria-live="polite">
                  <div className="lp-error__icon">⚠️</div>
                  <div style={{ flex: 1 }}>
                    <strong>Login failed</strong>
                    <p>{error}</p>
                  </div>
                  <button
                    className="lp-error__close"
                    onClick={() => setError(null)}
                    aria-label="Close error message"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}

              <section className="lp-action">
                <div className="lp-action__wrap">
                  <GoogleLoginButton
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    text="signin_with"
                    size="large"
                  />
                </div>
                <p className="lp-action__hint">
                  Secure sign-in powered by Google OAuth 2.0
                </p>
              </section>

              <footer className="lp-footer">
                <p className="lp-footer__security">
                  Protected with OAuth 2.0 and JWT authentication
                </p>
                <p className="lp-footer__note">
                  © 2026 Smart Campus Operations. All rights reserved.
                </p>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;