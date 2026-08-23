import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dashboard-theme') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);
    const themeClasses = Array.from(document.body.classList).filter(c => c.startsWith('theme-'));
    themeClasses.forEach(c => document.body.classList.remove(c));
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme requires ThemeProvider parent context');
  return ctx;
}
