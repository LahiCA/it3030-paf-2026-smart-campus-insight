import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, ROUTES } from './utils/constants';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import NotificationsPage from './components/NotificationsPage';

// Lazy load other pages (can add more as they're created)
// const AdminPage = React.lazy(() => import('./pages/AdminPage'));
// const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
// const BookingsPage = React.lazy(() => import('./pages/BookingsPage'));
// const TicketsPage = React.lazy(() => import('./pages/TicketsPage'));

/**
 * App Component
 * 
 * Main application component with:
 * - Google OAuth Provider setup
 * - Authentication context provider
 * - Notification context provider
 * - Client-side routing
 * - Public and private routes
 * 
 * Route Structure:
 * - /login - Public login page
 * - /dashboard - Protected dashboard (requires authentication)
 * - /notifications - Protected notifications page (requires authentication)
 * - /profile - Protected profile page (requires authentication)
 * - /admin/* - Protected admin pages (requires ADMIN role)
 * - /* - Redirect to /dashboard if authenticated, /login if not
 */

// Loading component
const LoadingView = () => (
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

function App() {
  // Validate Google Client ID
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#ffebee'
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
            ⚙️
          </div>
          <h1 style={{
            color: '#d32f2f',
            marginBottom: '10px'
          }}>
            Configuration Error
          </h1>
          <p style={{
            color: '#666',
            marginBottom: '15px',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            REACT_APP_GOOGLE_CLIENT_ID is not configured.
            <br />
            <br />
            Please create a <code>.env</code> file in the frontend root directory with:
            <br />
            <br />
            <code style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              display: 'block',
              marginTop: '10px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              REACT_APP_GOOGLE_CLIENT_ID=your_client_id_from_google_cloud
            </code>
          </p>
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Get Client ID from Google Cloud
          </a>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />

              {/* Protected Routes */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <Dashboard />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.NOTIFICATIONS}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <NotificationsPage />
                      </Layout>
                    }
                  />
                }
              />

              {/* Admin Routes - only accessible to ADMIN role users */}
              {/* <Route
                path="/admin/*"
                element={
                  <PrivateRoute
                    element={
                      <Suspense fallback={<LoadingView />}>
                        <Layout>
                          <AdminPage />
                        </Layout>
                      </Suspense>
                    }
                    requiredRole="ADMIN"
                  />
                }
              /> */}

              {/* Profile Route */}
              {/* <Route
                path={ROUTES.PROFILE}
                element={
                  <PrivateRoute
                    element={
                      <Suspense fallback={<LoadingView />}>
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      </Suspense>
                    }
                  />
                }
              /> */}

              {/* Bookings Route */}
              {/* <Route
                path="/bookings"
                element={
                  <PrivateRoute
                    element={
                      <Suspense fallback={<LoadingView />}>
                        <Layout>
                          <BookingsPage />
                        </Layout>
                      </Suspense>
                    }
                  />
                }
              /> */}

              {/* Tickets Route */}
              {/* <Route
                path="/tickets"
                element={
                  <PrivateRoute
                    element={
                      <Suspense fallback={<LoadingView />}>
                        <Layout>
                          <TicketsPage />
                        </Layout>
                      </Suspense>
                    }
                  />
                }
              /> */}

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
