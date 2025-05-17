import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the theme (dark/light mode)
const ThemeContext = createContext();

export const useDarkMode = () => {
  return useContext(ThemeContext);
};

// Define colors for dark and light modes
export const getBlack = () => '#121212';
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

    // Set initial state based on system preference
    setDarkMode(mediaQuery.matches);

    // Listen for system dark mode preference changes
    mediaQuery.addEventListener('change', handleColorModeChange);

    // Clean up listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleColorModeChange);
    };
  }, []);

  // Function to toggle dark mode manually
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};