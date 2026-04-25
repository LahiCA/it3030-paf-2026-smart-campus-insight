import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, ROUTES } from './utils/constants';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatbotProvider, FloatingChatButton, ChatbotPanel, ThemeToggleButton } from './chatbot';

import PrivateRoute from './components/PrivateRouteTailwind';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';

// Existing system pages
import LoginPage from './components/LoginPageTailwind';
import RoleSelection from './components/RoleSelectionTailwind';
import NotificationsPage from './components/NotificationsPage';
import NotificationPreferences from './components/NotificationPreferences';
import NotificationManagementPage from './components/NotificationManagementPage';

import LecturerDashboard from './components/LecturerDashboard';
import TechnicianDashboard from './components/TechnicianDashboardTailwind';
import AdminDashboard from './components/AdminDashboard';
import AdminPanel from './components/AdminPanelTailwind';
import ResourcesPage from './components/ResourcesPageTailwind';

// Booking + Ticket system
import Navbar from './layout/Navbar';
import BWSidebar from './layout/BWSidebar';

import BWCreateBooking from './pages/BWCreateBooking';
import BWMyBookings from './pages/BWMyBookings';
import BWAdminBookingList from './pages/BWAdminBookingList';
import BWAdminBookingTable from './components/BWAdminBookingTable';

import CreateTicketPage from './pages/CreateTicketPage';
import TicketDashboardPage from './pages/TicketDashboardPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TicketTimelinePage from './pages/TicketTimelinePage';

import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ExportReports from './pages/ExportReports';

// Role-based dashboard
const RoleDashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'LECTURER') return <LecturerDashboard />;
  if (role === 'TECHNICIAN') return <TechnicianDashboard />;

  return <Navigate to={ROUTES.LOGIN} replace />;
};

// Layout wrapper for booking system
const BookingTabs = () => {
  const { user, isAdmin } = useAuth();

  const tabs = [
    { name: 'Create Booking', path: '/bw-create-booking' },
    { name: 'My Bookings', path: '/bw-my-bookings' },
  ];
  if (isAdmin()) {
    tabs.push({ name: 'Admin Bookings', path: '/bw-admin-bookings' });
  }

  return (
    <div className="inline-flex flex-wrap gap-2 rounded-xl bg-slate-200/50 p-1.5 backdrop-blur-sm border border-slate-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `px-5 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${
              isActive
                ? 'bg-white text-teal-700 shadow-sm border-transparent ring-1 ring-slate-200/80 scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-200/80 hover:text-slate-800'
            }`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
};

const BookingLayout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-slate-50 font-['Poppins',sans-serif]">
    <Sidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="scrollbar-ui flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 border-b border-slate-200/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Facility Bookings</h1>
              <p className="text-slate-500 mt-2 font-medium">Manage and view your campus resource reservations.</p>
            </div>
            
            <BookingTabs />
          </div>
          {children}
        </div>
      </main>
    </div>
  </div>
);

const TicketLayout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-slate-50 font-['Poppins',sans-serif]">
    <Sidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="scrollbar-ui flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

function ChatbotWrapper() {
  const location = useLocation();
  if (location.pathname === ROUTES.LOGIN || location.pathname === '/') return null;
  return (
    <>
      <ThemeToggleButton />
      <FloatingChatButton />
      <ChatbotPanel />
    </>
  );
}

const AdminOnly = ({ children }) => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return <div>Missing Google Client ID</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <ChatbotProvider>
          <Router>

            {/* Global Navbar */}
            <Navbar />

            {/* AI Chatbot – floating on all pages except login */}
            <ChatbotWrapper />

            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

              {/* PUBLIC ROUTES */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.ROLE_SELECTION} element={<RoleSelection />} />

              {/* DASHBOARD */}
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

              {/* OTHER SYSTEM ROUTES */}
              <Route
                path={ROUTES.NOTIFICATIONS}
                element={
                  <PrivateRoute
                    element={<Layout><NotificationsPage /></Layout>}
                  />
                }
              />

              <Route
                path="/notifications-management"
                element={
                  <PrivateRoute
                    element={<Layout><NotificationManagementPage /></Layout>}
                  />
                }
              />

              <Route
                path={ROUTES.ADMIN_PANEL}
                element={
                  <PrivateRoute
                    element={<Layout><AdminPanel /></Layout>}
                  />
                }
              />

              <Route
                path="/resources"
                element={
                  <PrivateRoute
                    element={<Layout><ResourcesPage /></Layout>}
                  />
                }
              />

              <Route
                path={ROUTES.SETTINGS}
                element={
                  <PrivateRoute
                    element={<Layout><NotificationPreferences /></Layout>}
                  />
                }
              />

              {/* BOOKING SYSTEM */}
              <Route
                path="/bw-create-booking"
                element={
                  <PrivateRoute
                    element={<BookingLayout><BWCreateBooking /></BookingLayout>}
                  />
                }
              />

              <Route
                path="/bw-my-bookings"
                element={
                  <PrivateRoute
                    element={<BookingLayout><BWMyBookings /></BookingLayout>}
                  />
                }
              />

              <Route
                path="/bw-admin-bookings"
                element={
                  <PrivateRoute
                    element={<BookingLayout><BWAdminBookingList /></BookingLayout>}
                  />
                }
              />

              {/* TICKET SYSTEM */}
              <Route
                path="/tickets"
                element={
                  <PrivateRoute
                    element={<Layout><TicketDashboardPage /></Layout>}
                  />
                }
              />

              <Route
                path="/tickets/:id"
                element={
                  <PrivateRoute
                    element={<Layout><TicketDetailsPage /></Layout>}
                  />
                }
              />

              <Route
                path="/technician/tickets/:id/timeline"
                element={
                  <PrivateRoute
                    element={<Layout><TicketTimelinePage /></Layout>}
                  />
                }
              />

              <Route
                path="/ticket-create"
                element={
                  <PrivateRoute
                    element={<Layout><CreateTicketPage /></Layout>}
                  />
                }
              />

              <Route path="/analytics"
                    element={
                      <PrivateRoute
                        element={
                          <Layout>
                            <AdminOnly>
                              <AnalyticsDashboard />
                            </AdminOnly>
                          </Layout>
                        }
                      />
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <PrivateRoute
                        element={
                          <Layout>
                            <AdminOnly>
                              <ExportReports />
                            </AdminOnly>
                          </Layout>
                        }
                      />
                    }
                  />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            </Routes>
          </Router>
          </ChatbotProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
