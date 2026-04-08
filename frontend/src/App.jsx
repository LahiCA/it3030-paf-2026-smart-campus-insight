import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, ROUTES } from './utils/constants';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './components/LoginPage';
import NotificationsPage from './components/NotificationsPage';
import AdminPanel from './components/AdminPanel';
import NotificationPreferences from './components/NotificationPreferences';
import RoleSelection from './components/RoleSelection';
import ResourcesPage from './components/ResourcesPage';
import LecturerDashboard from './components/LecturerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotificationManagementPage from './components/NotificationManagementPage';

// Routes to the correct dashboard based on the user's role
const RoleDashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'LECTURER') return <LecturerDashboard />;
  if (role === 'TECHNICIAN') return <TechnicianDashboard />;
  return <Navigate to={ROUTES.LOGIN} replace />;
};

function App() {
  console.log('Google Client ID from env:', GOOGLE_CLIENT_ID);

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#ffebee',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '600px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '20px',
            }}
          >
            ⚙️
          </div>

          <h1
            style={{
              color: '#d32f2f',
              marginBottom: '10px',
            }}
          >
            Configuration Error
          </h1>

          <p
            style={{
              color: '#666',
              marginBottom: '15px',
              fontSize: '16px',
              lineHeight: '1.6',
            }}
          >
            REACT_APP_GOOGLE_CLIENT_ID is not configured correctly.
          </p>

          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              marginBottom: '15px',
            }}
          >
            Current value: {String(GOOGLE_CLIENT_ID)}
          </div>

          <p
            style={{
              color: '#666',
              fontSize: '15px',
              lineHeight: '1.6',
            }}
          >
            Make sure your <code>frontend/.env</code> file contains:
          </p>

          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              marginTop: '10px',
            }}
          >
            REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
          </div>
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
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.ROLE_SELECTION} element={<RoleSelection />} />

              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <RoleDashboard />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.LECTURER_DASHBOARD}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <LecturerDashboard />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.TECHNICIAN_DASHBOARD}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <TechnicianDashboard />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path="/resources"
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <ResourcesPage />
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

              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.ADMIN_PANEL}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <AdminPanel />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.SETTINGS}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <NotificationPreferences />
                      </Layout>
                    }
                  />
                }
              />

              <Route
                path={ROUTES.NOTIFICATION_MANAGEMENT}
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <NotificationManagementPage />
                      </Layout>
                    }
                  />
                }
              />

              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;