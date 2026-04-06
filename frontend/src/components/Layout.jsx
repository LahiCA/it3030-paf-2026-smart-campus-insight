import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

/**
 * Layout Component
 * 
 * Wrapper component that provides consistent layout for authenticated pages
 * Includes Navbar at top and content area below
 * 
 * Props:
 * - children: React components to render as page content
 * 
 * Example:
 * <Layout>
 *   <Dashboard />
 * </Layout>
 */

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content area */}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
