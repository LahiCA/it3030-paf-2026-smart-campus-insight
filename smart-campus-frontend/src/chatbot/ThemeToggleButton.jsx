import React, { useEffect, useState } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

const getInitialTheme = () => {
  const stored = localStorage.getItem('smart-campus-theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('smart-campus-theme', theme);
  }, [isDark, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-24 right-6 z-9999 w-12 h-12 rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <IoSunnyOutline size={22} /> : <IoMoonOutline size={22} />}
    </button>
  );
};

export default ThemeToggleButton;
