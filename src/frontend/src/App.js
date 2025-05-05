// frontend/src/App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';

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
import Settings from './components/feature components/Settings';
import QuizDetails from './components/feature components/QuizDetails';
console.log('QuizDetails is', QuizDetails);

// Import MyQuizzes component (lijst met eigen quizzes)
import MyQuizzes from './components/feature components/MyQuizzes';
import QuizSimulator from './components/feature components/QuizSimulator';
import QuizSession from './components/feature components/QuizSession';
import SessionResults from './components/feature components/SessionResults'; // << NIEUW

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
        element={<QuizSimulator />} // Blijft ongewijzigd, pakt session uit params
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

      {/* Route naar quizdetail */}
      <Route path="/quiz/:quizId" element={<QuizDetails />}/> {/* Hersteld */}

      {/* Route voor Quiz Maker */}
      <Route path="/quiz-maker" element={<QuizMaker />} />

      <Route path="/quiz/new" element={<QuizMaker/>} />

      <Route path="/quiz/edit/:id" element={<QuizMaker/>} />

      {/* Route voor MyQuizzes (lijst met eigen quizzes) */}
      <Route
        path="/my-quizzes"
        element={<MyQuizzes />}
      />

      {/* Route voor de Home pagina */}
      <Route
        path="/home"
        element={<Home onLogout={handleLogout} />}
      />

      {/* Route voor de Instellingen pagina */}
      <Route
        path="/settings"
        element={<Settings />}
      />
      {/* Route voor de Quiz Sessie Lobby/Spel */}
      <Route
        path="/session/:code"
        element={<QuizSession />}
      />

      {/* NIEUWE Route voor de Sessie Resultaten Pagina */}
      <Route
        path="/session/:quizId/results"
        element={<SessionResults />}
      />

      {/* Alle andere routes leiden door naar login */}
      <Route path="*" element={<Navigate to="/home" replace />} />

    </Routes>
  );
}

export default App;