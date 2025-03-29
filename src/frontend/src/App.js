// frontend/src/App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import authenticatie componenten
import Signup from './components/Signup';
import Login from './components/Login';

// Import Home component (bevat header, main en sidebar)
import Home from './components/Home components/Home';

// Import feature componenten voor de quiz functionaliteit
import Quiz from './components/feature components/Quiz';
import Followers from './components/feature components/Followers';
import QuizMaker from './components/feature components/QuizMaker';
import Profile from './components/feature components/Profile';

// Import MyQuizzes component (lijst met eigen quizzes)
import MyQuizzes from './components/feature components/MyQuizzes';
import QuizSimulator from './components/feature components/QuizSimulator';

/**
 * App Component
 *
 * Dit is het hoofdnavigatiepunt van de applicatie.
 * Hier worden de routes gedefinieerd en wordt de authenticatiestatus beheerd.
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Callback functie die wordt aangeroepen bij succesvol inloggen
  const handleLogin = () => setIsAuthenticated(true);

  // Callback functie die wordt aangeroepen bij uitloggen
  const handleLogout = () => {
    setIsAuthenticated(false);
    // Eventueel extra logica toevoegen bij uitloggen
  };

  return (
    <Routes>
      {/* Route voor de interactieve Quiz */}
      <Route 
        path="/simulate/:quizId" 
        element={<QuizSimulator />} 
      />
      {/* Route voor de interactieve Quiz */}
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
      {/* Route voor registratie */}
      <Route
        path="/signup"
        element={<Signup onSignup={() => { /* eventueel na signup */ }} />}
      />
      {/* Route voor inloggen */}
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} />}
      />
      {/* Route voor gebruikersprofiel */}
      <Route path="/profile" element={<Profile />} />
      {/* Route voor volgers */}
      <Route path="/followers" element={<Followers />} />
      {/* Route voor Quiz Maker */}
      <Route path="/quiz-maker" element={<QuizMaker />} />
      <Route path="/quiz/new" element={<QuizMaker />} />
      <Route path="/quiz/edit/:id" element={<QuizMaker />} />
      {/* Route voor MyQuizzes (lijst met eigen quizzes) */}
      <Route
        path="/my-quizzes"
        element={
          isAuthenticated ? (
            <MyQuizzes />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Route voor de Home pagina */}
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
      {/* Alle andere routes leiden door naar login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
