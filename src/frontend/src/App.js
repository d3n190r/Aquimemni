// frontend/src/App.js
/**
 * Main application component for the Aquimemni frontend.
 * 
 * This component handles routing, authentication state management, and protected routes.
 * It serves as the entry point for the React application and defines the overall structure
 * of the user interface.
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home components/Home';
// import Quiz from './components/feature components/Quiz'; // Lijkt ongebruikt
import Followers from './components/feature components/Followers';
import QuizMaker from './components/feature components/QuizMaker';
import Profile from './components/feature components/Profile';
import Settings from './components/feature components/Settings';
import QuizDetails from './components/feature components/QuizDetails';
import MyQuizzes from './components/feature components/MyQuizzes';
import QuizSimulator from './components/feature components/QuizSimulator';
import QuizSession from './components/feature components/QuizSession';
import SessionResults from './components/feature components/SessionResults';
import ProfileView from './components/feature components/ProfileView'; // Nieuwe import

/**
 * Main App component that manages authentication state and routing.
 * 
 * @returns {JSX.Element} The rendered application with all routes.
 */
function App() {
  // Initialize authentication state from session storage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const location = useLocation();

  // Persist authentication state to session storage
  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  /**
   * Sets the authentication state to true when user logs in.
   */
  const handleLogin = () => setIsAuthenticated(true);

  /**
   * Sets the authentication state to false and clears session storage when user logs out.
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };

  /**
   * Component that protects routes from unauthenticated access.
   * Redirects to login page if user is not authenticated.
   * 
   * @param {Object} props - Component properties
   * @param {React.ReactNode} props.children - Child components to render if authenticated
   * @returns {JSX.Element} Either the protected content or a redirect to login
   */
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signup" element={<Signup onSignup={() => {}} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* Public Profile View - Beschermd zodat alleen ingelogde gebruikers andere profielen kunnen zien */}
      <Route path="/profile/view/:userId" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/simulate/:quizId" element={<ProtectedRoute><QuizSimulator /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Eigen profiel */}
      <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
      <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizDetails /></ProtectedRoute>} />
      <Route path="/quiz-maker" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/quiz/new" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/quiz/edit/:id" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/my-quizzes" element={<ProtectedRoute><MyQuizzes /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/session/:code" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />

      {/* GEWIJZIGDE ROUTE: /session/results/:sessionCode */}
      <Route path="/session/results/:sessionCode" element={<ProtectedRoute><SessionResults /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
