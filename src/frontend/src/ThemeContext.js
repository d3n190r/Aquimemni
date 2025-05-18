import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the theme (dark/light mode)
const ThemeContext = createContext();

export const useDarkMode = () => {
  return useContext(ThemeContext);
};

// Define colors for dark and light modes
export const getBlack = () => '#111112';
export const getWhite = () => '#ffffff';

// Create a ThemeProvider component to provide the theme state
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Effect to handle system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorModeChange = (e) => {
      setDarkMode(e.matches);
    };

    // Set initial state & listen for preference changes
    setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleColorModeChange);

    // Clean up listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleColorModeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};