import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <>
      <style>{`
        .ly-root { display: flex; height: 100vh; min-height: 100vh; background-color: #f5f7fa; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .ly-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
        .ly-content > * { flex-grow: 1; }
        .ly-content::-webkit-scrollbar { width: 8px; }
        .ly-content::-webkit-scrollbar-track { background: #f0f0f0; }
        .ly-content::-webkit-scrollbar-thumb { background: #c0c0c0; border-radius: 4px; }
        .ly-content::-webkit-scrollbar-thumb:hover { background: #999; }
      `}</style>
      <div className="ly-root">
        <Sidebar />
        <main className="ly-content">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
