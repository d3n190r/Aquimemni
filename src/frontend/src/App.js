// frontend/src/App.js
import React, { useState, useEffect /* Import useEffect */ } from 'react'; // Added useEffect
import { Routes, Route, Navigate, useLocation /* Import useLocation */ } from 'react-router-dom';

// Import authenticatie componenten
import Signup from './components/Signup';
import Login from './components/Login';

// Import Home component (bevat header, main en sidebar)
import Home from './components/Home components/Home';

// Import feature componenten voor de quiz functionaliteit
// import Quiz from './components/feature components/Quiz'; // Quiz seems unused directly in App routes
import Followers from './components/feature components/Followers';
import QuizMaker from './components/feature components/QuizMaker';
import Profile from './components/feature components/Profile'; // This is for the logged-in user's own profile
import Settings from './components/feature components/Settings';
import QuizDetails from './components/feature components/QuizDetails';
// console.log('QuizDetails is', QuizDetails); // Keep for debugging if needed

// Import MyQuizzes component (lijst met eigen quizzes)
import MyQuizzes from './components/feature components/MyQuizzes';
import QuizSimulator from './components/feature components/QuizSimulator';
import QuizSession from './components/feature components/QuizSession';
import SessionResults from './components/feature components/SessionResults';

// Import the new PublicProfileView component
import PublicProfileView from './components/feature components/ProfileView'; // Adjust path if necessary

/**
 * App Component
 *
 * Dit is het hoofdnavigatiepunt van de applicatie.
 * Hier worden de routes gedefinieerd en wordt de authenticatiestatus beheerd.
 */
function App() {
  // Initialize isAuthenticated from sessionStorage or default to false
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const location = useLocation(); // Get current location

  // Update sessionStorage when isAuthenticated changes
  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  // Callback functie die wordt aangeroepen bij succesvol inloggen
  const handleLogin = () => setIsAuthenticated(true);

  // Callback functie die wordt aangeroepen bij uitloggen
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated'); // Clear session storage on logout
    // navigate('/login') will be handled by protected routes or component logic
  };

  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      // Store the intended path to redirect after login
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signup" element={<Signup onSignup={() => { /* eventueel na signup */ }} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* --- NEW PUBLIC PROFILE ROUTE --- */}
      <Route path="/profile/view/:userId" element={
        <ProtectedRoute>
          <PublicProfileView />
        </ProtectedRoute>
      } />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/simulate/:quizId" element={<ProtectedRoute><QuizSimulator /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
      <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizDetails /></ProtectedRoute>} />
      <Route path="/quiz-maker" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/quiz/new" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/quiz/edit/:id" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
      <Route path="/my-quizzes" element={<ProtectedRoute><MyQuizzes /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/session/:code" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />
      {/* Original path for session results was /session/:quizId/results */}
      {/* Ensure this matches how SessionResults expects its params if quizId is still primary */}
      <Route path="/session/results/:sessionCode" element={<ProtectedRoute><SessionResults /></ProtectedRoute>} />


      {/* Fallback: Redirect to home if authenticated, else to login */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
    </Routes>
  );
}

export default App;