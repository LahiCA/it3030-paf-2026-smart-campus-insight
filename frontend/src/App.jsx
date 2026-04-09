import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, ROUTES } from './utils/constants';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRouteTailwind';
import Layout from './components/Layout';

// Pages
import LoginPage from './components/LoginPageTailwind';
import NotificationsPage from './components/NotificationsPage';
import AdminPanel from './components/AdminPanelTailwind';
import NotificationPreferences from './components/NotificationPreferences';
import RoleSelection from './components/RoleSelectionTailwind';
import ResourcesPage from './components/ResourcesPageTailwind';
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
      <div className="flex min-h-screen items-center justify-center bg-red-50 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-5 text-6xl">
            ⚙️
          </div>

          <h1 className="mb-2 text-3xl font-bold text-red-600">
            Configuration Error
          </h1>

          <p className="mb-4 text-base leading-7 text-slate-500">
            REACT_APP_GOOGLE_CLIENT_ID is not configured correctly.
          </p>

          <div className="mb-4 break-all rounded-lg bg-slate-100 px-3 py-3 font-mono text-sm text-slate-700">
            Current value: {String(GOOGLE_CLIENT_ID)}
          </div>

          <p className="text-[15px] leading-7 text-slate-500">
            Make sure your <code>frontend/.env</code> file contains:
          </p>

          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-3 font-mono text-sm text-slate-700">
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
