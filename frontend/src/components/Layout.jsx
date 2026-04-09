import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100 font-['Poppins',sans-serif]">
      <Sidebar />
      <main className="scrollbar-ui flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
