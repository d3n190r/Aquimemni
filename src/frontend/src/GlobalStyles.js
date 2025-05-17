import {useEffect} from 'react';
import {getBlack, getWhite, useDarkMode} from './ThemeContext';

// Function to apply global styles based on darkMode
const applyGlobalStyles = (darkMode) => {
  let styleTag = document.getElementById('dynamic-styles');

  if (!styleTag) {
    // Create and append the style tag if it doesn't exist
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-styles';
    document.head.appendChild(styleTag);
  }

  // Safely assign styles to the style tag
  styleTag.innerText = `
    /* Change meaning of text-muted */
    .text-muted {
      color: ${darkMode ? '#888' : '#6c757d'} !important;
    }
    
    /* Change meaning of bg-light */
    .bg-light {
      background-color: ${darkMode ? getBlack() : getWhite()} !important;
    }
    
    /* Change appearance of dropdown menu */
    .react-select__control z{
      background-color: ${darkMode ? getBlack() : getWhite()} !important;
      color: ${darkMode ? getWhite() : getBlack()} !important;
    }
   
    
    body {
      background-color: ${darkMode ? getBlack() : getWhite()};
      color: ${darkMode ? getWhite() : getBlack()};
      font-family: 'Arial', 'Helvetica', sans-serif;
      margin: 0;
      padding: 0;
    }

    .input-group, input, select, textarea {
      background-color: ${darkMode ? getBlack() : getWhite()} !important;
      color: ${darkMode ? getWhite() : getBlack()} !important;
      border-color: ${darkMode ? '#444' : '#ccc'} !important;
    }

    .btn {
      background-color: transparent;
      color: ${darkMode ? getWhite() : getBlack()};
    }

    .card {
      background-color: ${darkMode ? '#222' : '#fff'};
      color: ${darkMode ? getWhite() : getBlack()};
      box-shadow: ${darkMode ? '0 2px 3px rgba(255, 255, 255, 0.1)' : '0 2px 3px rgba(0, 0, 0, 0.1)'};
    }

    .form-control::placeholder {
      color: ${darkMode ? '#555' : '#666'};
    }
  `;
};

// Component that applies global styles
const GlobalStyles = () => {
  const { darkMode } = useDarkMode();

  useEffect(() => {
    applyGlobalStyles(darkMode); // Apply the correct global styles on darkMode change
  }, [darkMode]); // Reapply styles when the dark mode state changes

  return null;
};

export default GlobalStyles;