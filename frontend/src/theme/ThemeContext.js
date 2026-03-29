import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'leafai_theme_preference';

/**
 * ThemeProvider Component
 * Manages dark/light theme state and CSS variables
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeTo = (themeName) => {
    if (['dark', 'light'].includes(themeName)) {
      setTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeTo }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Access current theme and theme controls
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
