// frontend/src/App.js
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };

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