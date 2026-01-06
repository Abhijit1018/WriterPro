import React, { useEffect, useState } from 'react';

const ThemeToggle = ({ size = 'sm' }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const base = 'inline-flex items-center gap-2 rounded-lg font-semibold transition-colors';
  const sizes = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-base';

  return (
    <button
      onClick={toggle}
      title="Toggle theme"
      className={`${base} ${sizes} border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-500 dark:border-white/20 dark:text-white dark:hover:text-emerald-200`}
    >
      <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white" />
      {theme === 'dark' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeToggle;
