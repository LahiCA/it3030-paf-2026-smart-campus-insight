import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../frontend/src/context/AuthContext';

/**
 * PrivateRoute Component
 * 
 * Wrapper to protect routes behind authentication
 * Optionally restrict by user role
 * 
 * Props:
 * - element: React component to render if authorized
 * - requiredRole: (optional) user must have this role (ADMIN, TECHNICIAN, MANAGER, USER)
 * 
 * Examples:
 * <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
 * <Route path="/admin" element={<PrivateRoute element={<AdminPanel />} requiredRole="ADMIN" />} />
 * <Route path="/tech" element={<PrivateRoute element={<TechPanel />} requiredRole="TECHNICIAN" />} />
 */

const PrivateRoute = ({ element, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show nothing while checking authentication status
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px',
            animation: 'spin 1s linear infinite'
          }}>
            ⏳
          </div>
          <p style={{
            color: '#666',
            fontSize: '16px'
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required, check if user has it
  if (requiredRole && user) {
    const userRole = user.role || 'USER';

    // Check if user has required role
    if (userRole !== requiredRole) {
      // User is authenticated but doesn't have required role
      // Could redirect to an "Access Denied" page instead
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              🔐
            </div>
            <h1 style={{
              color: '#d32f2f',
              marginBottom: '10px'
            }}>
              Access Denied
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '15px',
              fontSize: '16px'
            }}>
              You don't have permission to access this page.
            </p>
            <p style={{
              color: '#999',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              Required role: <strong>{requiredRole}</strong>
              <br />
              Your role: <strong>{userRole}</strong>
            </p>
            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '500',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  // User is authenticated (and has required role if specified)
  return element;
};

export default PrivateRoute;
