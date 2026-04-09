import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * React App Entry Point
 * 
 * Renders the main App component into the root DOM element
 * Enables React Strict Mode for development warnings
 */

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
