import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';

const FEATURES = [
  {
    icon: 'Booking',
    title: 'Booking Management',
    description: 'Reserve lecture halls, labs, and shared spaces with streamlined scheduling.',
  },
  {
    icon: 'Tickets',
    title: 'Support Tickets',
    description: 'Report, prioritize, and track maintenance or facility issues with clarity.',
  },
  {
    icon: 'Alerts',
    title: 'Real-time Notifications',
    description: 'Stay updated instantly on approvals, requests, and operational changes.',
  },
  {
    icon: 'Access',
    title: 'Role-based Access',
    description: 'Secure, personalized access for students, staff, admins, and facility teams.',
  },
];

const LoginPageTailwind = () => {
  const [error, setError] = React.useState(null);

  const handleLoginError = (errorMsg) => {
    setError(errorMsg || 'Something went wrong while signing in.');
  };

  const handleLoginSuccess = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[linear-gradient(135deg,#0a2342_0%,#0f766e_50%,#14B8A6_100%)] px-4 py-6 font-['Poppins',sans-serif] sm:px-5 md:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-72 -top-72 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.22),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-80 -right-80 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.04)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-full w-full max-w-[1100px] items-center">
        <div className="grid w-full gap-10 rounded-[28px] border border-white/15 bg-white/8 p-4 backdrop-blur-xl sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-9">
          <section className="hidden min-w-0 flex-col justify-center lg:flex">
            <div className="mb-5">
              <h3 className="mb-2 text-[26px] font-extrabold leading-tight tracking-[-0.04em] text-white drop-shadow-sm">
                Key Features
              </h3>
              <p className="text-sm leading-6 text-white/90">
                Designed to simplify modern campus operations end to end.
              </p>
            </div>

            <div className="grid gap-3">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/14 p-4 backdrop-blur-xl transition duration-300 hover:translate-x-1.5 hover:-translate-y-1.5 hover:bg-white/18 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2),0_0_40px_rgba(20,184,166,0.2)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,0.12),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
                  <div className="relative">
                    <span className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-50">
                      {feature.icon}
                    </span>
                    <h4 className="mb-1 text-sm font-bold text-white">{feature.title}</h4>
                    <p className="text-xs leading-5 text-white/95">{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="relative min-w-0 overflow-hidden rounded-[24px] border border-emerald-200/80 bg-white/92 px-5 py-6 shadow-[0_8px_32px_rgba(31,38,135,0.15),0_0_60px_rgba(20,184,166,0.15)] backdrop-blur-2xl sm:px-6 sm:py-7 lg:px-8 lg:py-[30px]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.15),transparent_70%)] blur-3xl" />

            <header className="mb-4 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(45,212,191,0.08))] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                Campus Operations Platform
              </div>

              <div className="mb-3">
                <span className="text-6xl sm:text-7xl">🎓</span>
              </div>
              <h1 className="mb-1 bg-[linear-gradient(135deg,#0a1929_0%,#0f766e_100%)] bg-clip-text text-[28px] font-extrabold tracking-[-0.04em] text-transparent sm:text-[30px]">
                Smart Campus Insight
              </h1>
              <p className="text-[13px] leading-6 tracking-[0.02em] text-slate-500">
                Operations Management and Facility Optimization Hub
              </p>
            </header>

            <section className="relative mb-4 overflow-hidden rounded-2xl border border-teal-500/20 border-l-4 border-l-teal-500 bg-[linear-gradient(135deg,rgba(20,184,166,0.08),rgba(45,212,191,0.04))] p-4 transition hover:border-teal-500/30 hover:shadow-[0_8px_24px_-8px_rgba(20,184,166,0.2)]">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(20,184,166,0.4),transparent)]" />
              <h2 className="mb-1.5 text-lg font-bold text-slate-900">Welcome back</h2>
              <p className="text-[13px] leading-6 text-slate-500">
                Manage facilities, bookings, and support tickets efficiently. Sign in with your Google account to continue.
              </p>
            </section>

            {error && (
              <div
                className="mb-6 flex items-start gap-4 rounded-xl border border-red-300 bg-[linear-gradient(135deg,#fee2e2,#fecaca)] px-5 py-4"
                role="alert"
                aria-live="polite"
              >
                <div className="pt-0.5 text-lg text-red-700">!</div>
                <div className="flex-1">
                  <strong className="mb-1 block text-sm font-bold text-red-700">Login failed</strong>
                  <p className="text-sm leading-5 text-red-800">{error}</p>
                </div>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md text-lg text-red-600 transition hover:bg-red-600/10 hover:text-red-700"
                  onClick={() => setError(null)}
                  aria-label="Close error message"
                  type="button"
                >
                  x
                </button>
              </div>
            )}

            <section className="mb-3 flex flex-col items-center">
              <div className="mb-2 flex w-full max-w-[360px] justify-center [&_.google-login-button-container]:!flex [&_.google-login-button-container]:!w-full [&_.google-login-button-container]:!justify-center [&_.google-login-button-container>div]:!flex [&_.google-login-button-container>div]:!w-full [&_.google-login-button-container>div]:!justify-center [&_.google-login-button-container>div>div]:!flex [&_.google-login-button-container>div>div]:!w-full [&_.google-login-button-container>div>div]:!justify-center [&_.google-login-button-container_button]:!flex [&_.google-login-button-container_button]:!max-w-[320px] [&_.google-login-button-container_button]:!w-full [&_.google-login-button-container_button]:!items-center [&_.google-login-button-container_button]:!justify-center [&_.google-login-button-container_button]:!rounded-xl [&_.google-login-button-container_button]:!border-[1.5px] [&_.google-login-button-container_button]:!border-sky-300 [&_.google-login-button-container_button]:!bg-[#187014] [&_.google-login-button-container_button]:!px-6 [&_.google-login-button-container_button]:!py-2.5 [&_.google-login-button-container_button]:!text-sm [&_.google-login-button-container_button]:!font-semibold [&_.google-login-button-container_button]:!text-white [&_.google-login-button-container_button]:!shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:[&_.google-login-button-container_button]:!translate-y-[-2px] hover:[&_.google-login-button-container_button]:!border-teal-500 hover:[&_.google-login-button-container_button]:!shadow-[0_12px_32px_rgba(59,130,246,0.25),0_4px_12px_rgba(0,0,0,0.12)]">
                <GoogleLoginButton
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  text="signin_with"
                  size="large"
                />
              </div>
              <p className="text-center text-[11px] font-medium tracking-[0.03em] text-slate-400">
                Secure sign-in powered by Google OAuth 2.0
              </p>
            </section>

            <footer className="mt-4 flex flex-col gap-1 border-t border-teal-500/20 pt-4 text-center">
              <p className="text-[11px] font-medium leading-5 tracking-[0.03em] text-slate-600">
                Protected with OAuth 2.0 and JWT authentication
              </p>
              <p className="text-[11px] tracking-[0.02em] text-slate-500">
                &copy; 2026 Smart Campus Operations. All rights reserved.
              </p>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPageTailwind;
