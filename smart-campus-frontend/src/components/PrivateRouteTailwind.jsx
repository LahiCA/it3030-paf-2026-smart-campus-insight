import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRouteTailwind = ({ element, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="p-5 text-center">
          <div className="mb-2.5 text-5xl animate-spin">...</div>
          <p className="text-base text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user) {
    const userRole = user.role || 'USER';

    if (userRole !== requiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
            <div className="mb-5 text-6xl">!</div>
            <h1 className="mb-2 text-3xl font-bold text-red-600">Access Denied</h1>
            <p className="mb-4 text-base text-slate-500">
              You do not have permission to access this page.
            </p>
            <p className="mb-5 text-sm text-slate-400">
              Required role: <strong>{requiredRole}</strong>
              <br />
              Your role: <strong>{userRole}</strong>
            </p>
            <a
              href="/dashboard"
              className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return element;
};

export default PrivateRouteTailwind;
