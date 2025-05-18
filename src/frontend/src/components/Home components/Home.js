// src/frontend/src/components/Home components/Home.js
/**
 * Home page component for the application.
 * 
 * This component serves as the main layout for the authenticated user's home page.
 * It includes a header, navigation sidebar, and main content area, and handles
 * authentication verification and logout functionality.
 */
import React, { useEffect } from 'react';
import Header from './Header'; // Assuming Header component exists and is correct
import NavigationSidebar from './NavigationSidebar'; // Assuming Sidebar component exists and is correct
import { Main } from './Main'; // Import the Main component (which renders the sections)
import { useNavigate } from 'react-router-dom';

// Define approx header height for padding calculation
const HEADER_HEIGHT = '70px'; // Adjust this value if your header's actual height differs

/**
 * Home component that serves as the main layout for authenticated users.
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLogout - Callback function to execute when user logs out
 * @returns {JSX.Element} The rendered home page
 */
const Home = ({ onLogout }) => {
  const navigate = useNavigate();

  /**
   * Effect hook to verify authentication status when component mounts.
   * 
   * Makes an API request to check if the user is authenticated.
   * If authentication fails, logs the user out and redirects to the login page.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await fetch('/api/home', { credentials: 'include' });
        if (!resp.ok) {
          console.warn("Home auth check failed. Status:", resp.status);
          // Redirect to login if not authenticated
          if (onLogout) onLogout(); // Clear any local auth state if function provided
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Error during auth check on Home:', err);
        // Handle network error, maybe redirect?
         if (onLogout) onLogout();
         navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate, onLogout]); // Add onLogout to dependencies if it can change


  /**
   * Handles the user logout process.
   * 
   * Sends a logout request to the API, clears local authentication state,
   * and redirects the user to the login page.
   */
  const handleLogoutClick = async () => {
    try {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch(err) {
        console.error("Logout failed:", err);
    } finally {
        if (onLogout) onLogout(); // Clear local state via App.js callback
        navigate('/login', { replace: true }); // Redirect to login
    }
  };

  return (
    // Use flexbox to structure the page vertically
    // Set explicit height and prevent outer div from scrolling
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header remains fixed at the top */}
      <Header onLogout={handleLogoutClick} /> {/* Pass logout handler if Header needs it */}

      {/* This div holds the sidebar and main content */}
      {/* It starts below the header because of the overall flex structure */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', marginTop: HEADER_HEIGHT /* Make space for fixed header */ }}>

          {/* Sidebar takes fixed width, doesn't grow or shrink */}
          {/* It now sits correctly within the flex container below the header */}
          <NavigationSidebar style={{ flexShrink: 0, width: '250px', height: '100%', overflowY: 'auto' }} />

         {/* Main content area wrapper */}
         {/* flexGrow: 1 makes it take remaining horizontal space */}
         {/* overflowY: 'auto' allows ONLY this area to scroll vertically if needed */}
         {/* Padding added internally to the Main component or its container */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
             {/* Main component now renders the content sections internally */}
             {/* Add padding inside Main or its container if needed */}
            <Main />
        </div>
      </div>
    </div>
  );
};

export default Home;
