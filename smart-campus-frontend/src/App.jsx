import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, ROUTES } from './utils/constants';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

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
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminPanel from './components/AdminPanelTailwind';
import ResourcesPage from './components/ResourcesPageTailwind';

// Booking + Ticket system
import Navbar from './layout/Navbar';
import BWSidebar from './layout/BWSidebar';

import BWCreateBooking from './pages/BWCreateBooking';
import BWMyBookings from './pages/BWMyBookings';
import BWAdminBookingList from './pages/BWAdminBookingList';

import CreateTicketPage from './pages/CreateTicketPage';
import TicketDashboardPage from './pages/TicketDashboardPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

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
    <div className="mb-6 flex space-x-4 border-b border-slate-200">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `pb-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Facility Bookings</h1>
          <BookingTabs />
          {children}
        </div>
      </main>
    </div>
  </div>
);

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return <div>Missing Google Client ID</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <Router>

            {/* Global Navbar */}
            <Navbar />

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
                path="/create"
                element={
                  <PrivateRoute
                    element={<Layout><CreateTicketPage /></Layout>}
                  />
                }
              />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;