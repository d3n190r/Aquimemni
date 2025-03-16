    // frontend/src/App.js
    import React from 'react'
    import { useState } from 'react';
    import { Routes, Route, Navigate } from 'react-router-dom';
    import Signup from './components/Signup';
    import Login from './components/Login';
    import Home from './components/Home components/Home';
    import Quiz from './components/feature components/Quiz';
    import Followers from './components/feature components/Followers'
    import QuizMaker from './components/feature components/QuizMaker'
    import Profile from './components/feature components/Profile'

    function App() {
      const [isAuthenticated, setIsAuthenticated] = useState(false);

      // Callback functies om status te wijzigen
      const handleLogin = () => setIsAuthenticated(true);
      const handleLogout = () => {
        setIsAuthenticated(false);
        // Bij uitloggen omleiden naar login
        // (We kunnen <Navigate> hieronder gebruiken in routes in plaats van hier.)
      };

      return (
        <Routes>
          <Route
            path="/quiz"
            element={
              isAuthenticated ? (
                <Quiz onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={<Signup onSignup={() => {/* eventueel iets doen na signup */}} />}
          />
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route
            path="/followers"
            element={<Followers />}
          />
          <Route
            path="/quiz-maker"
            element={<QuizMaker />}
          />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Home onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Alle andere routes verwijzen we door naar login of signup */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

    export default App;
