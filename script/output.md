# File Structure of /home/gumbr/projects/Aquimemni

```
├── .gitignore
├── README.md
├── flask_session/
│   ├── 2029240f6d1128be89ddc32729463129
│   └── cbed53fd497c46c6bd744876e3203e5a
├── nginx/
│   └── webapp
├── requirements.txt
├── script/
│   ├── MarkDownMaker.py
│   ├── input.json
│   ├── output.md
│   └── run_dev.sh
├── service/
│   └── webapp.service
├── sql/
│   └── schema.sql
├── src/
│   ├── __init__.py
│   ├── __pycache__/
│   │   ├── __init__.cpython-311.pyc
│   │   ├── __init__.cpython-312.pyc
│   │   ├── app.cpython-311.pyc
│   │   ├── config.cpython-311.pyc
│   │   └── wsgi.cpython-311.pyc
│   ├── backend/
│   │   ├── .gitignore
│   │   ├── Answers.py
│   │   ├── Questions.py
│   │   ├── __init__.py
│   │   ├── __pycache__/
│   │   │   ├── __init__.cpython-311.pyc
│   │   │   ├── __init__.cpython-312.pyc
│   │   │   ├── app.cpython-311.pyc
│   │   │   ├── app.cpython-312.pyc
│   │   │   ├── config.cpython-311.pyc
│   │   │   └── config.cpython-312.pyc
│   │   ├── app.py
│   │   ├── config.py
│   │   ├── init_flask.py
│   │   ├── session.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       └── test_app.py
│   ├── flask_session/
│   │   ├── 1576298c627bab07356c5588b8832332
│   │   ├── 2029240f6d1128be89ddc32729463129
│   │   ├── 28a50a0135bf00bfd744c1ad4da08b09
│   │   ├── 58b341d45b48d109527d28a4be96e6ae
│   │   ├── 5d395abeca8d154a76f83e0249de68ad
│   │   ├── 6029f014faf1b18b3471d0ab4fe43fda
│   │   ├── be91ae7c43bfbf1899cd75b7467372f3
│   │   └── e6cd5c263ffb708f651901c3a6a4d0f2
│   ├── frontend/
│   │   ├── .gitignore
│   │   ├── README.md
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── public/
│   │   │   ├── avatars/
│   │   │   │   ├── avatar1.png
│   │   │   │   ├── avatar10.png
│   │   │   │   ├── avatar11.png
│   │   │   │   ├── avatar12.png
│   │   │   │   ├── avatar2.png
│   │   │   │   ├── avatar3.png
│   │   │   │   ├── avatar4.png
│   │   │   │   ├── avatar5.png
│   │   │   │   ├── avatar6.png
│   │   │   │   ├── avatar7.png
│   │   │   │   ├── avatar8.png
│   │   │   │   └── avatar9.png
│   │   │   ├── banners/
│   │   │   │   ├── banner1.jpg
│   │   │   │   ├── banner2.jpg
│   │   │   │   ├── banner3.jpg
│   │   │   │   ├── banner4.jpg
│   │   │   │   ├── banner5.jpg
│   │   │   │   └── banner6.jpg
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   └── logo.png
│   │   └── src/
│   │       ├── App.js
│   │       ├── components/
│   │       │   ├── Home components/
│   │       │   │   ├── Header.jsx
│   │       │   │   ├── Home.js
│   │       │   │   ├── Main.jsx
│   │       │   │   ├── NavigationSidebar.jsx
│   │       │   │   ├── index.css
│   │       │   │   └── tests/
│   │       │   │       └── Main.test.jsx
│   │       │   ├── Login.js
│   │       │   ├── Signup.js
│   │       │   ├── feature components/
│   │       │   │   ├── BUGS/
│   │       │   │   │   └── ToDo.md
│   │       │   │   ├── Followers.jsx
│   │       │   │   ├── MyQuizzes.jsx
│   │       │   │   ├── Profile.css
│   │       │   │   ├── Profile.jsx
│   │       │   │   ├── ProfileView.jsx
│   │       │   │   ├── Quiz.js
│   │       │   │   ├── QuizDetails.jsx
│   │       │   │   ├── QuizMaker.jsx
│   │       │   │   ├── QuizSession.jsx
│   │       │   │   ├── QuizSimulator.jsx
│   │       │   │   ├── SessionResults.jsx
│   │       │   │   ├── Settings.jsx
│   │       │   │   └── tests/
│   │       │   │       ├── MyQuizzes.test.jsx
│   │       │   │       ├── QuizMaker.test.jsx
│   │       │   │       └── QuizSimulator.test.jsx
│   │       │   └── tests/
│   │       │       ├── Quiz.test.js
│   │       │       ├── login.test.jsx
│   │       │       └── signup.test.jsx
│   │       ├── index.js
│   │       └── setupProxy.js
│   └── wsgi.py
```

## requirements.txt

```
Flask==3.1.0
Flask-SQLAlchemy==3.0.5
Flask-Session==0.5.0 
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
psycopg2-binary==2.9.7
psycopg==3.2.4
gunicorn==23.0.0
pytest==8.3.5
```

## src/wsgi.py

```
from backend.app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creëert de tabel 'users' als deze nog niet bestaat
    app.run()

```

## src/__init__.py

```

```

## src/frontend/src/setupProxy.js

```
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',  // /api/signup -> /signup
      },
    })
  );
};

```

## src/frontend/src/App.js

```
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
import ProfileView from './components/feature components/ProfileView'; // Adjust path if necessary

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
          <ProfileView />
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
```

## src/frontend/src/index.js

```
// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS importeren
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';  

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

```

## src/frontend/src/components/Login.js

```
// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Optioneel: importeer een custom CSS-bestand als je paginaspecifieke stijlen nodig hebt
// import './Login.css'; // Je kunt dit bestand aanmaken als Bootstrap niet volstaat

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const APP_NAME = "Aquimemni"; // Definieer hier de naam van je app

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      if (!trimmedUsername || !trimmedPassword) {
        setError('Username and password are required.');
        return;
      }
      if (trimmedUsername.length > 32) {
        setError('Username cannot exceed 32 characters.');
        return;
      }
      if (trimmedPassword.length > 64) {
        setError('Password cannot exceed 64 characters.');
        return;
      }
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
        credentials: 'include'
      });
      if (response.ok) {
        onLogin && onLogin();
        navigate('/home');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error: Please try again');
      console.error(err);
    }
  };

  return (
    // Hoofdcontainer om content op de pagina te centreren
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' /* Subtiele achtergrondkleur */ }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card shadow-lg border-0 rounded-4 my-5"> {/* Afgeronde hoeken en meer schaduw */}
          <div className="card-body p-4 p-sm-5"> {/* Meer padding, vooral op grotere schermen */}
            <div className="text-center mb-4">
              <img src="/logo.png" alt="App Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem' }} />
              {/* App Naam Weergave */}
              <h1 className="h2 fw-bold mb-2">{APP_NAME}</h1>
              <p className="text-muted small">Welcome back! Please login to your account.</p>
            </div>

            {/* Het "Login" kopje kan weg als de titel al hierboven staat */}
            {/* <h2 className="mb-4 text-center">Login</h2> */}

            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

              <div className="form-floating mb-3"> {/* Gebruik form-floating voor moderne labels */}
                <input
                  type="text"
                  id="loginUsername"
                  className={`form-control ${error && !username ? 'is-invalid' : ''}`}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  maxLength="32"
                  placeholder="Enter your username" // Placeholder wordt label in form-floating
                />
                <label htmlFor="loginUsername"><i className="bi bi-person-fill me-2"></i>Username</label>
              </div>

              <div className="form-floating mb-3 position-relative"> {/* Gebruik form-floating */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  className={`form-control pe-5 ${error && !password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  maxLength="64"
                  placeholder="Enter your password" // Placeholder wordt label
                />
                <label htmlFor="loginPassword"><i className="bi bi-lock-fill me-2"></i>Password</label>
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-3" // Aangepaste positionering voor form-floating
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    height: '100%', // Zorg dat de knop de hoogte van het inputveld vult
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 5 // Zorg dat het boven de input staat
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>
              </div>

              {/* Optioneel: Remember me en Forgot password (voorbeeld, pas aan indien nodig) */}
              {/* <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                  <label className="form-check-label small" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a href="#!" className="text-decoration-none small">Forgot password?</a>
              </div> */}

              <button type="submit" className="btn btn-primary w-100 btn-lg mt-4 py-2"> {/* Grotere en iets hogere knop */}
                Login
              </button>
            </form>

            <div className="text-center mt-4 pt-2">
              <p className="mb-1 text-muted small">Don't have an account?</p>
              <button
                type="button"
                className="btn btn-link fw-medium p-0" // p-0 om standaard padding van btn-link te verwijderen indien gewenst
                onClick={() => navigate('/signup')}
                style={{ fontSize: '0.95rem' }}
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-muted small mt-4">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
```

## src/frontend/src/components/Signup.js

```
// frontend/src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Optioneel: import './Signup.css'; // Voor paginaspecifieke stijlen

function Signup({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState('');
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const APP_NAME = "Aquimemni"; // Definieer hier de naam van je app

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedPassword2 = password2.trim();
    if (trimmedUsername.length > 32) {
       setError('Username cannot exceed 32 characters.');
       return;
    }
    if (trimmedPassword.length > 64) {
       setError('Password cannot exceed 64 characters.');
       return;
    }
    if (!trimmedUsername || !trimmedPassword || !trimmedPassword2) {
      setError('All fields are required.');
      return;
    }
    if (trimmedPassword !== trimmedPassword2) {
      setError('Passwords do not match!');
      return;
    }
    try {
       const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
        credentials: 'include'
      });
      if (response.status === 201) {
        onSignup && onSignup();
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error: Please try again');
      console.error(err);
    }
  };

  return (
    // Hoofdcontainer om content op de pagina te centreren
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' /* Subtiele achtergrondkleur */ }}>
      <div className="container" style={{ maxWidth: '480px' }}> {/* Iets breder voor meer velden */}
        <div className="card shadow-lg border-0 rounded-4 my-5">
          <div className="card-body p-4 p-sm-5">
            <div className="text-center mb-4">
              {/* Geen logo hier, om het niet te druk te maken. De app naam is leidend. */}
              {/* <img src="/logo.png" alt="App Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem' }} /> */}
              <h1 className="h2 fw-bold mb-2">{APP_NAME}</h1>
              <p className="text-muted small">Create your account to get started.</p>
            </div>

            {/* <h2 className="mb-4 text-center">Sign Up</h2> */}

            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

              <div className="form-floating mb-3">
                <input
                  type="text"
                  id="signupUsername"
                  className={`form-control ${error && !username ? 'is-invalid' : ''}`}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  maxLength="32"
                  placeholder="Choose a username"
                />
                <label htmlFor="signupUsername"><i className="bi bi-person-plus-fill me-2"></i>Username</label>
              </div>

              <div className="form-floating mb-3 position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signupPassword"
                  className={`form-control pe-5 ${error && (!password || password !== password2) ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  maxLength="64"
                  placeholder="Create a password"
                />
                <label htmlFor="signupPassword"><i className="bi bi-shield-lock-fill me-2"></i>Password</label>
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-3"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', zIndex: 5 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>
              </div>

              <div className="form-floating mb-3 position-relative">
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  id="signupPassword2"
                  className={`form-control pe-5 ${error && (!password2 || password !== password2) ? 'is-invalid' : ''}`}
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  required
                  maxLength="64"
                  placeholder="Confirm your password"
                />
                <label htmlFor="signupPassword2"><i className="bi bi-shield-check me-2"></i>Confirm Password</label>
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0 me-3"
                  onClick={() => setShowPassword2(!showPassword2)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', zIndex: 5 }}
                  aria-label={showPassword2 ? "Hide password confirmation" : "Show password confirmation"}
                >
                  <i className={`bi ${showPassword2 ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>
              </div>

              <button type="submit" className="btn btn-primary w-100 btn-lg mt-4 py-2">
                Create Account
              </button>
            </form>

            <div className="text-center mt-4 pt-2">
              <p className="mb-1 text-muted small">Already have an account?</p>
              <button
                type="button"
                className="btn btn-link fw-medium p-0" // Was btn-secondary
                onClick={() => navigate('/login')}
                style={{ fontSize: '0.95rem' }}
              >
                Login Here
              </button>
            </div>
          </div>
        </div>
         <p className="text-center text-muted small mt-4">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Signup;
```

## src/frontend/src/components/feature components/SessionResults.jsx

```
// src/frontend/src/components/feature components/SessionResults.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const SessionResults = () => {
  const { sessionCode } = useParams(); // <<--- THIS LINE IS CHANGED
  // const [searchParams] = useSearchParams(); // This line can be removed if searchParams is not used for anything else.
                                            // If it IS used for other query params, you can keep it.
  const [results, setResults] = useState([]);
  const [teamResults, setTeamResults] = useState(null); // State voor team scores
  const [sessionInfo, setSessionInfo] = useState(null); // State voor sessie info (o.a. team modus)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionCode) {
      setError('Session code missing from URL.');
      setLoading(false);
      return;
    }

    const fetchSessionData = async () => {
        try {
             // Eerst sessie info halen om team modus te checken
             const sessionRes = await fetch(`/api/sessions/${sessionCode}`, { credentials: 'include' });
             if (!sessionRes.ok) throw new Error('Could not load session information');
             const sessionData = await sessionRes.json();
             setSessionInfo(sessionData);

             // Dan resultaten halen
             const resultsRes = await fetch(`/api/sessions/${sessionCode}/results`, { credentials: 'include' });
             if (!resultsRes.ok) throw new Error('Could not load session results');
             const resultsData = await resultsRes.json();
             setResults(resultsData); // Backend geeft al gesorteerde lijst

            // Bereken team scores als het team modus is
            if (sessionData.is_team_mode) {
                 calculateTeamScores(resultsData, sessionData.num_teams);
            }

        } catch (err) {
            console.error('Failed to fetch session data:', err);
            setError(err.message || 'Failed to load session data.');
        } finally {
            setLoading(false);
        }
    };

    fetchSessionData();
  }, [sessionCode]); // Afhankelijk van sessionCode

  // Functie om team scores te berekenen
  const calculateTeamScores = (participantResults, numTeams) => {
        const teams = {};
        for (let i = 1; i <= numTeams; i++) {
            teams[i] = { totalScore: 0, memberCount: 0, members: [] };
        }

        participantResults.forEach(p => {
            if (p.team_number && teams[p.team_number]) {
                teams[p.team_number].totalScore += p.score || 0;
                teams[p.team_number].memberCount++;
                teams[p.team_number].members.push(p.username); // Optioneel: track leden
            }
        });

        // Converteer naar array en bereken gemiddelde (optioneel)
        const teamArray = Object.entries(teams).map(([teamNum, data]) => ({
            team: teamNum,
            totalScore: data.totalScore,
            averageScore: data.memberCount > 0 ? (data.totalScore / data.memberCount).toFixed(2) : 0,
            memberCount: data.memberCount
        }));

        // Sorteer teams op totaalscore
        teamArray.sort((a, b) => b.totalScore - a.totalScore);

        setTeamResults(teamArray);
    };


  // Render logica
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <div className="text-center">
            <button className="btn btn-secondary" onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container quiz-results mt-5">
      {/* Header */}
      <div className="result-header p-4 bg-primary text-white rounded-3 text-center mb-5">
        <h2 className="mb-3">🏆 Session Results 🏆</h2>
        <p className="fs-5">
          {sessionInfo?.quiz_name || 'Quiz'} Results (Code: {sessionCode})
        </p>
      </div>

      {/* Team Results (if applicable) */}
      {teamResults && (
        <>
            <h3 className="mt-5 mb-3 text-center text-primary">Team Standings</h3>
             <div className="row justify-content-center g-3">
                {teamResults.map((team, index) => (
                 <div key={team.team} className="col-md-4 col-lg-3">
                    <div className={`card text-center shadow-sm h-100 ${index === 0 ? 'border-warning border-2' : 'border-light'}`}>
                        <div className="card-header bg-info-subtle text-info-emphasis">
                            <strong>Team {team.team}</strong> {index === 0 && '🥇'}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            <p className="display-6 fw-bold mb-1">{team.totalScore.toFixed(0)}</p>
                            <p className="text-muted mb-0">Total Points</p>
                             {/* <p className="card-text mb-0"><small>({team.memberCount} members)</small></p>
                             <p className="card-text"><small>Average: {team.averageScore}</small></p> */}
                        </div>
                    </div>
                  </div>
                ))}
            </div>
            <hr className="my-5" />
        </>
      )}


      {/* Individual Results */}
      <h3 className="mb-4 text-center">Individual Scores</h3>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {results.map((player, index) => (
          <div className="col" key={player.user_id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex align-items-center p-3">
                 {/* Rank Badge (Optional) */}
                 <span className={`badge me-3 fs-5 ${index === 0 ? 'bg-warning text-dark' : (index === 1 ? 'bg-secondary' : (index === 2 ? 'bg-dark text-white' : 'bg-light text-dark'))}`}>
                     #{index + 1}
                 </span>
                 <img
                    src={`/avatars/avatar${player.avatar || 1}.png`}
                    alt={player.username}
                    className="rounded-circle me-3 shadow-sm"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                 <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold">{player.username} {index === 0 && '👑'}</h6>
                     {player.team_number && <small className="text-muted">Team {player.team_number}</small>}
                 </div>
                 <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{player.score} pts</span>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="text-center text-muted">No participants submitted scores.</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-5 text-center d-flex justify-content-center gap-3">
        {/* --- KNOP VERWIJDERD ---
        <button
          className="btn btn-outline-secondary btn-lg"
          onClick={() => navigate(`/simulate/${quizId}?session=${sessionCode}&showResults=true`)} // Navigeer terug met showResults flag
        >
           <i className="bi bi-arrow-left-circle me-2"></i>Back to My Results
        </button>
        */}
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/home')}>
          <i className="bi bi-house-door me-2"></i>Back to Home
        </button>
      </div>
    </div>
  );
};

export default SessionResults;
```

## src/frontend/src/components/feature components/Settings.jsx

```
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to delete your account.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        setDeleteSuccess(data.message || 'Account deleted successfully.');
        sessionStorage.clear();
        navigate('/login');
      } else if (res.status === 401) {
        setDeleteError(data.error || 'Unauthorized. Please log in again.');
      } else {
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Settings</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>

      {/* Change Password */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <div className="position-relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showCurrentPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="position-relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showNewPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <div className="position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isDeleting}>
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Notifications Placeholder */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Notifications</h3>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="notificationsSwitch" disabled />
            <label className="form-check-label" htmlFor="notificationsSwitch">
              Enable Notifications (Coming Soon!)
            </label>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="card border-danger">
        <div className="card-body">
          <h3 className="card-title text-danger">Delete Account</h3>
          <p className="text-muted">
            Deleting your account will permanently remove all your data. This cannot be undone.
          </p>
          {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Delete Account
          </button>

          {/* Modal */}
          {showDeleteModal && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Account Deletion</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                    <label className="form-label">Enter your password to confirm:</label>
                    <div className="position-relative">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        className="form-control"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                        disabled={isDeleting}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        disabled={isDeleting}
                      >
                        <i className={`bi bi-eye${showDeletePassword ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
```

## src/frontend/src/components/feature components/ProfileView.jsx

```
// src/frontend/src/components/feature components/ProfileView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Profile.css'; // Using the same CSS for consistency

// --- BANNER IMAGE PATH CONSTRUCTION (Avatar-like) ---
const BANNER_IMAGE_EXTENSION_PUBLIC = '.jpg'; // Ensure this matches your files
const getBannerImagePathPublic = (identifier) => {
  // List of valid identifiers (should match backend/Profile.jsx)
  const validIdentifiers = ['1','2','3','4','5','6','default'];
  if (!identifier || !validIdentifiers.includes(identifier)) {
    identifier = 'default'; // Fallback to default identifier if invalid or missing
  }
  return `/banners/banner${identifier}${BANNER_IMAGE_EXTENSION_PUBLIC}`;
};

function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Fetch logged-in user ID to compare and enable/disable follow button
  useEffect(() => {
    const fetchOwnProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLoggedInUserId(data.id);
        }
      } catch (err) { console.error('Error fetching own profile for comparison:', err); }
    };
    fetchOwnProfile();
  }, []);

  // Fetch the public profile data for the user specified by userId
  const fetchPublicProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/users/${userId}/profile`, { credentials: 'include' });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load profile (Status: ${response.status})`);
      }
      const data = await response.json();

      // --- Data Validation ---
      // Ensure banner_value has a sane default for display if somehow missing/invalid from backend
      const validImageIdentifiers = ['1','2','3','4','5','6','default'];
      if (data.banner_type === 'image' && (!data.banner_value || !validImageIdentifiers.includes(data.banner_value))) {
          data.banner_value = 'default';
      } else if (data.banner_type === 'color' && (!data.banner_value || !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(data.banner_value))) {
          // If DB has an invalid color, fallback to default color
          data.banner_value = '#6c757d';
      } else if (!data.banner_type) { // If banner_type itself is missing
          data.banner_type = 'color';
          data.banner_value = '#6c757d';
      }

      setProfile(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [userId]);

  // Trigger fetchPublicProfile when userId changes
  useEffect(() => {
     if (userId) {
       fetchPublicProfile();
     }
   }, [userId, fetchPublicProfile]); // Include fetchPublicProfile in dependencies

  // Handle Follow/Unfollow action
  const handleFollowToggle = async () => {
    if (!profile || profile.viewing_own_profile || !loggedInUserId) return;
    const url = profile.is_following ? `/api/unfollow/${profile.id}` : `/api/follow/${profile.id}`;
    const method = 'POST';
    try {
      const response = await fetch(url, { method, credentials: 'include' });
      if (!response.ok) {
         const errData = await response.json().catch(() => ({}));
         throw new Error(errData.error || 'Follow/Unfollow action failed');
      }
      fetchPublicProfile(); // Refresh profile data to update follow status and counts
    } catch (err) {
      setError(err.message || 'An error occurred.');
      // Optional: Add temporary error display specific to follow action
    }
  };

  // Format registration date
  const formatRegistrationDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
      return new Date(isoDate).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
        return 'Invalid Date';
    }
  };

  // --- Dynamic Banner Styling ---
  const bannerStyle = profile ? {
    height: '180px', // Adjusted height for header style
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundColor: profile.banner_type === 'color' ? profile.banner_value : '#e9ecef', // Fallback BG color
    backgroundImage: profile.banner_type === 'image' ? `url(${getBannerImagePathPublic(profile.banner_value)})` : 'none',
  } : { height: '180px', backgroundColor: '#6c757d' }; // Default style while profile is loading


  // --- Render Logic ---

  if (loading) {
    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading profile...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mt-5">
            <div className="alert alert-danger">{error}</div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
  }

  if (!profile) {
    // This case should ideally not be reached if loading finishes and no error occurred,
    // but good as a safeguard.
    return (
        <div className="container mt-5">
            <div className="alert alert-warning">Profile data could not be loaded.</div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
  }

  // Determine if the follow/unfollow button should be shown
  const canFollowUnfollow = loggedInUserId && loggedInUserId !== profile.id;

  return (
    // Use outer container for page background color and padding
    <div className="profile-page-container py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">

            {/* Back Button - Positioned above the card */}
            <div className="d-flex justify-content-start mb-3">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            </div>

            {/* Main Profile Card */}
            <div className="card shadow-lg profile-view-card">

              {/* Card Header containing the banner and positioned avatar */}
              <div className="card-header p-0 position-relative profile-view-header">
                {/* Banner Div */}
                <div className="profile-banner" style={bannerStyle}></div>
                {/* Avatar positioned over the banner */}
                <img
                  src={`/avatars/avatar${profile.avatar || 1}.png`}
                  alt={`${profile.username}'s avatar`}
                  className="rounded-circle profile-view-avatar shadow"
                  // Positioning styles are in Profile.css
                />
              </div>

              {/* Card Body - Starts below header, pushed down by avatar padding */}
              <div className="card-body profile-view-body">
                {/* User Info Section */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-1">{profile.username}</h2>
                  <p className="text-muted mb-2">
                    Member since {formatRegistrationDate(profile.registered_at)}
                  </p>
                  {/* Follower/Following Counts */}
                  <div className="mb-3">
                    <span className="me-3 text-muted">
                      <i className="bi bi-people-fill"></i> {profile.followers_count} Followers
                    </span>
                    <span className="text-muted">
                      <i className="bi bi-person-plus-fill"></i> {profile.following_count} Following
                    </span>
                  </div>
                  {/* Follow/Unfollow Button */}
                  {canFollowUnfollow && (
                    <button
                      className={`btn btn-lg ${profile.is_following ? 'btn-outline-primary' : 'btn-primary'} profile-follow-btn`}
                      onClick={handleFollowToggle}
                      // Add disabled state while action is in progress if desired
                    >
                      <i className={`bi ${profile.is_following ? 'bi-person-dash' : 'bi-person-plus'} me-2`}></i>
                      {profile.is_following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="mb-4">
                    <h5 className="text-primary border-bottom pb-2 mb-3">
                      <i className="bi bi-person-badge-fill me-2"></i>About {profile.username}
                    </h5>
                    <p className="profile-bio-text">
                      {profile.bio}
                    </p>
                  </div>
                )}
                {!profile.bio && (
                  <div className="mb-4">
                     <h5 className="text-primary border-bottom pb-2 mb-3">
                       <i className="bi bi-person-badge-fill me-2"></i>About {profile.username}
                     </h5>
                     <p className="text-muted fst-italic">This user hasn't shared a bio yet.</p>
                  </div>
                )}

                {/* Quizzes Section */}
                <div className="mt-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="bi bi-controller me-2"></i>Quizzes by {profile.username} ({profile.quizzes?.length || 0})
                  </h5>
                  {profile.quizzes && profile.quizzes.length > 0 ? (
                    <div className="list-group">
                      {profile.quizzes.map(quiz => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${quiz.id}`} // Links to QuizDetails page
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1 fw-medium">{quiz.name}</h6>
                            <small className="text-muted">
                              {quiz.questions_count} questions - Created {formatRegistrationDate(quiz.created_at)}
                            </small>
                          </div>
                          <i className="bi bi-chevron-right"></i>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted fst-italic">This user hasn't created any public quizzes yet.</p>
                  )}
                </div>
              </div> {/* End card-body */}
            </div> {/* End card */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
```

## src/frontend/src/components/feature components/Profile.css

```
/* src/frontend/src/components/feature components/Profile.css */

/* --- General Styles (Apply to both Profile.jsx and ProfileView.jsx) --- */
.profile-page-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem; /* Add padding at bottom */
}

.profile-banner {
  background-color: #6c757d;
  background-size: cover;
  background-position: center;
  height: 250px; /* Default height for own profile */
  width: 100%;
  position: relative;
  transition: background-color 0.5s ease, background-image 0.5s ease;
}

.profile-content-below-banner {
  /* Container for content below the banner */
}

/* --- Styles for Profile.jsx (Editing Own Profile) --- */

/* Avatar Grid */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  background-color: #fff;
}
.avatar-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  border: 3px solid transparent;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  background-color: #e9ecef;
}
.avatar-item img { width: 100%; height: 100%; object-fit: cover; }
.avatar-item:hover { transform: scale(1.05); border-color: #a6cffc; }
.avatar-item.selected { border-color: #0d6efd; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }

/* Banner Image Grid */
.banner-image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; }
.banner-image-item { height: 70px; border-radius: 0.25rem; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: border-color 0.2s ease, transform 0.2s ease; padding: 0; background-color: #e9ecef; }
.banner-image-item img { width: 100%; height: 100%; object-fit: cover; }
.banner-image-item:hover { transform: scale(1.03); }
.banner-image-item.selected { border-color: #0d6efd; box-shadow: 0 0 8px rgba(13, 110, 253, 0.5); }

/* Banner Color Swatches */
.banner-color-swatches { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.banner-color-swatch { width: 35px; height: 35px; border-radius: 50%; border: 2px solid #ccc; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.banner-color-swatch:hover { transform: scale(1.1); }
.banner-color-swatch.selected { border-color: #000; box-shadow: 0 0 0 3px white, 0 0 0 5px #0d6efd; }

/* --- Styles specific to ProfileView.jsx (Public View) --- */

.profile-view-card {
  overflow: visible; /* Allow avatar to overflow the card boundaries */
}

.profile-view-header {
  border-bottom: none; /* Remove border below header */
  /* Banner inside header already has height set via inline style */
}

.profile-view-header .profile-banner {
   border-top-left-radius: var(--bs-card-inner-border-radius); /* Match card border radius */
   border-top-right-radius: var(--bs-card-inner-border-radius);
}

.profile-view-avatar {
  width: 150px; /* Size of the avatar */
  height: 150px;
  object-fit: cover;
  border: 5px solid white; /* White border */
  background-color: white; /* Ensure solid background */
  /* Positioning: Center horizontally, slightly overlapping the banner */
  position: absolute;
  left: 50%;
  bottom: 0; /* Align bottom of avatar with bottom of header */
  transform: translate(-50%, 50%); /* Center horizontally, move down by half its height */
  z-index: 2; /* Make sure it's above the banner */
}

.profile-view-body {
  padding-top: 90px !important; /* Adjust this value (must be > avatar_height / 2 + desired_gap) */
}

.profile-follow-btn {
  min-width: 140px; /* Ensure button has decent width */
  font-weight: 500;
}

.profile-bio-text {
  white-space: pre-wrap; /* Respect line breaks in bio */
  font-size: 1.1rem;
  color: #495057; /* Slightly darker text */
  line-height: 1.6;
}
```

## src/frontend/src/components/feature components/Quiz.js

```
/**
 * Quiz Component
 *
 * Verantwoordelijk voor het renderen en beheren van een interactieve quiz:
 * - Haalt vragen op van de Open Trivia Database API
 * - Beheert quizflow (timer, score, navigatie tussen vragen)
 * - Integreert met authenticatie via backend-endpoint
 *
 * @component
 * @param {Function} onLogout - Callback voor uitloggen bij authenticatiefouten
 * @returns {JSX.Element} Quiz UI met dynamische interacties
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unescape } from 'lodash';
import he from 'he';
import '../Home components/index.css';

function Quiz({ onLogout }) {
  // State Management
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const [answerStatus, setAnswerStatus] = useState([]);

  /**
   * Fetch Questions Effect
   * @effect
   * @desc Haalt initiale vragen op bij mount. Formateert antwoorden:
   * - Decodeert HTML-entiteiten met he-library
   * - Shuffelt antwoordopties
   * - Markeert correcte antwoordindex
   */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          'https://opentdb.com/api.php?amount=10&type=multiple&category=18'
        );
        const data = await response.json();

        const formattedQuestions = data.results.map(q => ({
          ...q,
          question: he.decode(q.question),
          options: shuffleArray([...q.incorrect_answers, q.correct_answer])
              .map(answer => he.decode(answer)),
          correct: [...q.incorrect_answers, q.correct_answer].indexOf(q.correct_answer)
        }));

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, []);

  /**
   * Timer Effect
   * @effect
   * @desc Beheert 15-seconden timer per vraag:
   * - Reset timer bij vraagwissel
   * - Auto-submit bij timeout
   * @dependencies quizStarted, showScore, currentQuestion, questions
   */
  useEffect(() => {
    if (quizStarted && !showScore && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, showScore, currentQuestion, questions]);

  /**
   * Formateert seconden naar MM:SS formaat
   * @param {number} seconds - Tijd in seconden
   * @returns {string} Geformatteerde tijd
   */
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  /**
   * Start de quiz
   * @desc Initialiseert quizstate en timer
   */
  const handleStart = () => {
    setQuizStarted(true);
    setTimeLeft(15);
  };

  /**
   * Handelt antwoordselectie af
   * @param {number} optionIndex - Index van geselecteerd antwoord
   * @desc Markeert selectie alleen als timer actief is
   */
    const handleAnswer = (optionIndex) => {
      if (timeLeft > 0) {
        setSelectedAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentQuestion] = optionIndex;
          return newAnswers;
        });
      }
    };

  /**
   * Shuffle Array Utility
   * @param {Array} array - Input array om te shufflen
   * @returns {Array} Geschudde kopie van de input array
   */
  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  /**
   * Handelt vraagovergang af
   * @desc Beheert:
   * - Score-update bij correct antwoord
   * - State-reset voor volgende vraag
   * - Eindscore weergave
   */
const handleNext = () => {
  let answerResult = "Wrong";
  const currentAnswer = selectedAnswers[currentQuestion];

  if (currentAnswer === questions[currentQuestion]?.correct) {
    setScore(score + 1);
    answerResult = "Correct";
  }

  setAnswerStatus(prev => [...prev, answerResult]);
  setTimeLeft(15);

  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(prev => prev + 1);
  } else {
    setShowScore(true);
  }
};

  /**
   * Authenticatie Check Effect
   * @effect
   * @desc Controleert sessievalidatie tijdens quiz:
   * - Fetch naar backend /home endpoint
   * - Redirect naar login bij falen
   * @dependencies quizStarted, onLogout, navigate
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await fetch('/api/home', {
          credentials: 'include'
        });
        if (!resp.ok) {
          onLogout();
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    if (quizStarted) checkAuth();
  }, [quizStarted, onLogout, navigate]);

  /**
   * Returns the text used to display which questions you got wrong/right
   *
   * @param questionNumber The number of the question you want information on
   * @returns {*|string} The text that has to be shown to the user
   */
  const getDetailledScore = (questionNumber) => {
    const result = answerStatus[questionNumber];
    if (result === "Correct") {
      return result;
    }
    return answerStatus[questionNumber];
};

  // Render logica
  if (questions.length === 0) {
    return <div className="container text-center mt-5">Loading questions...</div>;
  }

  return (
    <div className="container quiz-container" style={{ marginTop: '50px' }}>
      {!quizStarted ? (
        <div className="text-center">
          <h2>Welcome to the Quiz!</h2>
          <p>{questions.length} questions | 15 seconds per question</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
          >
            Start Quiz
          </button>
        </div>
      ) : showScore ? (
  <div className="quiz-results">
    {/* Score Header */}
    <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
      <h2 className="mb-3">🎉 Quiz Completed! 🎉</h2>
      <div className="score-display bg-white p-3 rounded-pill shadow">
        <span className="display-2 fw-bold text-dark">{score}</span>
        <span className="fs-3 text-muted">/{questions.length}</span>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-light btn-lg mx-2"
          onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setShowScore(false);
            setSelectedAnswers([]);
            setAnswerStatus([]);
          }}
        >
          ↻ Retry Quiz
        </button>
        <button
          className="btn btn-outline-light btn-lg"
          onClick={() => navigate('/home')}
        >
          🏠 Back to Home
        </button>
      </div>
    </div>

    {/* Question Cards */}
    <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
      {questions.map((q, index) => (
        <div className="col" key={index}>
          <div className={`card h-100 shadow-sm ${answerStatus[index] === 'Correct' ? 'border-success' : 'border-danger'}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Question {index + 1}</span>
              <span className={`badge ${answerStatus[index] === 'Correct' ? 'bg-success' : 'bg-danger'}`}>
                {answerStatus[index]} {answerStatus[index] === 'Correct' ? '✓' : '✗'}
              </span>
            </div>
            <div className="card-body">
              <h5 className="card-title">{q.question}</h5>
              <div className="mt-3">
                <p className="text-success mb-1">
                  <strong>Correct:</strong> {q.options[q.correct]}
                </p>
                {answerStatus[index] !== 'Correct' && (
                  <p className="text-danger mb-0">
                    <strong>Your answer:</strong> {
                      selectedAnswers[index] !== undefined
                        ? q.options[selectedAnswers[index]]
                        : 'No answer given'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
        <div>
          <div className="quiz-header mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h3>
                Vraag {currentQuestion + 1}
                <span className="text-muted">/{questions.length}</span>
              </h3>
              <div className="timer-display fs-4 text-danger">
                {formatTime(timeLeft)}
              </div>
            </div>
            <progress
              className="w-100"
              value={timeLeft}
              max="15"
              style={{ height: '3px' }}
            />
          </div>

          <h4 className="mb-4">
            {questions[currentQuestion].question}
          </h4>

          <div className="options-grid">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`option-button btn btn-outline-primary ${
                  selectedAnswers[currentQuestion] === index ? 'active' : ''
                } ${
                  timeLeft === 0 && index === questions[currentQuestion].correct 
                    ? 'correct-answer' 
                    : ''
                }`}
                disabled={timeLeft === 0}
              >
                {option}
                {timeLeft === 0 && index === questions[currentQuestion].correct && (
                  <span className="correct-badge">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 text-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined && timeLeft > 0}
            >
              {currentQuestion === questions.length - 1
                ? 'View Results'
                : 'Next Question →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;

```

## src/frontend/src/components/feature components/MyQuizzes.jsx

```
// frontend/src/components/feature components/MyQuizzes.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(''); // Algemene fouten voor de pagina
  const [apiErrorModal, setApiErrorModal] = useState(''); // Fouten specifiek voor de modal
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const navigate = useNavigate();

  // --- State voor de "Host Session" Modal ---
  const [showHostModal, setShowHostModal] = useState(false);
  const [quizToHost, setQuizToHost] = useState(null); // Welke quiz wordt gehost vanuit de modal
  const [numTeams, setNumTeams] = useState('1');
  const [isCreatingSession, setIsCreatingSession] = useState(false);


  useEffect(() => {
    const fetchQuizzes = async () => {
      setError('');
      try {
        const response = await fetch('/api/quizzes', {
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({error: 'Failed to fetch quizzes'}));
          throw new Error(data.error);
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message || 'A network error occurred while loading quizzes');
        console.error("Error fetching quizzes in MyQuizzes:", err);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone!')) {
      return;
    }
    setError(''); // Reset algemene error
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        // Als de verwijderde quiz de expanded quiz was, sluit de details
        if (expandedQuizId === quizId) {
            setExpandedQuizId(null);
        }
      } else {
        const data = await response.json().catch(() => ({error: 'Deletion failed with non-JSON response'}));
        setError(data.error || 'Deletion failed');
      }
    } catch (err) {
      setError('Network error during deletion');
      console.error("Error deleting quiz in MyQuizzes:", err);
    }
  };

  const handleOpenHostModal = (quiz) => {
    if (quiz.questions_count === 0) {
        setError(`Quiz "${quiz.name}" has no questions and cannot be hosted. Please add questions first.`);
        window.scrollTo(0,0); // Scroll naar boven om error te zien
        return;
    }
    setError(''); // Reset algemene error
    setQuizToHost(quiz);
    setApiErrorModal('');
    setNumTeams('1');
    setShowHostModal(true);
  };

  const handleCreateSessionFromModal = async () => {
    if (!quizToHost) {
        setApiErrorModal('No quiz selected to host.');
        return;
    }
    setApiErrorModal('');

    const teamCount = parseInt(numTeams, 10);
    if (isNaN(teamCount) || teamCount < 1) {
        setApiErrorModal('Number of teams must be a positive number (1 or more).');
        return;
    }
    if (quizToHost.questions_count === 0) {
        setApiErrorModal('Cannot host a quiz with no questions.');
        return;
    }

    setIsCreatingSession(true);
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizToHost.id,
                num_teams: teamCount
            }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            setShowHostModal(false);
            navigate(`/session/${data.code}`);
        } else {
            throw new Error(data.error || 'Failed to create session');
        }
    } catch (err) {
        console.error("Error creating session from MyQuizzes modal:", err);
        setApiErrorModal(err.message || 'Could not create session. Please try again.');
    } finally {
        setIsCreatingSession(false);
    }
  };


  const toggleQuizDetails = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
        return new Date(dateString).toLocaleDateString(navigator.language || 'en-US', options);
    } catch {
        return String(dateString);
    }
  };

  const countQuestionTypes = (questions) => {
    const counts = { text: 0, multiple: 0, slider: 0 };
    if (!questions || !Array.isArray(questions)) return counts;
    questions.forEach(q => {
      if (q.type === 'text_input') counts.text++;
      if (q.type === 'multiple_choice') counts.multiple++;
      if (q.type === 'slider') counts.slider++;
    });
    return counts;
  };


  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">My Quizzes</h2>
          <div>
              <Link to="/home" className="btn btn-outline-secondary me-2">
                  <i className="bi bi-house-door me-1 d-none d-sm-inline"></i> Back to Home
              </Link>
              <Link to="/quiz-maker" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i> Create New Quiz
              </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}

        {quizzes.length === 0 && !error && (
            <div className="text-center p-5 border rounded bg-light-subtle mt-4">
                <i className="bi bi-journal-richtext display-1 text-secondary mb-3"></i>
                <h4>You haven't created any quizzes yet.</h4>
                <p className="text-muted">Click "Create New Quiz" to get started!</p>
            </div>
        )}

        {quizzes.length > 0 && (
          <div className="list-group">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="list-group-item list-group-item-action p-0 mb-3 border rounded-3 shadow-sm overflow-hidden">
                <div
                  className="d-flex justify-content-between align-items-center p-3"
                  onClick={() => toggleQuizDetails(quiz.id)}
                  style={{ cursor: 'pointer', backgroundColor: expandedQuizId === quiz.id ? '#e9ecef' : 'transparent' }} // Iets donkerder geselecteerd
                  aria-expanded={expandedQuizId === quiz.id}
                  aria-controls={`quiz-details-${quiz.id}`}
                  role="button" // Maak het klikbaar voor accessibility
                  tabIndex={0} // Maak het focusseerbaar
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleQuizDetails(quiz.id); }} // Toetsenbord navigatie
                >
                  <div>
                    <h5 className="mb-1 d-flex align-items-center">
                        {quiz.name}
                        {quiz.questions_count === 0 && <span className="badge bg-warning text-dark ms-2 small py-1 px-2">No Questions</span>}
                    </h5>
                    <small className="text-muted">
                        Created on {formatDate(quiz.created_at)} • {quiz.questions_count || 0} question{quiz.questions_count !== 1 ? 's' : ''}
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0"> {/* flex-shrink-0 voorkomt dat knoppen krimpen */}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/edit/${quiz.id}`, { state: { quiz } }); }}
                      title="Edit quiz"
                    >
                      <i className="bi bi-pencil-fill"></i> <span className="d-none d-md-inline">Edit</span>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id); }}
                      title="Delete quiz"
                    >
                      <i className="bi bi-trash-fill"></i> <span className="d-none d-md-inline">Delete</span>
                    </button>
                    <span // Veranderd naar span om dubbele focus te vermijden, onClick is al op parent
                      className="btn btn-light btn-sm border p-1 d-flex align-items-center justify-content-center"
                      title={expandedQuizId === quiz.id ? "Hide details" : "Show details"}
                      style={{ width: '32px', height: '32px' }} // Vaste grootte voor chevron knop
                    >
                      {expandedQuizId === quiz.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </span>
                  </div>
                </div>

                {expandedQuizId === quiz.id && (
                  <div className="p-3 border-top bg-light-subtle" id={`quiz-details-${quiz.id}`}> {/* Iets andere achtergrond voor details */}
                    <div className="mb-3 d-grid gap-2 d-sm-flex">
                      <button
                        className="btn btn-primary flex-sm-fill"
                        onClick={(e) => {e.stopPropagation(); navigate(`/simulate/${quiz.id}`)}}
                      >
                        <i className="bi bi-person-workspace me-2"></i>Simulate Quiz
                      </button>
                      <button
                          className="btn btn-success flex-sm-fill"
                          onClick={(e) => {e.stopPropagation(); handleOpenHostModal(quiz)}}
                          disabled={quiz.questions_count === 0}
                          title={quiz.questions_count === 0 ? "Cannot host: quiz has no questions." : "Start a new session for this quiz"}
                      >
                        <i className="bi bi-megaphone-fill me-2"></i>Host Session
                      </button>
                    </div>
                    {quiz.questions_count === 0 && (
                      <div className="alert alert-warning p-2 small text-center">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          This quiz currently has no questions. Add questions to enable hosting.
                      </div>
                    )}
                    {quiz.questions_count > 0 && (
                      <>
                          <h6 className="text-secondary">Overview:</h6>
                          <ul className="list-unstyled small text-muted mb-3">
                          <li>Total answers recorded (example): {
                              quiz.questions.reduce((acc, q) => acc + (q.answers?.length || 0), 0)
                              // Let op: 'answers' property moet bestaan op je question objecten hiervoor
                          }</li>
                          <li>Question types: {Object.entries(countQuestionTypes(quiz.questions))
                              .filter(([, count]) => count > 0) // Toon alleen types die aanwezig zijn
                              .map(([type, count]) => `${count} ${type.replace('_', ' ')}`)
                              .join(', ') || 'N/A'}
                          </li>
                          </ul>
                          <h6 className="text-secondary">Questions Preview:</h6>
                          <ul className="list-group list-group-flush" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          {quiz.questions?.map((question, qIndex) => (
                              <li key={question.id || qIndex} className="list-group-item bg-transparent px-0 py-2"> {/* bg-transparent voor betere look in .bg-light-subtle */}
                              <div className="d-flex justify-content-between">
                                  <span className="text-truncate" style={{maxWidth: '70%'}}>
                                    <strong>Q{qIndex + 1}:</strong> {question.text}
                                  </span>
                                  <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                                  {question.type.replace('_', ' ')}
                                  </span>
                              </div>
                              </li>
                          ))}
                          </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Host Session Modal --- */}
      {showHostModal && quizToHost && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-labelledby="hostSessionModalMyQuizzesLabel" aria-hidden={!showHostModal}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header p-4 border-bottom-0">
                <h4 className="modal-title fw-bold mb-0 fs-4" id="hostSessionModalMyQuizzesLabel">Host Session: <span className="text-primary">{quizToHost.name}</span></h4>
                <button type="button" className="btn-close" onClick={() => setShowHostModal(false)} aria-label="Close" disabled={isCreatingSession}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                {apiErrorModal && <div className="alert alert-danger py-2 small mb-3">{apiErrorModal}</div>}
                <p className="text-muted small">Configure the number of teams for this live session.</p>
                <div className="mb-3">
                  <label htmlFor="numTeamsInputModalMyQuizzes" className="form-label fw-medium">Number of Teams:</label>
                  <input
                    type="number"
                    id="numTeamsInputModalMyQuizzes"
                    className="form-control form-control-lg fs-5"
                    value={numTeams}
                    onChange={(e) => setNumTeams(e.target.value)}
                    min="1"
                    step="1"
                    disabled={isCreatingSession}
                    autoFocus
                  />
                  <div className="form-text small mt-1">
                    Enter 1 for individual play, or 2 or more for team mode.
                  </div>
                </div>
              </div>
              <div className="modal-footer flex-nowrap p-0">
                <button
                    type="button"
                    className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end text-secondary"
                    onClick={() => setShowHostModal(false)}
                    disabled={isCreatingSession}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-lg btn-success fs-6 text-decoration-none col-6 py-3 m-0 rounded-0"
                    onClick={handleCreateSessionFromModal}
                    disabled={isCreatingSession || !numTeams || parseInt(numTeams, 10) < 1}
                >
                  {isCreatingSession ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Starting...</>
                  ) : (
                    <><i className="bi bi-play-circle-fill me-1"></i>Start Session</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHostModal && quizToHost && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default MyQuizzes;
```

## src/frontend/src/components/feature components/QuizSession.jsx

```
// src/frontend/src/components/feature components/QuizSession.jsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import QuizSimulator from './QuizSimulator';
import 'bootstrap-icons/font/bootstrap-icons.css';

function QuizSession() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [sessionInfo, setSessionInfo] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Belangrijk om te weten wie de host is in de UI
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinError, setJoinError] = useState('');
    const [startError, setStartError] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const pollIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    const fetchCurrentUser = useCallback(async () => {
        console.log("Fetching current user...");
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (!isMountedRef.current) return null;

            if (response.ok) {
                const userData = await response.json();
                console.log("Current user fetched:", userData.username);
                setCurrentUser(userData); // Sla de huidige gebruiker op in state
                return userData;
            } else {
                console.error("Failed to fetch profile, status:", response.status);
                navigate('/login');
            }
        } catch (err) {
            if (!isMountedRef.current) return null;
            console.error("Network error fetching current user:", err);
            setError('Could not verify user session. Please try logging in again.');
            navigate('/login');
        }
        return null;
    }, [navigate]);

    const fetchData = useCallback(async (user) => {
        if (!user || !code || !isMountedRef.current) {
             console.log("fetchData prerequisites not met:", {user, code, isMounted: isMountedRef.current});
             return;
        }
        console.log("fetchData called for user:", user.username, "session code:", code);

        try {
            const sessionRes = await fetch(`/api/sessions/${code}`, { credentials: 'include' });
             if (!isMountedRef.current) return;

            if (!sessionRes.ok) {
                const errText = await sessionRes.text();
                console.error("Error fetching session info:", sessionRes.status, errText);
                if (sessionRes.status === 404) {
                    setError(`Session "${code}" not found or has ended.`);
                } else {
                    setError(`Error fetching session details (Status: ${sessionRes.status}).`);
                }
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // setIsLoading(false) wordt afgehandeld in de useEffect initialize
                return;
            }
            const currentSessionData = await sessionRes.json();
            console.log("Session data fetched:", currentSessionData);
             if (!isMountedRef.current) return;
            setSessionInfo(currentSessionData);

            if (currentSessionData.started) {
                console.log("Session already started, stopping poll.");
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                return;
            }

            const participantsRes = await fetch(`/api/sessions/${code}/participants`, { credentials: 'include' });
            if (!isMountedRef.current) return;

            if (!participantsRes.ok) {
                console.error("Error fetching participants:", participantsRes.status);
                if (!error && isMountedRef.current) setError("Could not update participant list.");
            } else {
                const participantsData = await participantsRes.json();
                console.log("Participants fetched:", participantsData.length);
                 if (!isMountedRef.current) return;
                setParticipants(participantsData);

                const currentUserParticipant = participantsData.find(p => p.user_id === user.id);
                if (currentUserParticipant) {
                    setIsJoined(true);
                    setSelectedTeam(currentUserParticipant.team_number ? String(currentUserParticipant.team_number) : '');
                } else {
                    setIsJoined(false);
                    setSelectedTeam('');
                }
                 if (isMountedRef.current && error !== `Session "${code}" not found or has ended.`) setError('');
            }

        } catch (err) {
             if (!isMountedRef.current) return;
            console.error("Error inside fetchData:", err);
            if (!error && isMountedRef.current) setError('Failed to fetch session data. Please refresh.');
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    }, [code, navigate, error]); // Let op: 'error' in dependencies kan loops veroorzaken als niet goed beheerd.

    useEffect(() => {
        isMountedRef.current = true;
        console.log("QuizSession Mount/Code Change - Initial Load Effect. Code:", code);
        setIsLoading(true);
        setError('');
        setSessionInfo(null);
        setParticipants([]);

        let didCancel = false;

        const initialize = async () => {
            const user = await fetchCurrentUser(); // Haal eerst de ingelogde gebruiker op
            if (user && !didCancel) {
                await fetchData(user);
            }
            if (isMountedRef.current && !didCancel) {
                 setIsLoading(false);
            }
        };

        if (code) {
            initialize();
        } else {
            setError("No session code provided in URL.");
            setIsLoading(false);
        }

        return () => {
            console.log("QuizSession Unmount Cleanup - Initial Load Effect");
            isMountedRef.current = false;
            didCancel = true;
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [code, fetchCurrentUser, fetchData]);

    useEffect(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (!isLoading && currentUser && sessionInfo && !sessionInfo.started && isMountedRef.current) {
            console.log("Starting polling for session:", sessionInfo.code);
            pollIntervalRef.current = setInterval(() => {
                console.log("Polling...");
                if (isMountedRef.current) {
                    fetchData(currentUser);
                } else {
                    if(pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                }
            }, 5000);
        } else {
            console.log("Conditions not met for polling OR session started. Polling stopped/not started.");
        }
        return () => {
            if (pollIntervalRef.current) {
                console.log("Clearing poll interval in Polling Effect cleanup.");
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [isLoading, currentUser, sessionInfo, fetchData]);


    const handleJoinTeam = async (e) => {
        e.preventDefault();
        if (!sessionInfo || !currentUser || isJoining) return;
        setJoinError('');
        setIsJoining(true);
        let teamNumberToSend = null;
        if (sessionInfo.is_team_mode) {
            if (!selectedTeam) {
                setJoinError(`Please select a team (1-${sessionInfo.num_teams}).`);
                setIsJoining(false); return;
            }
            teamNumberToSend = parseInt(selectedTeam, 10);
            if (isNaN(teamNumberToSend) || teamNumberToSend < 1 || teamNumberToSend > sessionInfo.num_teams) {
                 setJoinError(`Invalid team number. Choose 1-${sessionInfo.num_teams}.`);
                 setIsJoining(false); return;
            }
        }
        try {
            const response = await fetch(`/api/sessions/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_number: teamNumberToSend }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                setIsJoined(true);
                if(isMountedRef.current) await fetchData(currentUser);
            } else {
                setJoinError(result.error || 'Failed to join/switch team.');
            }
        } catch (err) {
            setJoinError('A network error occurred.');
        } finally {
             if (isMountedRef.current) setIsJoining(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!sessionInfo || !currentUser || isStarting || currentUser.id !== sessionInfo.host_id) return;
        setStartError('');
        setIsStarting(true);
        try {
            const response = await fetch(`/api/sessions/${code}/start`, { method: 'POST', credentials: 'include' });
            const result = await response.json();
            if (response.ok) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // Na het starten, fetchData opnieuw om sessionInfo.started bij te werken
                if (currentUser && isMountedRef.current) await fetchData(currentUser);
            } else {
                setStartError(result.error || 'Failed to start quiz on the server.');
                if (isMountedRef.current) setIsStarting(false);
            }
        } catch (err) {
            setStartError('A network error occurred while trying to start.');
            if (isMountedRef.current) setIsStarting(false);
        }
        // setIsStarting(false) wordt afgehandeld door de re-render naar QuizSimulator of bij error
    };

    const copyCodeToClipboard = async () => {
        if (!sessionInfo?.code) {
            setCopySuccess('No Code');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2500);
            return;
        }
        if (!navigator.clipboard) {
            setCopySuccess('No API');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000);
            return;
        }
        try {
            await navigator.clipboard.writeText(sessionInfo.code);
            setCopySuccess('Copied!');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2000);
        } catch (err) {
            let errorMsg = 'Error!';
            if (err.name === 'NotAllowedError') errorMsg = 'Blocked';
            else if (err.name === 'SecurityError') errorMsg = 'Security';
            setCopySuccess(errorMsg);
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000);
        }
    };


    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 fs-5">Loading Session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                </div>
                <div className="text-center mt-3">
                    <button className="btn btn-primary" onClick={() => navigate('/home')}>
                        <i className="bi bi-house-door me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!sessionInfo) { // Fallback voor als sessionInfo nog null is na laden
         return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center">Could not load session information. Please refresh or go back home.</div>
                <div className="text-center mt-3">
                    <button className="btn btn-secondary" onClick={() => navigate('/home')}>
                        <i className="bi bi-house-door me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Als de sessie gestart is, render QuizSimulator
    if (sessionInfo.started) {
        const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;
        return <QuizSimulator quizId={sessionInfo.quiz_id} sessionCode={code} isHost={isCurrentUserHost} />;
    }

    const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;

    const renderTeamSelection = () => {
        if (isCurrentUserHost || !sessionInfo.is_team_mode) return null;
        const teamOptions = Array.from({ length: sessionInfo.num_teams }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>Team {i + 1}</option>
        ));
        return (
            <div className="mb-3">
                <label htmlFor="teamSelect" className="form-label fw-bold">Select Your Team:</label>
                <select id="teamSelect" className="form-select form-select-lg" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} disabled={isJoining} >
                    <option value="" disabled>-- Choose a Team --</option>
                    {teamOptions}
                </select>
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                            <h4 className="mb-0">Quiz Session Lobby</h4>
                            <div className="d-flex align-items-center">
                                <span className="me-2 text-white-75">Code:</span>
                                <strong
                                    className="bg-light text-primary px-3 py-1 rounded-pill me-2 user-select-all font-monospace shadow-sm"
                                    style={{ fontSize: '1.1rem', letterSpacing: '1px' }}
                                >
                                    {sessionInfo.code}
                                </strong>
                                <button
                                    className={`btn btn-sm ${
                                        copySuccess === 'Copied!' ? 'btn-light text-success' :
                                        (copySuccess && copySuccess !== '') ? 'btn-danger' : 
                                        'btn-outline-light'
                                    }`}
                                    onClick={copyCodeToClipboard}
                                    title={
                                        copySuccess === 'Copied!' ? 'Code copied to clipboard!' :
                                        (copySuccess === 'No API') ? 'Clipboard API not available.' :
                                        (copySuccess === 'Blocked') ? 'Copying blocked by browser.' :
                                        (copySuccess && copySuccess !== '') ? `Copy failed: ${copySuccess}` :
                                        'Copy session code'
                                    }
                                    disabled={!!copySuccess}
                                    style={{ minWidth: '85px', textAlign: 'center', fontWeight: '500' }}
                                >
                                    {copySuccess ? copySuccess : <><i className="bi bi-clipboard me-1"></i> Copy</>}
                                </button>
                            </div>
                        </div>
                        <div className="card-body text-center p-4">
                            {/* AANGEPAST BLOK VOOR QUIZ INFO */}
                            <h4 className="card-title mb-2 fs-4">
                                <span className="text-primary fw-bold">{sessionInfo.quiz_name || 'Loading Quiz...'}</span>
                            </h4>
                            {sessionInfo.quiz_maker_username && sessionInfo.quiz_maker_username !== "Unknown Maker" && (
                                <p className="card-text text-muted small mb-1" style={{fontSize: '0.9rem'}}>
                                    Quiz created by:{' '}
                                    <Link to={`/profile/view/${sessionInfo.quiz_maker_id}`} className="fw-medium text-decoration-none text-info-emphasis">
                                        {sessionInfo.quiz_maker_avatar && <img src={`/avatars/avatar${sessionInfo.quiz_maker_avatar || 1}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>}
                                        {sessionInfo.quiz_maker_username}
                                    </Link>
                                </p>
                            )}
                            <p className="card-text mb-3 fs-6">
                                Session hosted by:{' '}
                                <Link to={`/profile/view/${sessionInfo.host_id}`} className="fw-bold text-decoration-none text-success-emphasis">
                                    {/* Toon avatar van de host (currentUser is de ingelogde user, sessionInfo.host is de host van de sessie) */}
                                    {/* Als je de avatar van de host specifiek wilt, moet die ook via sessionInfo komen, of currentUser checken als die de host is. */}
                                    <img src={`/avatars/avatar${ isCurrentUserHost ? currentUser?.avatar : (sessionInfo.host_avatar || 1)}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>
                                    {sessionInfo.host_username || '...'}
                                </Link>
                            </p>
                            {/* EINDE AANGEPAST BLOK */}

                            <hr className="my-3" />

                            <p className="text-muted fst-italic mb-2">Waiting for the host to start the quiz...</p>
                            {sessionInfo.is_team_mode && <p className="mb-3"><span className="badge bg-info-subtle text-info-emphasis fs-6 py-2 px-3 rounded-pill">Playing in <strong>{sessionInfo.num_teams} teams</strong> mode</span></p>}

                            {!isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    {renderTeamSelection()}
                                    <button className="btn btn-success btn-lg w-100 py-2 fs-5 shadow-sm" onClick={handleJoinTeam} disabled={isJoining || (sessionInfo.is_team_mode && !selectedTeam)} >
                                        {isJoining ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</> : ( isJoined ? (sessionInfo.is_team_mode ? 'Switch Team' : 'Rejoin Session') : (sessionInfo.is_team_mode ? 'Join Selected Team' : 'Join Session') )}
                                    </button>
                                    {joinError && <div className="alert alert-warning mt-3 p-2 small">{joinError}</div>}
                                </div>
                            )}

                            {isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    <button
                                        className="btn btn-warning btn-lg w-75 py-2 fs-5 shadow-sm mx-auto d-block"
                                        onClick={handleStartQuiz}
                                        disabled={isStarting || participants.length === 0}
                                        style={{color: '#212529'}}
                                    >
                                        {isStarting ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Starting Quiz...</> : 'Start Quiz!' }
                                    </button>
                                    {participants.length === 0 && !isStarting && <p className="text-danger mt-2 small fst-italic">Waiting for participants to join before starting.</p>}
                                    {startError && <div className="alert alert-danger mt-3 p-2 small">{startError}</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4">
                         <div className="card-header bg-light-subtle p-3">
                            <h5 className="mb-0 fw-medium">Participants ({participants.length})</h5>
                        </div>
                        <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {participants.length === 0 ? (
                                <li className="list-group-item text-muted text-center fst-italic py-3">No one has joined yet... Be the first!</li>
                            ) : (
                                participants
                                    .sort((a, b) => {
                                        if (a.user_id === sessionInfo.host_id) return -1;
                                        if (b.user_id === sessionInfo.host_id) return 1;
                                        return a.username.localeCompare(b.username);
                                    })
                                    .map((p) => (
                                        <li key={p.user_id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <img src={`/avatars/avatar${p.avatar || 1}.png`} alt={p.username} width="35" height="35" className="rounded-circle me-2 shadow-sm border border-light"/>
                                                <span className={`fw-medium ${p.user_id === currentUser?.id ? 'text-primary' : ''}`}>
                                                    {p.username}
                                                    {p.user_id === sessionInfo.host_id && <span className="badge bg-dark-subtle text-dark-emphasis rounded-pill ms-2 small py-1 px-2">Host</span>}
                                                    {p.user_id === currentUser?.id && !isCurrentUserHost && <span className="text-muted ms-1 small">(You)</span>}
                                                </span>
                                            </div>
                                            {sessionInfo.is_team_mode && p.team_number && (
                                                <span className={`badge bg-info-subtle text-info-emphasis rounded-pill fs-6 py-1 px-2`}>Team {p.team_number}</span>
                                            )}
                                        </li>
                                    ))
                            )}
                        </ul>
                    </div>
                     <div className="text-center mt-4 mb-3">
                         <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>
                             <i className="bi bi-house-door-fill me-1"></i> Back to Home
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizSession;
```

## src/frontend/src/components/feature components/QuizSimulator.jsx

```
// src/frontend/src/components/feature components/QuizSimulator.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

// ***** Accepteer nu ook sessionCode als prop *****
function QuizSimulator({ quizId: quizIdProp, sessionCode: sessionCodeProp }) {
  // Get ID from URL params as a fallback (blijft hetzelfde)
  const { quizId: quizIdFromParams } = useParams();
  // Determine the actual quiz ID (blijft hetzelfde)
  const quizIdToUse = quizIdProp ?? quizIdFromParams;

  // --- State ---
  const [searchParams] = useSearchParams(); // Blijf deze gebruiken voor 'showResults'

  // ***** Gebruik de prop ALS EERSTE, val terug op searchParams indien nodig *****
  const sessionCode = sessionCodeProp ?? searchParams.get('session');
  // ****************************************************************************

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answerStatus, setAnswerStatus] = useState([]);
  const navigate = useNavigate();
  const timerId = useRef(null);
  const isMountedRef = useRef(true); // Track mount status

  // Initial Debug log (runs once on mount/prop change)
  console.log(`[QuizSimulator Initial] ID: ${quizIdToUse}, Session (Prop): ${sessionCodeProp}, Session (URL): ${searchParams.get('session')}, Final Session Used: ${sessionCode}`);

  // --- Callbacks ---
  const submitSessionScore = useCallback(async (finalScore) => {
    // Gebruik de 'sessionCode' variabele die hierboven is bepaald
    if (!sessionCode || !isMountedRef.current) return;
    console.log(`QuizSimulator: Submitting score ${finalScore} for session ${sessionCode}`);
    try {
      const response = await fetch(`/api/sessions/${sessionCode}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: finalScore })
      });
      if (!isMountedRef.current) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Failed to submit score:", errData.error || response.status);
      } else {
        console.log("Score submitted successfully.");
      }
    } catch (err) {
        if (isMountedRef.current) {
            console.error('Network error submitting score:', err);
        }
    }
  }, [sessionCode]); // Nu afhankelijk van de 'sessionCode' variabele

  const handleNext = useCallback(() => {
    if (!isMountedRef.current) return;

    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    const currentQ = quiz?.questions?.[currentQuestion];

    if (!quiz || !currentQ) {
      console.warn("handleNext called without quiz or current question data.");
      if(isMountedRef.current) setShowScore(true); // Set showScore if mounted
      submitSessionScore(score); // Submit huidige score
      return;
    }

    let answerResult = "Wrong";
    const currentAnswer = selectedAnswers[currentQuestion];
    let pointsEarned = 0;

    // Evaluation Logic
    if (currentQ.type === 'multiple_choice') {
      const correctOptionId = currentQ.correct_option_id;
      const selectedOptionId = currentQ.options?.[currentAnswer]?.id;
      if (selectedOptionId !== undefined && selectedOptionId === correctOptionId) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    } else if (currentQ.type === 'text_input') {
      const userText = String(currentAnswer ?? '').trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      if (userText !== '' && userText === correctText) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    } else if (currentQ.type === 'slider') {
      if (Number(currentAnswer) === Number(currentQ.correct_value)) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    }

    if (isMountedRef.current) {
        setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
        const newScore = score + pointsEarned;
        setScore(newScore); // Update score state

        const nextQuestionIndex = currentQuestion + 1;
        if (nextQuestionIndex < quiz.questions.length) {
            setCurrentQuestion(nextQuestionIndex);
            setTimeLeft(15); // Reset timer
        } else {
            setShowScore(true); // Show score screen
            submitSessionScore(newScore); // Submit final calculated score
        }
    }
  }, [quiz, currentQuestion, selectedAnswers, score, submitSessionScore]); // Dependencies

  // --- Effects ---
  useEffect(() => {
      isMountedRef.current = true;
      console.log("[QuizSimulator Mounted]");
      return () => {
          console.log("[QuizSimulator Unmounting]");
          isMountedRef.current = false;
          if (timerId.current) {
              clearInterval(timerId.current);
              timerId.current = null;
              console.log("  Timer cleared on unmount.");
          }
      };
  }, []); // Mount/Unmount effect

  useEffect(() => {
    // Start timer only if component is mounted and conditions met
    if (!showScore && quiz?.questions?.length > 0 && quizIdToUse && isMountedRef.current) {
        console.log("[QuizSimulator Timer Effect] Starting timer for question:", currentQuestion);
        timerId.current = setInterval(() => {
            if (!isMountedRef.current) { // Check mount status inside interval
                if (timerId.current) clearInterval(timerId.current);
                return;
            }
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    console.log("[QuizSimulator Timer Effect] Timer expired, calling handleNext.");
                     handleNext(); // handleNext checks mount status internally
                    return 15; // Reset for next question (or doesn't matter if quiz ends)
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup function for this effect
        return () => {
            console.log("[QuizSimulator Timer Effect] Cleanup for question:", currentQuestion);
            if (timerId.current) {
                clearInterval(timerId.current);
                timerId.current = null;
            }
        };
    } else {
       // Ensure timer is cleared if conditions are not met or score is shown
       console.log("[QuizSimulator Timer Effect] Conditions not met or score shown, timer stopped/not started.", { showScore, hasQuestions: quiz?.questions?.length > 0, quizIdToUse });
       if (timerId.current) {
           clearInterval(timerId.current);
           timerId.current = null;
        }
    }
  }, [currentQuestion, showScore, quiz, quizIdToUse, handleNext]); // Dependencies for timer


  useEffect(() => {
    // Fetch quiz data
    const fetchQuiz = async () => {
      if (!quizIdToUse) {
        console.error("[QuizSimulator Data Fetch] No Quiz ID available.");
        if (isMountedRef.current) setLoading(false);
        return;
      }

      console.log(`[QuizSimulator Data Fetch] Fetching simulation data for ID: ${quizIdToUse}`);
      if (isMountedRef.current) setLoading(true);
      try {
        // Use the /simulate endpoint to get data including correct answers
        const response = await fetch(`/api/simulate/${quizIdToUse}`, { credentials: 'include' });
        if (!isMountedRef.current) return; // Check mount after await

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Quiz simulation fetch failed (ID: ${quizIdToUse}, Status: ${response.status})`);
        }
        const data = await response.json();
        console.log("[QuizSimulator Data Fetch] Simulation data fetched successfully.");

        if (isMountedRef.current) {
             setQuiz(data); // Set quiz data
             // Reset state for a new simulation/quiz
             setCurrentQuestion(0);
             setScore(0);
             setSelectedAnswers([]);
             setAnswerStatus([]);
             setTimeLeft(15);

             // Check if we should immediately show results based on URL param
             const showResultsParam = searchParams.get('showResults') === 'true';
             console.log(`[QuizSimulator Data Fetch] showResults param: ${showResultsParam}`);
             setShowScore(showResultsParam); // Set state accordingly
             if (showResultsParam) {
                 console.log("[QuizSimulator Data Fetch] Set showScore=true based on URL param.");
             }
         }
      } catch (err) {
        console.error('[QuizSimulator Data Fetch] Error:', err.message);
        if (isMountedRef.current) setQuiz(null); // Clear quiz data on error
      } finally {
        if (isMountedRef.current) setLoading(false); // Stop loading indicator
      }
    };

    fetchQuiz();
  }, [quizIdToUse, searchParams]); // Re-fetch if ID or searchParams change


  useEffect(() => {
    // Set default answer values when the question changes, only if no answer exists yet
    if (quiz && quiz.questions && quiz.questions[currentQuestion] && isMountedRef.current) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
          // Only update if the answer for the current index is undefined
          if (typeof prev[currentQuestion] === 'undefined') {
              const newAnswers = [...prev]; // Create a mutable copy
              if (currentQ.type === 'slider') {
                  newAnswers[currentQuestion] = currentQ.min ?? 0; // Default to min value
              } else if (currentQ.type === 'text_input') {
                  newAnswers[currentQuestion] = ''; // Default to empty string
              }
              // For multiple choice, undefined is the desired initial state (no selection)
              console.log(`[QuizSimulator Default Answer] Set default for Q${currentQuestion} (Type: ${currentQ.type})`);
              return newAnswers; // Return the updated array
          }
          return prev; // Return the original array if an answer already exists
      });
    }
  }, [currentQuestion, quiz]); // Dependencies: run when question or quiz data changes


  // Function to format time
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Helper to get the text of the user's answer for the results screen
  const getUserAnswerText = (question, index) => {
      const answerValue = selectedAnswers[index];
      if (typeof answerValue === 'undefined') return 'No answer given';

      if (question.type === 'multiple_choice') {
          return question.options?.[answerValue]?.text ?? 'Invalid option index';
      }
      return String(answerValue);
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Failed to load quiz data (ID: {quizIdToUse || 'None Provided'}).
        </div>
        <Link to="/my-quizzes" className="btn btn-primary">Go to My Quizzes</Link>
      </div>
    );
  }

  // --- Debug Logs before return ---
  console.log("-------------------------------------");
  console.log("[QuizSimulator Render Check]");
  console.log(`  quizIdToUse: ${quizIdToUse} (Type: ${typeof quizIdToUse})`);
  console.log(`  sessionCode (Prop): ${sessionCodeProp}`);
  console.log(`  sessionCode (URL): ${searchParams.get('session')}`);
  console.log(`  sessionCode (Final Used): ${sessionCode} (Type: ${typeof sessionCode})`);
  console.log(`  Condition (sessionCode && quizIdToUse): ${!!(sessionCode && quizIdToUse)}`);
  console.log(`  showScore state: ${showScore}`);
  console.log("-------------------------------------");
  // --- End Debug Logs ---


  // --- Main Component Return JSX ---
  return (
    <div className="container quiz-container mt-4">
       {/* Navigation Links */}
       <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/my-quizzes')}>
          ← Back to My Quizzes
        </button>
        {/* --- KNOP TERUGGEZET --- */}
        <Link to="/home" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      {showScore ? (
        // --- Score Screen ---
         <div className="quiz-results">
          <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
            <h2 className="mb-3">🎉 Simulation Complete! 🎉</h2>
            <div className="score-display bg-white p-3 rounded-pill shadow">
              <span className="display-2 fw-bold text-dark">{score}</span>
              <span className="fs-3 text-muted">/{quiz.questions.length}</span>
            </div>

            {/* ***** Action Buttons - Use the 'sessionCode' variable ***** */}
            <div className="mt-4 d-flex justify-content-center flex-wrap gap-2">
              {/* Retry button only if NOT in a session */}
              {!sessionCode && (
                <button
                  className="btn btn-light btn-lg"
                  onClick={() => {
                    if (!isMountedRef.current) return;
                    setCurrentQuestion(0); setScore(0); setShowScore(false);
                    setSelectedAnswers([]); setAnswerStatus([]); setTimeLeft(15);
                  }}
                >
                 <i className="bi bi-arrow-clockwise me-2"></i>Retry Quiz
                </button>
              )}

              {/* View Session Results Button - Condition uses 'sessionCode' */}
              {console.log("  Rendering score screen button check:", !!(sessionCode && quizIdToUse))}
              {sessionCode && quizIdToUse && (
                <button
                  className="btn btn-warning btn-lg"
                  onClick={() => navigate(`/session/results/${sessionCode}`)} // <<--- THIS LINE IS CHANGED
                  title="View scores of all participants" // Tooltip added
                >
                  <i className="bi bi-trophy-fill me-2"></i> View Session Results
                </button>
              )}

               {/* --- KNOP BLIJFT VERWIJDERD --- */}
            </div>
          </div>

            {/* Results Breakdown */}
            <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
                {quiz.questions.map((q, index) => {
                const isCorrect = answerStatus[index] === 'Correct';
                let correctAnswerText = 'N/A';
                // Get correct answer text/value from quiz data (provided by /simulate endpoint)
                if (q.type === 'multiple_choice') correctAnswerText = q.correct_answer_text ?? 'N/A';
                else if (q.type === 'text_input') correctAnswerText = q.correct_answer ?? 'N/A';
                else if (q.type === 'slider') correctAnswerText = q.correct_value?.toString() ?? 'N/A';

                return (
                    <div className="col" key={index}>
                        <div className={`card h-100 shadow-sm ${isCorrect ? 'border-success' : 'border-danger'}`}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Question {index + 1}</span>
                            <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                                {answerStatus[index] || 'Not Answered'} {isCorrect ? '✓' : '✗'}
                            </span>
                            </div>
                            <div className="card-body">
                            <h5 className="card-title">{q.text}</h5>
                            <div className="mt-3">
                                <p className="text-success mb-1">
                                <strong>Correct Answer:</strong> {correctAnswerText}
                                </p>
                                {!isCorrect && (
                                <p className="text-danger mb-0">
                                    <strong>Your Answer:</strong> {getUserAnswerText(q, index)}
                                </p>
                                )}
                            </div>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>
      ) : (
        // --- Question Screen ---
        // (No functional changes needed here based on the prop change)
        <div>
            {/* Question Header */}
            <div className="quiz-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                <h3>
                    Question {currentQuestion + 1}
                    <span className="text-muted">/{quiz.questions.length}</span>
                </h3>
                <div className="timer-display fs-4 text-danger">
                    {formatTime(timeLeft)}
                </div>
                </div>
                <progress
                    className="w-100 progress"
                    value={timeLeft}
                    max="15"
                    style={{ height: '5px' }}
                />
            </div>

            {/* Question Text */}
            <h4 className="mb-4">{quiz.questions[currentQuestion]?.text || 'Loading question...'}</h4>

            {/* Answer Input Area */}
            {quiz.questions[currentQuestion]?.type === 'multiple_choice' && (
                <div className="options-grid">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            if (timeLeft > 0 && isMountedRef.current) {
                                setSelectedAnswers(prev => {
                                    const newAnswers = [...prev];
                                    newAnswers[currentQuestion] = index;
                                    return newAnswers;
                                });
                            }
                        }}
                        className={`option-button btn btn-lg btn-outline-primary w-100 d-block text-start p-3 mb-2 ${selectedAnswers[currentQuestion] === index ? 'active' : ''} ${timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id ? 'correct-answer' : ''}`}
                        disabled={timeLeft === 0}
                    >
                    {option.text}
                    {timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id && ( <span className="correct-badge float-end fs-4 text-success">✓</span> )}
                    </button>
                ))}
                </div>
            )}

            {quiz.questions[currentQuestion]?.type === 'text_input' && (
                <div className="mb-3">
                    <label htmlFor="textAnswer" className="form-label fs-5">Your Answer:</label>
                    <input
                        type="text"
                        id="textAnswer"
                        className="form-control form-control-lg"
                        value={selectedAnswers[currentQuestion] || ''}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = e.target.value; return na; }); } }}
                        maxLength={quiz.questions[currentQuestion].max_length || 255}
                        disabled={timeLeft === 0}
                    />
                    <div className="form-text">Max length: {quiz.questions[currentQuestion].max_length || 255} characters.</div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Answer: {quiz.questions[currentQuestion].correct_answer}</div> )}
                </div>
            )}

            {quiz.questions[currentQuestion]?.type === 'slider' && (
                <div className="mb-3">
                    <label htmlFor="sliderAnswer" className="form-label fs-5 d-block"> Your Selection: <strong className="text-primary">{selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}</strong></label>
                    <input
                        type="range"
                        id="sliderAnswer"
                        className="form-range"
                        min={quiz.questions[currentQuestion].min}
                        max={quiz.questions[currentQuestion].max}
                        step={quiz.questions[currentQuestion].step}
                        value={selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = parseInt(e.target.value, 10); return na; }); } }}
                        disabled={timeLeft === 0}
                        style={{ height: '1.5rem' }}
                    />
                    <div className="d-flex justify-content-between text-muted"><span>{quiz.questions[currentQuestion].min}</span><span>{quiz.questions[currentQuestion].max}</span></div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Value: {quiz.questions[currentQuestion].correct_value}</div>)}
                </div>
            )}

            {/* Next Button */}
            <div className="mt-4 text-end">
                <button
                className="btn btn-primary btn-lg px-5"
                onClick={handleNext}
                disabled={ timeLeft === 0 || (timeLeft > 0 && quiz.questions[currentQuestion]?.type !== 'text_input' && typeof selectedAnswers[currentQuestion] === 'undefined') }
                >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish Simulation' : 'Next Question →'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default QuizSimulator;
```

## src/frontend/src/components/feature components/QuizDetails.jsx

```
// src/frontend/src/components/feature components/QuizDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(''); // Voor fouten bij het laden van quizdetails
  const [apiError, setApiError] = useState(''); // Voor fouten tijdens sessie creatie in de modal
  const [showQuestions, setShowQuestions] = useState(false);

  // State voor de "Host Session" Modal
  const [showHostModal, setShowHostModal] = useState(false);
  const [numTeams, setNumTeams] = useState('1'); // Default 1 team (solo)
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Optioneel: loggedInUserId kan nog steeds nuttig zijn voor andere UI-elementen,
  // maar is niet meer direct nodig voor de logica van de Host Session knop.
  // const [loggedInUserId, setLoggedInUserId] = useState(null);
  // useEffect(() => {
  //   const fetchLoggedInUser = async () => { /* ... */ };
  //   fetchLoggedInUser();
  // }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      setError('');
      setApiError(''); // Reset ook API error van modal
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, { credentials: 'include' });
        if (!res.ok) {
             const errData = await res.json().catch(() => ({ error: 'Quiz not found or access denied. Please ensure the quiz ID is correct.' }));
             throw new Error(errData.error);
        }
        const quizData = await res.json();
        setQuiz(quizData);
      } catch (err) {
        console.error("Error fetching quiz details:", err);
        setError(err.message);
      }
    };
    if (quizId) {
        fetchQuiz();
    }
  }, [quizId]);

  const formatDate = iso => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { // Of gebruik navigator.language
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return String(iso); // Fallback
    }
  };

  const handleSimulate = () => navigate(`/simulate/${quizId}`);

  const handleOpenHostModal = () => {
    if (quiz && quiz.questions_count === 0) {
        // Dit zou ook door de disabled state van de knop afgevangen moeten worden, maar extra check kan geen kwaad.
        alert("This quiz has no questions and cannot be hosted. Please add questions to the quiz first.");
        return;
    }
    setApiError('');
    setNumTeams('1');
    setShowHostModal(true);
  };

  const handleCreateSessionFromModal = async () => {
    if (!quiz) {
        setApiError('Quiz data is not available.');
        return;
    }
    setApiError('');

    const teamCount = parseInt(numTeams, 10);
    if (isNaN(teamCount) || teamCount < 1) {
        setApiError('Number of teams must be a positive number (1 or more).');
        return;
    }
    if (quiz.questions_count === 0) {
        setApiError('Cannot host a quiz with no questions.'); // Dubbele check
        return;
    }

    setIsCreatingSession(true);
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quiz.id,
                num_teams: teamCount
            }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            setShowHostModal(false);
            navigate(`/session/${data.code}`);
        } else {
            throw new Error(data.error || 'Failed to create session');
        }
    } catch (err) {
        console.error("Error creating session from modal:", err);
        setApiError(err.message || 'Could not create session. Please try again.');
    } finally {
        setIsCreatingSession(false);
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
            <h4 className="alert-heading">Oops! Something went wrong.</h4>
            <p>{error}</p>
        </div>
        <div className="text-center">
            <button className="btn btn-primary" onClick={() => navigate('/home')}>Go Back to Home</button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status"></div>
        <p className="mt-3 fs-5">Loading quiz details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i>Back
            </button>
        </div>

        <div className="card border rounded-4 shadow-lg p-4 p-lg-5"> {/* Meer shadow en padding */}
            {/* Quiz creator info */}
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <img
                src={`/avatars/avatar${quiz.creator_avatar || 1}.png`}
                alt={quiz.creator}
                className="rounded-circle shadow-sm me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }} // Iets kleiner dan vorige versie, consistenter
              />
              <div>
                <h5 className="card-title mb-0 fs-5"> {/* Consistentere titelgrootte */}
                    <a
                        href={`/profile/view/${quiz.creator_id}`}
                        onClick={(e) => { e.preventDefault(); navigate(`/profile/view/${quiz.creator_id}`);}}
                        className="text-decoration-none fw-medium"
                        title={`View profile of ${quiz.creator}`}
                    >
                        {quiz.creator}
                    </a>
                </h5>
                <small className="text-muted">Created on {formatDate(quiz.created_at)}</small>
              </div>
            </div>

            <h2 className="display-5 fw-bold mb-2 text-primary">{quiz.name}</h2> {/* Quiznaam prominenter */}
            <p className="lead text-secondary mb-4">
                This quiz features {quiz.questions_count || 0} question{quiz.questions_count !== 1 ? 's' : ''}.
            </p>

            <div className="mb-4 d-grid gap-3"> {/* d-grid voor full-width knoppen op mobile */}
              <button className="btn btn-lg btn-primary py-3 fs-5" onClick={handleSimulate}> {/* Meer padding, groter font */}
                <i className="bi bi-person-arms-up me-2"></i>Simulate Quiz Solo
              </button>

              <button
                className="btn btn-lg btn-success py-3 fs-5"
                onClick={handleOpenHostModal}
                disabled={quiz.questions_count === 0}
                title={quiz.questions_count === 0 ? "This quiz has no questions and cannot be hosted." : "Host this quiz for others to join"}
              >
                <i className="bi bi-megaphone-fill me-2"></i>Host Live Session
              </button>
            </div>
            {quiz.questions_count === 0 &&
                <div className="alert alert-warning mt-2 p-2 small text-center">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    This quiz currently has no questions. You can simulate it, but it cannot be hosted until questions are added.
                </div>
            }

            <div className="mt-4 text-center">
                <button className="btn btn-outline-secondary" onClick={() => setShowQuestions(v => !v)}>
                {showQuestions ? <><i className="bi bi-eye-slash-fill me-1"></i>Hide Questions Overview</> : <><i className="bi bi-eye-fill me-1"></i>Show Questions Overview</>}
                </button>
            </div>

            {showQuestions && (
              <div className="mt-4 pt-3 border-top">
                <h4 className="mb-3 text-muted">Questions Overview:</h4>
                {quiz.questions.length === 0 ? (
                    <p className="text-muted fst-italic">No questions are currently available for this quiz.</p>
                ) : (
                    <ul className="list-group list-group-flush">
                    {quiz.questions.map((q, idx) => (
                        <li key={q.id || idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                            <span><strong>Q{idx + 1}:</strong> {q.text.length > 80 ? q.text.substring(0, 80) + "..." : q.text}</span>
                            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill"> {/* BS 5.3+ */}
                                {q.type.replace('_', ' ')}
                            </span>
                        </li>
                    ))}
                    </ul>
                )}
              </div>
            )}
        </div>
      </div>

      {/* --- Host Session Modal --- */}
      {showHostModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-labelledby="hostSessionModalLabel" aria-hidden={!showHostModal}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header p-4 border-bottom-0">
                <h4 className="modal-title fw-bold mb-0 fs-4" id="hostSessionModalLabel">Host Session: <span className="text-primary">{quiz.name}</span></h4>
                <button type="button" className="btn-close" onClick={() => setShowHostModal(false)} aria-label="Close" disabled={isCreatingSession}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                {apiError && <div className="alert alert-danger py-2 small mb-3">{apiError}</div>}
                <p className="text-muted small">Configure the number of teams for this live session.</p>
                <div className="mb-3">
                  <label htmlFor="numTeamsInputModal" className="form-label fw-medium">Number of Teams:</label>
                  <input
                    type="number"
                    id="numTeamsInputModal"
                    className="form-control form-control-lg fs-5" // Groter input veld
                    value={numTeams}
                    onChange={(e) => setNumTeams(e.target.value)}
                    min="1"
                    step="1"
                    disabled={isCreatingSession}
                    autoFocus // Zet focus op dit veld als modal opent
                  />
                  <div className="form-text small mt-1">
                    Enter 1 for individual play, or 2 or more for team mode.
                  </div>
                </div>
              </div>
              <div className="modal-footer flex-nowrap p-0">
                <button
                    type="button"
                    className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end text-secondary"
                    onClick={() => setShowHostModal(false)}
                    disabled={isCreatingSession}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-lg btn-success fs-6 text-decoration-none col-6 py-3 m-0 rounded-0"
                    onClick={handleCreateSessionFromModal}
                    disabled={isCreatingSession || !numTeams || parseInt(numTeams, 10) < 1}
                >
                  {isCreatingSession ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Starting...</>
                  ) : (
                    <><i className="bi bi-play-circle-fill me-1"></i>Start Session</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Conditionally render backdrop only when modal is shown */}
      {showHostModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
```

## src/frontend/src/components/feature components/QuizMaker.jsx

```
// frontend/src/components/feature components/QuizMaker.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function QuizMaker() {
  const { state } = useLocation();
  const [quizData, setQuizData] = useState({
    id: null,
    name: '',
    questions: []
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission status
  const navigate = useNavigate();

  // Load existing quiz data when editing
  useEffect(() => {
    if (state?.quiz) {
      setQuizData({
        id: state.quiz.id,
        name: state.quiz.name,
        questions: state.quiz.questions.map(q => ({
          ...q,
          options: q.options?.map(opt => ({
            text: opt.text,
            isCorrect: opt.is_correct
          })) || []
        }))
      });
    }
  }, [state]);

  // Function to get initial state based on question type
  const getInitialQuestionState = (type) => {
    const base = { type, text: '' };
    switch(type) {
      case 'multiple_choice':
        return { ...base, options: [{ text: '', isCorrect: false }] };
      case 'slider':
        // Ensure default correct_value is null or within initial range if needed
        return { ...base, min: 0, max: 10, step: 1, correct_value: null };
      case 'text_input':
        return { ...base, max_length: 255, correct_answer: '' };
      default:
        return base;
    }
  };

  // Function to add a new question of a specific type
  const addQuestion = (type) => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, getInitialQuestionState(type)]
    }));
  };

  // Function to handle changing the type of an existing question
  const handleQuestionTypeChange = (qIndex, newType) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Replace the question state with the initial state for the new type, keeping the index
      updatedQuestions[qIndex] = getInitialQuestionState(newType);
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Function to validate a single question
  const validateQuestion = (question, index) => {
    const errors = [];
    const questionNumber = index + 1;

    if (!question.text.trim()) {
      errors.push(`Question ${questionNumber}: Question text is required`);
    }

    switch (question.type) {
      case 'text_input':
        if (!question.correct_answer?.trim()) {
          errors.push(`Question ${questionNumber}: Correct answer is required`);
        }
        if (!question.max_length || question.max_length < 1 || question.max_length > 500) {
          errors.push(`Question ${questionNumber}: Invalid max length (must be 1-500)`);
        }
        break;

      case 'slider':
        const min = Number(question.min);
        const max = Number(question.max);
        const step = Number(question.step);
        const correctValue = question.correct_value !== null ? Number(question.correct_value) : null;

        if (isNaN(min) || isNaN(max) || isNaN(step)) {
             errors.push(`Question ${questionNumber}: Min, Max, and Step must be numbers`);
        } else {
            if (min >= max) {
              errors.push(`Question ${questionNumber}: Min value (${min}) must be less than Max value (${max})`);
            }
            if (step < 1 || step > (max - min)) {
              errors.push(`Question ${questionNumber}: Step size (${step}) must be at least 1 and no larger than the range (${max - min})`);
            }
            if (correctValue === null || isNaN(correctValue)) {
                errors.push(`Question ${questionNumber}: Correct value is required and must be a number`);
            } else if (correctValue < min || correctValue > max) {
              errors.push(`Question ${questionNumber}: Correct value (${correctValue}) must be between Min (${min}) and Max (${max})`);
            } else if ((correctValue - min) % step !== 0) {
                errors.push(`Question ${questionNumber}: Correct value (${correctValue}) must be reachable with the step size (${step}) starting from Min (${min})`);
            }
        }
        break;

      case 'multiple_choice':
        if (!question.options || question.options.length < 2) {
          errors.push(`Question ${questionNumber}: Minimum 2 options are required`);
        } else {
            if (!question.options.some(opt => opt.isCorrect)) {
              errors.push(`Question ${questionNumber}: At least one correct option must be selected`);
            }
            question.options.forEach((opt, optIndex) => {
              if (!opt.text.trim()) {
                errors.push(`Question ${questionNumber}, Option ${optIndex + 1}: Option text cannot be empty`);
              }
            });
        }
        break;

      default:
        errors.push(`Question ${questionNumber}: Unknown or unsupported question type`);
    }

    return errors;
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Prevent clicks if already submitting
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring click.");
      return;
    }

    // 2. Start submission process
    setIsSubmitting(true);
    setFeedback('');

    // --- Validation ---
    if (!quizData.name || !quizData.name.trim()) {
      setFeedback('Please provide a quiz name.');
      setIsSubmitting(false); // Reset on validation failure
      return;
    }
     if (quizData.questions.length === 0) {
      setFeedback('Please add at least one question to the quiz.');
      setIsSubmitting(false); // Reset on validation failure
      return;
    }


    const validationErrors = quizData.questions
      .map((q, index) => validateQuestion(q, index))
      .flat(); // Flatten array of arrays into a single array

    if (validationErrors.length > 0) {
      // Format errors nicely for feedback
      setFeedback(`Please fix the following errors:\n- ${validationErrors.join('\n- ')}`);
      setIsSubmitting(false); // Reset on validation failure
      return;
    }

    // --- Prepare Data for API ---
    const apiData = {
      name: quizData.name.trim(),
      questions: quizData.questions.map(q => {
        const baseQuestion = {
          type: q.type,
          text: q.text.trim(),
        };
        switch (q.type) {
          case 'multiple_choice':
            return {
              ...baseQuestion,
              options: q.options.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect // In backend: is_correct
              }))
            };
          case 'slider':
            return {
              ...baseQuestion,
              min: Number(q.min),
              max: Number(q.max),
              step: Number(q.step),
              correct_value: Number(q.correct_value)
            };
          case 'text_input':
            return {
              ...baseQuestion,
              max_length: Number(q.max_length),
              correct_answer: q.correct_answer.trim()
            };
          default:
            // Should not happen due to validation, but good practice
            console.error("Trying to submit unknown question type:", q.type);
            return null;
        }
      }).filter(q => q !== null), // Filter out any potential nulls
    };


    // --- API Call ---
    const endpoint = quizData.id ? `/api/quizzes/${quizData.id}` : '/api/quiz';
    const method = quizData.id ? 'PUT' : 'POST';

    try {
      console.log(`Sending ${method} request to ${endpoint} with data:`, apiData);
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(apiData),
      });

      const responseBody = await response.json(); // Read body once

      if (!response.ok) {
          // Log detailed error info
          console.error(`API Error: ${response.status} ${response.statusText}`, responseBody);
          // Throw error with message from backend if available, otherwise generic message
          throw new Error(responseBody.error || `Operation failed with status ${response.status}`);
      }

      // --- Success ---
      console.log("API call successful:", responseBody);
      setFeedback(quizData.id ? 'Quiz updated successfully!' : `Success! Quiz created with ID: ${responseBody.quiz_id}`);
      // Keep isSubmitting = true here! Button remains disabled.
      setTimeout(() => {
        console.log("Navigating to /my-quizzes...");
        navigate('/my-quizzes');
        // No need to set isSubmitting to false, component will unmount.
      }, 2000); // 2-second delay before navigating

    } catch (err) {
      // --- Error Handling (Fetch errors, JSON parsing errors, or errors thrown above) ---
      console.error("Error during submission process:", err);
      // Display the error message from the caught error object
      setFeedback(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false); // Reset *only* on error so user can retry
    }
    // No finally block resetting isSubmitting needed for the success case
  };


  // Function to update a specific field of a question
  const updateQuestion = (qIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Handle number inputs specifically if needed
      if (field === 'min' || field === 'max' || field === 'step' || field === 'max_length' || field === 'correct_value') {
          // Allow empty string for temporary state, but validation will catch it
          // Or parse immediately: const numValue = value === '' ? '' : parseInt(value, 10);
          updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
      } else {
          updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Function to update a specific field of an option within a multiple choice question
  const updateOption = (qIndex, oIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[oIndex] = { ...updatedOptions[oIndex], [field]: value };
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Function to add a new option to a multiple choice question
  const addOption = (qIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Ensure options array exists
      if (!updatedQuestions[qIndex].options) {
          updatedQuestions[qIndex].options = [];
      }
      updatedQuestions[qIndex].options = [
        ...updatedQuestions[qIndex].options,
        { text: '', isCorrect: false } // New option defaults
      ];
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Function to delete an option from a multiple choice question
  const deleteOption = (qIndex, oIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Function to delete a question
  const deleteQuestion = (qIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  // --- Render Component ---
  return (
    <div className="container mt-4">
      {/* Navigation Links */}
      <div className="d-flex gap-2 align-items-center mb-4"> {/* Increased gap */}
        <Link to="/home" className="btn btn-sm btn-outline-secondary"> {/* Smaller button */}
          ← Back to Home
        </Link>
        <Link to="/my-quizzes" className="btn btn-sm btn-outline-secondary"> {/* Smaller button */}
          ← Back to My Quizzes
        </Link>
      </div>

      {/* Title */}
      <h2>{quizData.id ? 'Edit Quiz' : 'Create New Quiz'}</h2>

      {/* Feedback Area */}
      {/* Use pre-wrap to preserve line breaks in validation errors */}
      {feedback && (
        <div
          className={`alert ${feedback.includes('Success') || feedback.includes('updated successfully') ? 'alert-success' : 'alert-danger'}`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {feedback}
        </div>
      )}

      {/* Quiz Name Input */}
      <div className="mb-3">
        <label htmlFor="quizName" className="form-label">Quiz Name</label>
        <input
          type="text"
          id="quizName"
          className="form-control"
          value={quizData.name}
          onChange={(e) => setQuizData(prev => ({ ...prev, name: e.target.value }))}
          required
          maxLength={100} // Add a reasonable max length
          disabled={isSubmitting} // Disable input while submitting
        />
      </div>

      {/* Questions List */}
      {quizData.questions.map((q, qIndex) => (
        <div key={qIndex} className="card mb-3 shadow-sm"> {/* Added subtle shadow */}
          <div className="card-header d-flex justify-content-between align-items-center bg-light"> {/* Light background */}
            <span className="fw-bold">Question {qIndex + 1}</span> {/* Bold question number */}
            <button
              type="button" // Important for forms
              className="btn btn-danger btn-sm"
              onClick={() => deleteQuestion(qIndex)}
              disabled={isSubmitting} // Disable delete button during submit
              aria-label={`Delete Question ${qIndex + 1}`}
            >
              Delete Question
            </button>
          </div>
          <div className="card-body">
            {/* Question Type Selector */}
            <div className="mb-3">
              <label htmlFor={`qtype-${qIndex}`} className="form-label">Question Type</label>
              <select
                id={`qtype-${qIndex}`}
                className="form-select"
                value={q.type}
                onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                disabled={isSubmitting} // Disable type change during submit
              >
                <option value="text_input">Text Input</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="slider">Slider</option>
              </select>
            </div>

            {/* Question Text Input */}
            <div className="mb-3">
             <label htmlFor={`qtext-${qIndex}`} className="form-label">Question Text</label>
             <textarea
                id={`qtext-${qIndex}`}
                className="form-control"
                placeholder="Enter the question here..."
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                required
                rows={3} // Slightly larger text area
                disabled={isSubmitting} // Disable text editing during submit
              />
            </div>


            {/* --- Type-Specific Fields --- */}

            {/* Text Input Fields */}
            {q.type === 'text_input' && (
              <>
                <div className="mb-3">
                  <label htmlFor={`qmaxlen-${qIndex}`} className="form-label">Max Answer Length</label>
                  <input
                    id={`qmaxlen-${qIndex}`}
                    type="number"
                    className="form-control"
                    value={q.max_length}
                    onChange={(e) => updateQuestion(qIndex, 'max_length', e.target.value)}
                    min="1"
                    max="500" // Match validation
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor={`qcorrectans-${qIndex}`} className="form-label">Correct Answer</label>
                  <input
                    id={`qcorrectans-${qIndex}`}
                    type="text"
                    className="form-control"
                    placeholder="The exact correct answer"
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                    required
                    maxLength={q.max_length || 500} // Dynamically set max length based on field above
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {/* Slider Fields */}
            {q.type === 'slider' && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-3 col-sm-6"> {/* Responsive columns */}
                    <label htmlFor={`qmin-${qIndex}`} className="form-label">Min Value</label>
                    <input
                      id={`qmin-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.min}
                      onChange={(e) => updateQuestion(qIndex, 'min', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <label htmlFor={`qmax-${qIndex}`} className="form-label">Max Value</label>
                    <input
                      id={`qmax-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.max}
                      onChange={(e) => updateQuestion(qIndex, 'max', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <label htmlFor={`qstep-${qIndex}`} className="form-label">Step Size</label>
                    <input
                      id={`qstep-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.step}
                      onChange={(e) => updateQuestion(qIndex, 'step', e.target.value)}
                      min="1" // Basic validation on input
                      disabled={isSubmitting}
                    />
                  </div>
                   <div className="col-md-3 col-sm-6">
                     <label htmlFor={`qcorrectval-${qIndex}`} className="form-label">Correct Value</label>
                     <input
                       id={`qcorrectval-${qIndex}`}
                       type="number"
                       className="form-control"
                       // Use controlled component approach, handle null/empty string
                       value={q.correct_value === null ? '' : q.correct_value}
                       onChange={(e) =>
                         updateQuestion(qIndex, 'correct_value', e.target.value === '' ? null : e.target.value)
                       }
                       step={q.step || 1} // Use step value for browser increments/decrements
                       min={q.min || 0}   // Use min/max for browser validation hints
                       max={q.max || 10}
                       required
                       disabled={isSubmitting}
                     />
                  </div>
                </div>
              </>
            )}

            {/* Multiple Choice Fields */}
            {q.type === 'multiple_choice' && (
              <div className="mb-1"> {/* Reduced margin */}
                <label className="form-label d-block mb-2">Options (Select correct answer(s))</label> {/* Clearer label */}
                {q.options?.map((option, oIndex) => ( // Added safe navigation ?.
                  <div key={oIndex} className="input-group mb-2">
                    {/* Option Text Input */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                      required
                      disabled={isSubmitting} // Disable option text editing
                      aria-label={`Option ${oIndex + 1} text`}
                    />
                    {/* Correct Answer Checkbox */}
                    <div className="input-group-text">
                      <input
                        className="form-check-input mt-0" // Bootstrap class for alignment
                        type="checkbox"
                        id={`q-${qIndex}-opt-${oIndex}-correct`}
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                        disabled={isSubmitting} // Disable checkbox
                        aria-labelledby={`q-${qIndex}-opt-${oIndex}-label`} // Link checkbox to label for accessibility
                      />
                       <label htmlFor={`q-${qIndex}-opt-${oIndex}-correct`} id={`q-${qIndex}-opt-${oIndex}-label`} className="ms-2 visually-hidden">Correct</label> {/* Hidden label for screen readers */}
                    </div>
                    {/* Delete Option Button */}
                    <button
                      type="button" // Important for forms
                      className="btn btn-outline-danger"
                      onClick={() => deleteOption(qIndex, oIndex)}
                      // Disable if submitting OR if it's the last option (or less than 2)
                      disabled={isSubmitting || q.options.length <= 1}
                      aria-label={`Delete Option ${oIndex + 1}`}
                    >
                      × {/* Use HTML entity for multiplication sign '×' */}
                    </button>
                  </div>
                ))}
                {/* Add Option Button and Counter */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button
                    type="button" // Important for forms
                    className="btn btn-sm btn-outline-primary" // Changed style slightly
                    onClick={() => addOption(qIndex)}
                    disabled={isSubmitting} // Disable add option button
                  >
                    Add Option <span aria-hidden="true">+</span>
                  </button>
                  <small className="text-muted">{q.options?.length || 0} option(s)</small>
                </div>
              </div>
            )}
          </div> {/* End card-body */}
        </div> /* End card */
      ))}

      {/* Add Question Buttons */}
      <div className="mb-4 mt-4 border-top pt-3"> {/* Added separator */}
        <h5>Add New Question</h5>
        <button
          type="button" // Important for forms
          className="btn btn-success me-2 mb-2" // Success style
          onClick={() => addQuestion('text_input')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Text Question
        </button>
        <button
          type="button" // Important for forms
          className="btn btn-success me-2 mb-2"
          onClick={() => addQuestion('multiple_choice')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Multiple Choice
        </button>
        <button
          type="button" // Important for forms
          className="btn btn-success mb-2"
          onClick={() => addQuestion('slider')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Slider Question
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-3">
        <button
          type="submit"
          className="btn btn-primary btn-lg" // Larger submit button
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable button when submitting
        >
          {isSubmitting
              ? (quizData.id ? 'Saving Changes...' : 'Creating Quiz...') // Provide feedback during submission
              : (quizData.id ? 'Save Changes' : 'Create Quiz')
          }
          {isSubmitting && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>} {/* Add spinner */}
        </button>
      </div>

    </div> /* End container */
  );
}

export default QuizMaker;
```

## src/frontend/src/components/feature components/Followers.jsx

```
// src/frontend/src/components/feature components/Followers.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function Followers() {
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' | 'following' | 'allUsers'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // voor de All Users-tab
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [_error, setError] = useState(''); // Renamed to avoid conflict
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndLists = async () => {
      try {
        const profileResponse = await fetch('/api/profile', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!profileResponse.ok) {
          navigate('/login');
          return;
        }
        // User is authenticated, proceed to fetch follower/following lists
        await fetchFollowers();
        await fetchFollowing();
        await fetchAllUsers();

      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load initial data. Please try refreshing.');
      }
    };
    fetchProfileAndLists();
  }, [navigate]); // Added navigate to dependency array

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/followers', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      } else {
        console.error('Failed to fetch followers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch('/api/following', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      } else {
        console.error('Failed to fetch following:', response.status);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users/all', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        console.error('Failed to fetch all users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchPerformed(false); // Reset before new search
    const trimmedTerm = searchTerm.trim();
    setLastSearchTerm(trimmedTerm); // Store the term that was searched

    if (!trimmedTerm) {
      setSearchResults([]);
      setSearchPerformed(true); // Mark as performed to show "enter a term"
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(trimmedTerm)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search API error:', response.status);
        setSearchResults([]); // Clear results on error
      }
    } catch (error) {
      console.error('Search network error:', error);
      setSearchResults([]);
    } finally {
      setSearchPerformed(true); // Mark as performed to show "no results" or results
    }
  };

  // Helper function to update user's follow status across all lists
  const updateUserFollowStatus = (userId, newFollowStatus) => {
    setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: newFollowStatus } : u));
    setFollowers(prev => prev.map(u => u.id === userId ? { ...u, is_following: newFollowStatus } : u));
    // For the 'following' list, if unfollowed, they might be removed. If followed, they might be added.
    // For 'allUsers', update their status.
    // It's often simpler to re-fetch the lists that are directly affected or rely on search results being primary.
    // For now, we'll re-fetch the main lists.
    fetchFollowing();
    fetchAllUsers();
    fetchFollowers(); // Re-fetch followers too in case 'is_following' for them changed (follow back)
  };


  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        updateUserFollowStatus(userId, true);
      } else {
        console.error('Failed to follow user:', response.status);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await fetch(`/api/unfollow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        updateUserFollowStatus(userId, false);
      } else {
        console.error('Failed to unfollow user:', response.status);
      }
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      const response = await fetch(`/api/followers/${followerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Re-fetch lists to update UI
        await fetchFollowers();
        // If removing a follower also affects 'allUsers' (e.g., 'is_following' from their perspective), fetch that too
        await fetchAllUsers();
      } else {
        console.error('Failed to remove follower:', response.status);
      }
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  // Helper to render a user item - used in multiple lists
  const renderUserItem = (user, actions) => (
    <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
      <Link to={`/profile/view/${user.id}`} className="text-decoration-none text-dark d-flex align-items-center">
        <img
          src={`/avatars/avatar${user.avatar || 1}.png`}
          alt={`${user.username}'s avatar`}
          className="rounded-circle me-3"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        />
        <span className="fw-bold">{user.username}</span>
      </Link>
      <div className="d-flex gap-2">
        {actions}
      </div>
    </li>
  );


  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-10 col-lg-8 offset-md-1 offset-lg-2"> {/* Centered content */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage Connections</h2>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/home')}
            >
              ← Back to Home
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg"> {/* Larger search bar */}
              <input
                type="text"
                className="form-control"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search me-1"></i> Search
              </button>
            </div>
          </form>

          {/* Search Results Display */}
          {searchPerformed && ( // Only show this block if a search has been performed
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Search Results for "{lastSearchTerm}"</h5>
              </div>
              <div className="card-body">
                {searchResults.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {searchResults.map(user => renderUserItem(user,
                      user.is_following ? (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFollow(user.id)}
                        >
                          Follow
                        </button>
                      )
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-center py-3">
                    {lastSearchTerm ? `No users found matching "${lastSearchTerm}".` : "Please enter a search term."}
                  </p>
                )}
              </div>
            </div>
          )}


          <ul className="nav nav-tabs nav-fill mb-4"> {/* nav-fill for equal width tabs */}
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                <i className="bi bi-people-fill me-1"></i> Followers ({followers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                <i className="bi bi-person-check-fill me-1"></i> Following ({following.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'allUsers' ? 'active' : ''}`}
                onClick={() => setActiveTab('allUsers')}
              >
                <i className="bi bi-globe me-1"></i> Discover Users ({allUsers.length})
              </button>
            </li>
          </ul>

          {/* Content for each tab */}
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === 'followers' && (
                followers.length === 0 ? (
                  <p className="text-muted text-center py-3">No followers yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {followers.map(user => renderUserItem(user,
                      <>
                        {!user.is_following && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleFollow(user.id)}
                          >
                            Follow Back
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveFollower(user.id)}
                        >
                          Remove
                        </button>
                      </>
                    ))}
                  </ul>
                )
              )}

              {activeTab === 'following' && (
                following.length === 0 ? (
                  <p className="text-muted text-center py-3">You are not following anyone yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {following.map(user => renderUserItem(user,
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        Unfollow
                      </button>
                    ))}
                  </ul>
                )
              )}

              {activeTab === 'allUsers' && (
                allUsers.length === 0 ? (
                  <p className="text-muted text-center py-3">No users to display.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {allUsers.map(user => renderUserItem(user,
                      user.is_following ? (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFollow(user.id)}
                        >
                          Follow
                        </button>
                      )
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Followers;
```

## src/frontend/src/components/feature components/Profile.jsx

```
// src/frontend/src/components/feature components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // We'll create this CSS file

const avatars = Array.from({ length: 12 }, (_, i) => `/avatars/avatar${i + 1}.png`);

// --- BANNER IMAGE OPTIONS (Avatar-like) ---
// ... (rest of your banner constants) ...
const PREDEFINED_BANNER_IMAGE_IDS = ['1', '2', '3', '4', '5', '6','default'];
const BANNER_IMAGE_DISPLAY_NAMES = {
  '1': 'BlueLock',
  '2': 'HxH',
  '3': 'b3',
  '4': 'Berserk',
  '5': 'b5',
  '6': 'VinLand',
  'default': 'Subtle Default',
};
const BANNER_IMAGE_EXTENSION = '.jpg';

const getBannerImagePath = (identifier) => {
  return `/banners/banner${identifier}${BANNER_IMAGE_EXTENSION}`;
};

const predefinedBannerColors = [
  { id: 'color_gray', value: '#6c757d', name: 'Gray' },
  { id: 'color_blue', value: '#0d6efd', name: 'Blue' },
  { id: 'color_green', value: '#198754', name: 'Green' },
  { id: 'color_red', value: '#dc3545', name: 'Red' },
  { id: 'color_purple', value: '#6f42c1', name: 'Purple' },
  { id: 'color_teal', value: '#20c997', name: 'Teal' },
];


function Profile() {
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: 1,
    registeredAt: null,
    banner_type: 'color',
    banner_value: '#6c757d'
  });
  const [originalUsername, setOriginalUsername] = useState(''); // <-- NEW: Store original username
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [currentBannerType, setCurrentBannerType] = useState(profileData.banner_type);
  const [currentBannerValue, setCurrentBannerValue] = useState(profileData.banner_value);
  const [customColor, setCustomColor] = useState(
    profileData.banner_type === 'color' ? profileData.banner_value : '#6c757d'
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!response.ok) { navigate('/login'); return; }
        const data = await response.json();

        const initialBannerType = data.banner_type || 'color';
        let initialBannerValue = data.banner_value;
        if (!initialBannerValue) {
            initialBannerValue = (initialBannerType === 'image') ? 'default' : '#6c757d';
        } else if (initialBannerType === 'image' && !PREDEFINED_BANNER_IMAGE_IDS.includes(initialBannerValue)) {
            initialBannerValue = 'default';
        } else if (initialBannerType === 'color' && !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(initialBannerValue)) {
            initialBannerValue = '#6c757d';
        }

        setProfileData({
          username: data.username,
          bio: data.bio || '',
          avatar: data.avatar || 1,
          registeredAt: data.registered_at,
          banner_type: initialBannerType,
          banner_value: initialBannerValue
        });
        setOriginalUsername(data.username); // <-- NEW: Set original username on fetch
        setCurrentBannerType(initialBannerType);
        setCurrentBannerValue(initialBannerValue);
        if (initialBannerType === 'color') {
          setCustomColor(initialBannerValue);
        } else {
          setCustomColor('#6c757d');
        }
      } catch (err) { setError('Failed to load profile'); }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    setCurrentBannerType(profileData.banner_type);
    setCurrentBannerValue(profileData.banner_value);
    if (profileData.banner_type === 'color') {
      setCustomColor(profileData.banner_value);
    }
  }, [profileData.banner_type, profileData.banner_value]);


  const handleInputChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAvatarChange = (newAvatar) => {
    setProfileData(prev => ({ ...prev, avatar: newAvatar }));
  };

  // ... (banner handler functions remain the same) ...
  const handleBannerTypeChange = (e) => {
    const newType = e.target.value;
    setCurrentBannerType(newType);
    if (newType === 'image') {
      setCurrentBannerValue(PREDEFINED_BANNER_IMAGE_IDS.includes('default') ? 'default' : PREDEFINED_BANNER_IMAGE_IDS[0]);
    } else {
      setCurrentBannerValue(customColor || predefinedBannerColors[0]?.value || '#6c757d');
    }
  };

  const handleBannerImageSelect = (imageId) => {
    setCurrentBannerValue(imageId);
  };

  const handleBannerColorSelect = (colorValue) => {
    setCurrentBannerValue(colorValue);
    setCustomColor(colorValue);
  };
  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (currentBannerType === 'color') {
      setCurrentBannerValue(newColor);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const trimmedUsername = profileData.username.trim();

    // --- NEW: Username Change Confirmation ---
    if (trimmedUsername !== originalUsername) {
        const confirmUsernameChange = window.confirm(
            `You are changing your username from "${originalUsername}" to "${trimmedUsername}".\n` +
            `This will be your new login username.\n\nAre you sure you want to proceed?`
        );
        if (!confirmUsernameChange) {
            // User cancelled, revert username in input to original and stop submission
            setProfileData(prev => ({ ...prev, username: originalUsername }));
            return;
        }
    }
    // --- End Username Change Confirmation ---


    if (currentBannerType === 'color' && !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(currentBannerValue)) {
        setError('Invalid custom color format. Please use a valid hex code (e.g., #RRGGBB or #RGB).');
        return;
    }
    if (currentBannerType === 'image' && !PREDEFINED_BANNER_IMAGE_IDS.includes(currentBannerValue)) {
        setError('Invalid banner image selected. Please choose from the predefined options.');
        return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        credentials: 'include',
        body: JSON.stringify({
          username: trimmedUsername, // Use the (potentially new) trimmed username
          bio: profileData.bio,
          avatar: profileData.avatar,
          banner_type: currentBannerType,
          banner_value: currentBannerValue
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Update failed');
        // If username already taken, the backend sends 409.
        // Revert username in input if the error was due to username being taken
        if (response.status === 409 && data.error && data.error.toLowerCase().includes('username already taken')) {
            setProfileData(prev => ({ ...prev, username: originalUsername }));
        }
        return;
      }

      if (data.user) {
        setProfileData(prev => ({
          ...prev,
          username: data.user.username,
          bio: data.user.bio || '',
          avatar: data.user.avatar || 1,
          banner_type: data.user.banner_type,
          banner_value: data.user.banner_value
        }));
        setOriginalUsername(data.user.username); // <-- NEW: Update original username after successful save
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else if (data.message && data.message === "No changes detected") {
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
         console.warn("Profile update returned success status but unexpected data format:", data);
         setError("Profile update status unclear. Please refresh.");
      }
      setIsEditing(false);

    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  const formatRegistrationDate = () => {
    if (!profileData.registeredAt) return 'Not available';
    const date = new Date(profileData.registeredAt);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const bannerStyle = {
    height: '250px',
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: profileData.banner_type === 'color' ? profileData.banner_value : '#e9ecef',
    backgroundImage: profileData.banner_type === 'image' ? `url(${getBannerImagePath(profileData.banner_value)})` : 'none',
    transition: 'background-color 0.3s ease, background-image 0.3s ease',
    position: 'relative'
  };

  // --- NEW: Check if username has been changed for inline warning ---
  const usernameChanged = isEditing && profileData.username.trim() !== originalUsername && profileData.username.trim() !== "";

  return (
    <div className="profile-page-container">
      <div className="profile-banner" style={bannerStyle}></div>
      <div className="container py-4 profile-content-below-banner">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>My Profile</h1>
              {!isEditing && (
                <div>
                  <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/home')}>
                    ← Back to Home
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                      setIsEditing(true);
                      setCurrentBannerType(profileData.banner_type);
                      setCurrentBannerValue(profileData.banner_value);
                      if (profileData.banner_type === 'color') {
                        setCustomColor(profileData.banner_value);
                      } else {
                        setCustomColor('#6c757d');
                      }
                    }}>
                    <i className="bi bi-pencil-square me-2"></i> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="card shadow-sm">
                <div className="card-body">
                  {/* Username */}
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label fw-bold">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control form-control-lg"
                        value={profileData.username}
                        onChange={handleInputChange}
                        required
                        minLength="3"
                        maxLength="30"
                    />
                    {/* --- NEW: Inline Username Change Warning --- */}
                    {usernameChanged && (
                        <div className="form-text text-warning mt-1">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Warning: Changing your username will change your login ID.
                        </div>
                    )}
                  </div>
                  {/* Avatar Selection */}
                  {/* ... (avatar selection code remains the same) ... */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Avatar</label>
                    <div className="avatar-grid">
                      {avatars.map((avatarSrc, index) => (
                        <button key={index} type="button" className={`avatar-item ${profileData.avatar === index + 1 ? 'selected' : ''}`} onClick={() => handleAvatarChange(index + 1)}>
                          <img src={avatarSrc} alt={`Avatar ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BANNER CUSTOMIZATION SECTION */}
                  {/* ... (banner customization code remains the same) ... */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Customize Banner</label>
                    <div className="card">
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label">Banner Type:</label>
                          <div>
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="bannerTypeOptions" id="bannerTypeImage" value="image" checked={currentBannerType === 'image'} onChange={handleBannerTypeChange} />
                              <label className="form-check-label" htmlFor="bannerTypeImage">Predefined Image</label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="bannerTypeOptions" id="bannerTypeColor" value="color" checked={currentBannerType === 'color'} onChange={handleBannerTypeChange} />
                              <label className="form-check-label" htmlFor="bannerTypeColor">Solid Color</label>
                            </div>
                          </div>
                        </div>
                        {currentBannerType === 'image' && (
                          <div className="mb-3">
                            <label className="form-label">Choose an Image:</label>
                            <div className="banner-image-grid">
                              {PREDEFINED_BANNER_IMAGE_IDS.map(imgId => (
                                <button
                                  key={imgId}
                                  type="button"
                                  className={`banner-image-item ${currentBannerValue === imgId ? 'selected' : ''}`}
                                  onClick={() => handleBannerImageSelect(imgId)}
                                  title={BANNER_IMAGE_DISPLAY_NAMES[imgId] || `Banner ${imgId}`}
                                >
                                  <img src={getBannerImagePath(imgId)} alt={BANNER_IMAGE_DISPLAY_NAMES[imgId] || `Banner ${imgId}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentBannerType === 'color' && (
                          <div className="mb-3">
                            <label className="form-label">Choose a Color:</label>
                            <div className="banner-color-swatches mb-2">
                              {predefinedBannerColors.map(color => (
                                <button key={color.id} type="button" className={`banner-color-swatch ${currentBannerValue === color.value ? 'selected' : ''}`} style={{ backgroundColor: color.value }} onClick={() => handleBannerColorSelect(color.value)} title={color.name} />
                              ))}
                            </div>
                            <label htmlFor="customColorInput" className="form-label">Or enter custom hex color:</label>
                            <div className="input-group">
                                <input type="text" id="customColorInput" className="form-control" value={customColor} onChange={handleCustomColorChange} placeholder="#RRGGBB" maxLength="7" />
                                <span className="input-group-text">
                                    <input type="color" value={customColor} onChange={handleCustomColorChange} style={{width: '30px', height:'30px', padding:'0', border:'none'}} title="Pick a color"/>
                                </span>
                            </div>
                             <small className="form-text text-muted"> Current selected color: <span style={{ display: 'inline-block', width: '1em', height: '1em', backgroundColor: currentBannerValue, border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {currentBannerValue} </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {/* ... (bio input code remains the same) ... */}
                   <div className="mb-4">
                    <label htmlFor="bio" className="form-label fw-bold">Bio</label>
                    <textarea id="bio" name="bio" className="form-control" rows="5" value={profileData.bio} onChange={handleInputChange} maxLength="500" placeholder="Tell us about yourself..."/>
                    <small className="text-muted float-end">{profileData.bio.length}/500</small>
                  </div>
                  {/* Action Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary btn-lg"> <i className="bi bi-save me-2"></i> Save Changes </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => {
                        setIsEditing(false);
                        // Revert any unsaved changes on cancel, including username
                        setProfileData(prev => ({ ...prev, username: originalUsername }));
                    }}> Cancel </button>
                  </div>
                </div>
              </form>
            ) : (
              // VIEWING PROFILE (NOT EDITING)
              // ... (viewing mode code remains the same) ...
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center profile-details-view" style={{ marginTop: '-80px', position: 'relative', zIndex: 1 }}>
                    <img src={avatars[(profileData.avatar || 1) - 1]} alt="Selected avatar" className="rounded-circle shadow-lg" style={{ width: '160px', height: '160px', objectFit: 'cover', border: '5px solid white', backgroundColor: 'white' }}/>
                    <h2 className="mt-3 mb-1">{profileData.username}</h2>
                    <small className="text-muted"> Member since {formatRegistrationDate()} </small>
                  </div>
                  <div className="mt-4 pt-4">
                    <h4 className="text-primary"><i className="bi bi-person-badge-fill me-2"></i>About Me</h4>
                    <p className="lead text-muted" style={{ whiteSpace: 'pre-wrap' }}> {profileData.bio || 'No bio provided yet.'} </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
```

## src/frontend/src/components/feature components/tests/QuizSimulator.test.jsx

```
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizSimulator from '../QuizSimulator';
import '@testing-library/jest-dom';

jest.useFakeTimers();

const mockQuiz = {
  id: 1,
  name: 'Test Quiz',
  questions: [
    {
      type: 'multiple_choice',
      text: 'What is React?',
      options: [
        { text: 'Library', isCorrect: true },
        { text: 'Framework', isCorrect: false }
      ]
    }
  ]
};

describe('QuizSimulator Component', () => {
  test('starts and completes quiz', async () => {
    render(
      <MemoryRouter>
        <QuizSimulator quiz={mockQuiz} />
      </MemoryRouter>
    );
    
    // Answer question
    setTimeout(() => {
      fireEvent.click(screen.getByText('Library'));
      fireEvent.click(screen.getByText('Next Question →'));
    
      // Verify completion
      expect(screen.getByText('Quiz Completed!')).toBeInTheDocument();
      expect(screen.getByText('Score: 1/1')).toBeInTheDocument();
    }, 1000); 

  });

  test('handles navigation after completion', async () => {
    const navigate = jest.fn();
    
    render(
      <MemoryRouter>
        <QuizSimulator quiz={mockQuiz} navigate={navigate} />
      </MemoryRouter>
    );
    setTimeout(() => {
        fireEvent.click(screen.getByText('Library'));
        fireEvent.click(screen.getByText('Next Question →'));
        fireEvent.click(screen.getByText('Back to Quizzes'));
        expect(navigate).toHaveBeenCalledWith('/my-quizzes');
        }, 1000);
  });
});
```

## src/frontend/src/components/feature components/tests/MyQuizzes.test.jsx

```
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyQuizzes from '../MyQuizzes';
import '@testing-library/jest-dom';

const mockQuizzes = [
  {
    id: 1,
    name: 'Programming Quiz',
    created_at: '2023-01-01',
    questions: []
  }
];

describe('MyQuizzes Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });
  });

  test('loads and displays quizzes', async () => {
    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Programming Quiz')).toBeInTheDocument();
    });
  });

//   test('handles quiz deletion', async () => {
//     global.fetch.mockResolvedValueOnce({ ok: true });
    
//     render(
//       <MemoryRouter>
//         <MyQuizzes />
//       </MemoryRouter>
//     );

//     await screen.findByText(('Programming Quiz'));
//     fireEvent.click(screen.getAllByText('Verwijderen')[0]);
    
//     await waitFor(() => {
//       expect(fetch).toHaveBeenCalledWith('/api/quizzes/1', {
//         method: 'DELETE',
//         credentials: 'include'
//       });
//     });
//   });

  test('shows empty state', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Je hebt nog geen quiz gemaakt.')).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({error: "Error"}),
    });
    
    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error')).toBeInTheDocument();
  });
});
```

## src/frontend/src/components/feature components/tests/QuizMaker.test.jsx

```
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizMaker from '../QuizMaker';
import '@testing-library/jest-dom';

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ quiz_id: 1 }),
  })
);

describe('QuizMaker Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders empty quiz form', () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Nieuwe Quiz Maken')).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz Naam')).toBeInTheDocument();
  });

  test('adds and removes questions', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    // Add multiple choice question
    fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    expect(screen.getByText('Vraag 1')).toBeInTheDocument();

    // Delete question
    fireEvent.click(screen.getByText('Vraag Verwijderen'));
    expect(screen.queryByText('Vraag 1')).not.toBeInTheDocument();
  });

  test('validates form submission', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Quiz Aanmaken'));
    expect(await screen.findByText('Geef een quiz-naam op a.u.b.')).toBeInTheDocument();
  });

  test('handles question type switching', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    const select = screen.getByRole('combobox');
    
    // Switch to text input
    fireEvent.change(select, { target: { value: 'text_input' }});
    expect(screen.getByLabelText('Correct Antwoord')).toBeInTheDocument();

    // Switch to slider
    fireEvent.change(select, { target: { value: 'slider' }});
    expect(screen.getByLabelText('Correcte Waarde')).toBeInTheDocument();
  });

//   test('submits valid quiz', async () => {
//     render(
//       <MemoryRouter>
//         <QuizMaker />
//       </MemoryRouter>
//     );

//     fireEvent.change(screen.getByLabelText('Quiz Naam'), { 
//       target: { value: 'Test Quiz' } 
//     });
    
//     fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    
//     Fill question data
//     fireEvent.change(screen.getAllByRole('textbox')[0], {
//       target: { value: 'Sample question' }
//     });
    
//     Fill option data
//     fireEvent.change(screen.getAllByRole('textbox')[1], {
//       target: { value: 'Option 1' }
//     });
    
//     fireEvent.click(screen.getByRole('checkbox'));
//     fireEvent.click(screen.getByText('Quiz Aanmaken'));

//     await waitFor(() => {
//       expect(fetch).toHaveBeenCalledTimes(1);
//       expect(screen.getByText('Succes! Quiz ID: 1')).toBeInTheDocument();
//     });
//   });
});
```

## src/frontend/src/components/Home components/Main.jsx

```
// src/frontend/src/components/Home components/Main.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

// --- Helper Components ---

// Join Session Component
export const JoinSessionSection = () => {
    const navigate = useNavigate();
    const [sessionCode, setSessionCode] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleJoin = async () => {
        setError('');
        if (!sessionCode.trim()) {
            setError('Please enter a session code.');
            return;
        }
        if (sessionCode.trim().length !== 6) {
             setError('Session code must be 6 characters long.');
             return;
        }
        setIsChecking(true);
        try {
            const response = await fetch(`/api/sessions/${sessionCode.trim()}`, {credentials: 'include'});
            if (response.ok) {
                navigate(`/session/${sessionCode.trim()}`);
            } else if (response.status === 404) {
                setError(`Session with code "${sessionCode.trim()}" not found.`);
            } else {
                 const errData = await response.json().catch(() => ({}));
                setError(errData.error || 'Could not verify session code. Please try again.');
            }
        } catch (err) {
            console.error("Error checking session code:", err);
            setError('A network error occurred.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="col-12 col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary mb-3">
                        <i className="bi bi-joystick me-2"></i>Join a Quiz Session
                    </h5>
                    <p className="card-text text-muted">Enter the 6-character code provided by the host.</p>
                    <div className="input-group mb-3 mt-auto">
                        <input
                            type="text"
                            className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
                            placeholder="ABCXYZ"
                            value={sessionCode}
                            onChange={(e) => setSessionCode(e.target.value.toUpperCase().trim())}
                            maxLength="6"
                            aria-label="Session Code"
                            disabled={isChecking}
                        />
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleJoin}
                            disabled={isChecking || !sessionCode || sessionCode.length !== 6}
                        >
                            {isChecking ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Join'}
                        </button>
                    </div>
                    {error && <div className="text-danger small mt-1">{error}</div>}
                </div>
            </div>
        </div>
    );
};

// Start/Host Session Component
export const StartQuizSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [numTeams, setNumTeams] = useState('1');

    const preselectHandledForCurrentIdRef = useRef(null);

    const fetchQuizzesAndPreselect = useCallback(async () => {
        console.log("StartQuizSection: fetchQuizzesAndPreselect called. Current location.state:", location.state, "isLoading:", isLoading);

        if (!isLoading) setIsLoading(true);
        setError('');

        let quizOptionsToUse = [];

        try {
            const response = await fetch('/api/quizzes', { credentials: 'include' });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch quizzes');
            }
            const data = await response.json();
            const validQuizzes = data.filter(q => q.questions_count > 0);
            quizOptionsToUse = validQuizzes.map(q => ({
                value: q.id,
                label: q.name,
                questions_count: q.questions_count
            }));
            setQuizzes(quizOptionsToUse);

            if (data.length > 0 && validQuizzes.length === 0) {
                setError("All your quizzes have 0 questions. Add questions to host a session.");
            } else if (data.length === 0) {
                console.log("User has no quizzes.");
            }

            if (location.state?.preselectQuizId) {
                if (location.state.preselectQuizId !== preselectHandledForCurrentIdRef.current) {
                    console.log("StartQuizSection: Attempting to preselect quiz ID:", location.state.preselectQuizId);
                    const quizToSelect = quizOptionsToUse.find(q => q.value === location.state.preselectQuizId);
                    if (quizToSelect) {
                        console.log("StartQuizSection: Preselecting quiz:", quizToSelect.label);
                        setSelectedQuiz(quizToSelect);
                        preselectHandledForCurrentIdRef.current = location.state.preselectQuizId;
                        navigate(location.pathname, { replace: true, state: {} });
                    } else {
                        console.warn("StartQuizSection: PreselectQuizId not found in options:", location.state.preselectQuizId);
                        navigate(location.pathname, { replace: true, state: {} });
                        preselectHandledForCurrentIdRef.current = location.state.preselectQuizId;
                    }
                } else {
                     if (Object.keys(location.state).length > 0) {
                        navigate(location.pathname, { replace: true, state: {} });
                     }
                }
            }

        } catch (err) {
            console.error("Error in fetchQuizzesAndPreselect:", err);
            setError('Could not load or preselect quizzes.');
            setQuizzes([]);
        } finally {
            console.log("StartQuizSection: Fetch/Preselect attempt finished. Setting isLoading to false.");
            setIsLoading(false);
        }
    }, [location.state, navigate, location.pathname]); // isLoading en quizzes.length verwijderd

    useEffect(() => {
        fetchQuizzesAndPreselect();
    }, [fetchQuizzesAndPreselect]);


    const handleStartSession = async () => {
        if (!selectedQuiz) {
            setError('Please select a quiz to host.');
            return;
        }
        if (selectedQuiz.questions_count === 0) {
             setError('Cannot host a quiz with no questions.');
             return;
        }
        setError('');
        setIsLoading(true);
        const teamCount = parseInt(numTeams, 10);
        if (isNaN(teamCount) || teamCount < 1) {
             setError('Number of teams must be a positive number (1 or more).');
             setIsLoading(false);
             return;
        }
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: selectedQuiz.value,
                    num_teams: teamCount
                 }),
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                navigate(`/session/${data.code}`);
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create session');
            }
        } catch (err) {
            console.error("Error creating session:", err);
            setError(err.message || 'Could not create session.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px',
             boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
             borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
             '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' }
        }),
        menu: (provided) => ({ ...provided, zIndex: 5 }),
         option: (provided, state) => ({
             ...provided,
             backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
             color: state.isSelected ? 'white' : '#212529',
             ':active': { backgroundColor: !state.isDisabled ? (state.isSelected ? '#0b5ed7' : '#dee2e6') : undefined, },
             cursor: 'pointer'
         }),
    };

    return (
        <div className="col-12 col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-success mb-3">
                         <i className="bi bi-play-circle-fill me-2"></i>Host a New Session
                    </h5>
                    <p className="card-text text-muted">Select one of your quizzes to start a live session.</p>
                    <div className="mb-3">
                        <label htmlFor="quizSelectHost" className="form-label">Select Quiz:</label>
                        <Select
                            id="quizSelectHost"
                            options={quizzes}
                            value={selectedQuiz}
                            onChange={setSelectedQuiz}
                            isLoading={isLoading}
                            isDisabled={isLoading || (quizzes.length === 0 && !error)}
                            placeholder={isLoading ? "Loading quizzes..." : (quizzes.length === 0 && !error ? "No quizzes with questions available" : "Choose a quiz...")}
                            noOptionsMessage={() => isLoading ? 'Loading...' : (error ? 'Error loading quizzes' : 'No quizzes with questions available')}
                            styles={selectStyles}
                            classNamePrefix="react-select"
                         />
                    </div>
                     <div className="mb-3">
                         <label htmlFor="numTeamsInput" className="form-label">Number of Teams:</label>
                         <input
                             type="number"
                             id="numTeamsInput"
                             className="form-control"
                             value={numTeams}
                             onChange={(e) => setNumTeams(e.target.value)}
                             min="1"
                             step="1"
                             placeholder="e.g., 1 for individual, 2+ for teams"
                             disabled={isLoading || (quizzes.length === 0 && !error)}
                         />
                         <div className="form-text">
                             Enter 1 for individual play, or 2 or more for team mode.
                         </div>
                     </div>
                    {error && <div className="alert alert-danger mt-2 p-2">{error}</div>}
                    <button
                        className="btn btn-success btn-lg mt-auto"
                        onClick={handleStartSession}
                        disabled={isLoading || !selectedQuiz || (selectedQuiz && selectedQuiz.questions_count === 0) || (quizzes.length === 0 && !error)}
                    >
                        {isLoading ? (
                             <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...</>
                         ) : (
                             'Start Session'
                         )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- How It Works Component ---
export const HowItWorksSection = () => (
    <div className="col-12 mb-4">
        <div className="card border-light-subtle shadow-sm">
            <div className="card-body p-lg-4 p-3">
                <h5 className="card-title text-primary mb-4">
                    <i className="bi bi-info-circle-fill me-2"></i>How Aquimemni Sessions Work
                </h5>
                <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            1
                        </span>
                        <div>
                            <strong>Host:</strong> Select one of your quizzes, choose the number of teams (1 for individual, 2+ for teams), and start the session.
                        </div>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            2
                        </span>
                        <div>
                            <strong>Share:</strong> Give the unique 6-character session code to your participants. They can enter this on the home page.
                        </div>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            3
                        </span>
                        <div>
                            <strong>Join:</strong> Participants enter the code to join the session lobby. If it's a team game, they'll select their team there.
                        </div>
                    </li>
                    <li className="d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            4
                        </span>
                        <div>
                            <strong>Play:</strong> Once everyone is ready, the host starts the quiz from the lobby, and all participants play together in real-time!
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
);

// --- Activity Feed Component ---
export const ActivitySection = () => {
    const recentActivities = [];
    const navigate = useNavigate();

    return (
        <div className="col-12 mb-4">
            <div className="card border-light-subtle shadow-sm">
                <div className="card-body p-lg-4 p-3">
                    <h5 className="card-title text-primary mb-3">
                        <i className="bi bi-activity me-2"></i>Recent Activity
                    </h5>
                    {recentActivities.length > 0 ? (
                        <ul className="list-group list-group-flush">
                            {recentActivities.map(activity => (
                                <li
                                    key={activity.id}
                                    className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2"
                                    style={ activity.link ? {cursor: 'pointer'} : {} }
                                    onClick={ activity.link ? () => navigate(activity.link) : undefined }
                                >
                                    <div className="d-flex align-items-center">
                                        <span className={`me-3 p-2 rounded-circle bg-light d-inline-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                                            <i className={`bi ${activity.icon || 'bi-bell-fill'} fs-5`}></i>
                                        </span>
                                        <span>{activity.text}</span>
                                    </div>
                                    <small className="text-muted">{activity.time}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted py-4">
                            <i className="bi bi-clock-history display-4 mb-3 d-block text-primary-emphasis"></i>
                            <p className="h5 mb-2">No recent activity yet.</p>
                            <p className="small">
                                Your hosted games, created quizzes, and joined sessions will appear here once you get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
export const Main = ({ children }) => (
    <main className="px-md-4 py-3">
        <div className="container-fluid">
            <div className="row">
                <JoinSessionSection />
                <StartQuizSection />
                <HowItWorksSection />
                <ActivitySection />
                {children}
            </div>
        </div>
    </main>
);
```

## src/frontend/src/components/Home components/Header.jsx

```
// src/frontend/src/components/Home components/Header.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ username: 'Loading...', avatar: 1 });

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUserData({ username: data.username, avatar: data.avatar || 1 }))
      .catch(() => {/* niet ingelogd? */});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    onLogout?.();
    navigate('/login');
  };

  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/quizzes/search?q=${encodeURIComponent(searchQuery)}`, {
      credentials: 'include'
    });
    if (res.ok) setSearchResults(await res.json());
  };

  const goToQuiz = id => {
    navigate(`/quiz/${id}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-between align-items-center">
        <form onSubmit={handleSearch} className="position-relative" style={{ width: '60%' }}>
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Search quizzes…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSearchResults([]);
              }}
            />
            <button className="btn btn-outline-primary" type="submit">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow overflow-hidden">
              {searchResults.map(item => (
                <div
                  key={item.id}
                  className="search-result-item d-flex align-items-center gap-2"
                  onClick={() => goToQuiz(item.id)}
                >
                  <img
                    src={`/avatars/avatar${item.creator_avatar || 1}.png`}
                    alt={item.creator}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-medium">{item.name}</div>
                    <small className="text-muted">by {item.creator}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="dropdown">
          <button
            className="btn btn-link d-flex align-items-center p-0"
            data-bs-toggle="dropdown"
          >
            <img
              src={`/avatars/avatar${userData.avatar}.png`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: '40px', height: '40px', marginRight: '.5rem' }}
            />
            <span className="d-none d-md-inline">{userData.username}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" onClick={() => navigate('/profile')}>Profile</button></li>
            <li><button className="dropdown-item" onClick={() => navigate('/settings')}>Settings</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item text-danger d-flex justify-content-between align-items-center" // <-- KLASSEN TOEGEVOEGD
                onClick={handleLogout}
              >
                Logout <i className="bi bi-box-arrow-right"></i> {/* <-- ms-2 VERWIJDERD */}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

## src/frontend/src/components/Home components/Home.js

```
// src/frontend/src/components/Home components/Home.js
import React, { useEffect } from 'react';
import Header from './Header'; // Assuming Header component exists and is correct
import NavigationSidebar from './NavigationSidebar'; // Assuming Sidebar component exists and is correct
import { Main } from './Main'; // Import the Main component (which renders the sections)
import { useNavigate } from 'react-router-dom';

// Define approx header height for padding calculation
const HEADER_HEIGHT = '70px'; // Adjust this value if your header's actual height differs

const Home = ({ onLogout }) => {
  const navigate = useNavigate();

  // Optional: Check authentication status on load
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


  // handleLogout function (if needed by Header or Sidebar, pass it down)
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
```

## src/frontend/src/components/Home components/index.css

```
/* Voeg dit toe aan je bestaande index.css */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.text-danger {
  color: #dc3545 !important;
}

/* Quiz specifieke styling */
.quiz-container {
  max-width: 800px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.option-button {
  position: relative;
  min-height: 80px;
  white-space: normal;
  transition: all 0.2s;
}

.option-button.active {
  background: #0d6efd !important;
  color: white !important;
}

.option-button.correct-answer {
  background: #198754 !important;
  color: white !important;
}

.correct-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 1.5rem;
}

.timer-display {
  font-family: monospace;
}

progress::-webkit-progress-value {
  transition: width 0.5s linear;
}

/* Voeg toe aan CSS */
.quiz-restart-enter {
  opacity: 0;
  transform: scale(0.9);
}
.quiz-restart-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 0.3s ease;
}


/* Profielpagina Styling */
.profile-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

/* Profile Component Styles */
.avatar-grid {
  border: 1px solid #e9ecef;
  border-radius: 8px;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.avatar-item {
  border: 3px solid rgba(rgba(255, 0, 0, 0.527), green, blue, alpha);
  padding: 0;
  background: none;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  width: 80px;
  height: 80px;
}

.avatar-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 110, 255, 0.342);
}

.avatar-item.selected {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 109, 253, 0.76);
}

.profile-avatar-view {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #0d6efd;
  margin: 0 auto 1.5rem;
}

.profile-avatar-view img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bio-textarea {
  border-radius: 0.75rem;
  border: 2px solid #dee2e6;
  transition: border-color 0.3s;
  padding: 1rem;
}

.bio-textarea:focus {
  border-color: #0d6efd;
  box-shadow: none;
}

.save-button {
  background: #0d6efd;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.character-counter {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

/* Animatie voor alerts */
@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.alert {
  animation: slideIn 0.3s ease-out;
}

/* Quiz Results */
.quiz-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.result-header {
  background: linear-gradient(135deg, #4a90e2, #3066be);
  margin-bottom: 2rem;
}

.score-display {
  display: inline-block;
  padding: 0.5rem 2rem;
  margin: 1rem 0;
}

.question-card {
  transition: transform 0.2s;
}

.question-card:hover {
  transform: translateY(-3px);
}

.card-title {
  font-size: 1.1rem;
  color: #2c3e50;
}

/* dropdown‐search result styling */
.search-result-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.search-result-item:hover {
  background-color: #f1f1f1;
  color: #0d6efd;
}

```

## src/frontend/src/components/Home components/NavigationSidebar.jsx

```
// frontend/src/components/NavigationSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.css'; // Keep existing CSS imports if needed

/**
 * NavigationSidebar Component
 *
 * Renders a sidebar with navigation links.
 * Styling is passed inline from Home.js to ensure correct flexbox behavior.
 */
const NavigationSidebar = ({ style }) => { // Accept style prop from Home.js
  return (
    // Apply styles passed from parent for flex layout control
    // Removed fixed-start and margin-top, relying on flexbox in Home.js
    <nav
      className="bg-light shadow-sm" // Keep base Bootstrap classes
      style={style} // Apply dynamic styles (width, height, overflow)
    >
      <div className="p-3">
        <h5 className="text-muted mb-3">Navigation</h5>
        <ul className="nav nav-pills flex-column">
          <li className="nav-item">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-house me-2"></i>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/quiz-maker"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-plus-square me-2"></i>
              Quiz Maker
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/my-quizzes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-card-list me-2"></i>
              MyQuizzes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/followers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-people me-2"></i>
              Followers
            </NavLink>
          </li>
          {/* Add other links as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationSidebar;
```

## src/frontend/src/components/Home components/tests/Main.test.jsx

```
// src/components/Home components/tests/Main.test.jsx
import { render } from '@testing-library/react';
import { Main, StartQuizSection } from '../Main';

test('demo button called', () => {
  render(
    <Main>
      <StartQuizSection />
    </Main>
  );
});
```

## src/frontend/src/components/tests/signup.test.jsx

```
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Signup';
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom';

describe('Signup', () => {
    test("sign in button calls not with invalid input sign up handler", async () => {
        const mockSignUpHandler = jest.fn();
        render(
            <MemoryRouter>
                <Signup onSignup={mockSignUpHandler} />
            </MemoryRouter>
        );
        const signup_button = screen.getByRole('button', { name:/Make account/i });
        expect(signup_button).toBeInTheDocument();
        await signup_button.click();
        expect(mockSignUpHandler).not.toHaveBeenCalled();
    });

});
```

## src/frontend/src/components/tests/Quiz.test.js

```
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Quiz from '../feature components/Quiz';
// src/components/tests/Quiz.test.js
import '@testing-library/jest-dom'; // Changed from extend-expect

// Mock fetch voor je API-calls naar /api/home en de trivia API
global.fetch = jest.fn();

describe('Quiz component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading if questions array is empty', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true }}>
        <Quiz onLogout={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading questions.../i)).toBeInTheDocument();
  });

  test('starts quiz when clicking "Start Quiz"', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            category: 'Science: Computers',
            type: 'multiple',
            question: 'Which is a JavaScript framework?',
            correct_answer: 'React',
            incorrect_answers: ['C', 'Rust', 'Python']
          }]
        })
      })
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true }}>
        <Quiz onLogout={jest.fn()} />
      </MemoryRouter>
    );

    // Wait for button to appear
    const startBtn = await screen.findByRole('button', { name: /start quiz/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText(/which is a javascript framework/i)).toBeInTheDocument();
  });

});
```

## src/frontend/src/components/tests/login.test.jsx

```
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import '@testing-library/jest-dom';

describe('Login', () => {
    test("login in button calls not for invalid input sign up handler", async () => {
        const mockLogInHandler = jest.fn();
        render(
            <MemoryRouter>
                <Login onLogin={mockLogInHandler} />
            </MemoryRouter>
        );
        const login_button = screen.getByRole('button', { name:/Log in/i });
        expect(login_button).toBeInTheDocument();
        await login_button.click();
        expect(mockLogInHandler).not.toHaveBeenCalled();
    });

});



```

## src/backend/Questions.py

```
from .init_flask import db
from datetime import datetime

"""
Questions
"""
class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.String(1000), nullable=False)
    question_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __mapper_args__ = {
        'polymorphic_identity': 'question',
        'polymorphic_on': question_type
    }

class TextInputQuestion(Question):
    __tablename__ = 'text_input_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    max_length = db.Column(db.Integer)

    correct_answer = db.Column(db.String(255))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}


class MultipleChoiceQuestion(Question):
    __tablename__ = 'multiple_choice_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    options = db.relationship('MultipleChoiceOption',
                              backref='question',
                              lazy=True,
                              cascade='all, delete-orphan')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

class SliderQuestion(Question):
    __tablename__ = 'slider_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    min_value = db.Column(db.Integer, nullable=False)
    max_value = db.Column(db.Integer, nullable=False)
    step = db.Column(db.Integer, default=1)

    correct_value = db.Column(db.Integer)

    __mapper_args__ = {'polymorphic_identity': 'slider'}    


"""
OPTIONS
"""
class MultipleChoiceOption(db.Model):
    __tablename__ = 'multiple_choice_options'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_questions.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
```

## src/backend/Answers.py

```
from .app import db
from datetime import datetime

class Answer(db.Model):
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)
    answer_type = db.Column(db.String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'answer',
        'polymorphic_on': answer_type
    }

class TextInputAnswer(Answer):
    __tablename__ = 'text_input_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.String(1000))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}

class MultipleChoiceAnswer(Answer):
    __tablename__ = 'multiple_choice_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    option_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_options.id'))

    option = db.relationship('MultipleChoiceOption', backref='answers')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

class SliderAnswer(Answer):
    __tablename__ = 'slider_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    value = db.Column(db.Integer, nullable=False)

    __mapper_args__ = {'polymorphic_identity': 'slider'}
```

## src/backend/session.py

```
# src/backend/session.py
from .init_flask import db
from datetime import datetime

class QuizSession(db.Model):
    __tablename__ = 'quiz_sessions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    started = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    num_teams = db.Column(db.Integer, default=1, nullable=False) # Default to 1 (individual mode)

    # Modified line:
    quiz = db.relationship('Quiz', backref=db.backref('sessions', cascade='all, delete-orphan', lazy='dynamic'))
    # End of modified line

    host = db.relationship('User', backref='hosted_sessions')
    participants = db.relationship('SessionParticipant', backref='session', cascade="all, delete-orphan")

    # Helper property to check if it's team mode (>1 team)
    @property
    def is_team_mode(self):
        return self.num_teams > 1


class SessionParticipant(db.Model):
    __tablename__ = 'session_participants'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    team_number = db.Column(db.Integer) # 1, 2, 3... or None if num_teams is 1
    score = db.Column(db.Float, default=0.0)

    user = db.relationship('User', backref='session_participations')

    # Add a unique constraint to ensure a user can only join a session once
    __table_args__ = (db.UniqueConstraint('session_id', 'user_id', name='_session_user_uc'),)

```

## src/backend/init_flask.py

```
from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config
from flask_cors import CORS  # Add CORS support

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

main_bp = Blueprint('main', __name__)

CORS(main_bp, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Update with your frontend origin
        "supports_credentials": True
    }
})


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    db.init_app(app)
    migrate.init_app(app, db)

    # Import routes NA initialisatie
    from .app import main_bp
    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()
        
    return app
```

## src/backend/config.py

```
import os

class Config:
    # -------------------------------
    # Algemene Flask-config
    # -------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    # Bovenstaande gebruikt een environment variable voor SECRET_KEY
    # Bijv. in productie: export SECRET_KEY="ZeerSterkeRandomWaarde"
    # Anders fallback naar "dev-secret-key" (NIET aangeraden voor productie)

    # -------------------------------
    # Database-config (PostgreSQL)
    # -------------------------------
    # Standaard: lokale Postgres; pas 'myuser', 'mypass', 'mydb' aan naar wat je in psql hebt ingesteld
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://app:123456@localhost/mydb")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # -------------------------------
    # Flask-Session config
    # -------------------------------
    SESSION_TYPE = 'filesystem'   # Sla sessies server-side op (in bestanden)
    SESSION_PERMANENT = False     # Sessies vervallen als de browser sluit

    # Hieronder kun je SameSite / Secure-cookies instellen.
    # In development werkt het soms handiger om SameSite='None' & Secure=False te doen
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False  # In productie op True zetten als je https gebruikt!

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "postgresql://app:123456@localhost/mydb_test"
```

## src/backend/app.py

```
# src/backend/app.py
import random  # For session code generation
import string
from datetime import datetime
import re  # for hex color validation

from flask import Blueprint, request, jsonify, session
from flask_cors import CORS  # Add CORS support
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError  # Import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

from .Questions import (
    Question,
    TextInputQuestion,
    MultipleChoiceOption,
    SliderQuestion,
    MultipleChoiceQuestion
)

from .init_flask import db, main_bp
# --- Import Updated Models ---
from .session import (
    QuizSession,
    SessionParticipant,
)

followers = db.Table('followers',
                     db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
                     db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
                     )


# ------------------------------
# DATABASE MODELLEN (User, Quiz)
# ------------------------------

class User(db.Model):
    """
    User Model
    Slaat gebruikersgegevens op.
    - id: Primaire sleutel
    - username: Unieke gebruikersnaam
    - password_hash: Gehashte wachtwoord
    - avatar: gekozen avatar
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text)
    avatar = db.Column(db.Integer, default=1)  # Added default for avatar
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # --- BANNER FIELDS ---
    banner_type = db.Column(db.String(50), default='color')  # 'image' or 'color'
    banner_value = db.Column(db.String(255), default='#6c757d')  # Default to a neutral gray color or an image ID

    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic'
    )
    quizzes = db.relationship('Quiz',
                              backref="user",
                              lazy=True,
                              cascade='all, delete-orphan')

    def is_following(self, user):
        if not user or not user.id:
            return False
        return self.followed.filter(followers.c.followed_id == user.id).count() > 0

    def follow(self, user):
        if user and user.id and not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if user and user.id and self.is_following(user):
            self.followed.remove(user)


class Quiz(db.Model):
    """
    Quiz Model
    Houdt vast welke quiz door welke gebruiker is aangemaakt.
    - id: Primaire sleutel voor de quiz
    - user_id: Buitenlandse sleutel naar de gebruiker
    - name: Naam van de quiz
    - created_at: Datum en tijd van aanmaak
    """
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')


# ------------------------------
# ROUTES / ENDPOINTS
# ------------------------------

# --- om users hun profielen te kunnen bezoeken ---
@main_bp.route('/users/<int:user_id>/profile', methods=['GET'])
def get_public_profile(user_id):
    profile_user = db.session.get(User, user_id)

    if not profile_user:
        return jsonify({"error": "User not found"}), 404

    is_following_profile_user = False
    current_user_id = session.get('user_id')
    viewing_own_profile = False

    if current_user_id:
        current_user = db.session.get(User, current_user_id)
        if current_user:
            if current_user.id == profile_user.id:
                viewing_own_profile = True
            else:
                is_following_profile_user = current_user.is_following(profile_user)
        else:
            session.clear()

    public_quizzes = []
    for quiz in profile_user.quizzes:
        public_quizzes.append({
            "id": quiz.id,
            "name": quiz.name,
            "created_at": quiz.created_at.isoformat(),
            "questions_count": len(quiz.questions)
        })

    return jsonify({
        "id": profile_user.id,
        "username": profile_user.username,
        "bio": profile_user.bio,
        "avatar": profile_user.avatar,
        "registered_at": profile_user.registered_at.isoformat() if profile_user.registered_at else None,
        "is_following": is_following_profile_user,
        "viewing_own_profile": viewing_own_profile,
        "quizzes": public_quizzes,
        "followers_count": profile_user.followers.count(),
        "following_count": profile_user.followed.count(),
        # --- RETURN BANNER DATA ---
        "banner_type": profile_user.banner_type,
        "banner_value": profile_user.banner_value
    }), 200


# --- --- ---

# --- User Search, Follow/Unfollow, Auth ---
# ... (Houd bestaande routes ongewijzigd) ...
@main_bp.route('/users/search', methods=['GET'])
def search_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user:  # Handle case where user might have been deleted
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    search_query = request.args.get('q', '').strip().lower()

    if not search_query:
        return jsonify([]), 200

    sanitized_query = search_query.replace('%', '\\%').replace('_', '\\_')

    users = User.query.filter(
        User.username.ilike(f'{sanitized_query}%'),
        User.id != current_user.id
    ).order_by(
        User.username.asc()
    ).limit(10).all()

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)
    } for u in users]), 200


@main_bp.route('/quizzes/search', methods=['GET'])
def search_quizzes():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user:  # Handle case where user might have been deleted
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([]), 200

    # prefix‐match voor name én username
    name_pattern = f"{q}%"
    user_pattern = f"{q}%"

    quizzes = (
        Quiz.query
        .join(User)
        .filter(
            Quiz.user_id != session['user_id'],
            or_(
                Quiz.name.ilike(name_pattern),
                User.username.ilike(user_pattern)
            )
        )
        .order_by(Quiz.name.asc())
        .limit(10)
        .all()
    )

    result = [{
        "id": quiz.id,
        "name": quiz.name,
        "creator": quiz.user.username if quiz.user else 'Unknown',  # Handle potential missing user
        "creator_avatar": quiz.user.avatar if quiz.user else None,
        "created_at": quiz.created_at.isoformat(),
        "questions_count": len(quiz.questions)
    } for quiz in quizzes]

    return jsonify(result), 200


@main_bp.route('/users/all', methods=['GET'])
def get_all_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    current_user = User.query.get(session['user_id'])
    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401
    users = User.query.filter(User.id != current_user.id).order_by(User.username.asc()).all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)
    } for u in users]), 200


@main_bp.route('/follow/<int:user_id>', methods=['POST'])
def follow_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    user_to_follow = User.query.get(user_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not user_to_follow or current_user.id == user_id:
        return jsonify({"error": "Invalid request"}), 400

    if current_user.is_following(user_to_follow):
        return jsonify({"error": "Already following user"}), 400

    current_user.follow(user_to_follow)
    db.session.commit()
    return jsonify({"message": f"Now following {user_to_follow.username}"}), 200


@main_bp.route('/unfollow/<int:user_id>', methods=['POST'])
def unfollow_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    user_to_unfollow = User.query.get(user_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not user_to_unfollow or not current_user.is_following(user_to_unfollow):
        return jsonify({"error": "Invalid request"}), 400

    current_user.unfollow(user_to_unfollow)
    db.session.commit()
    return jsonify({"message": f"Unfollowed {user_to_unfollow.username}"}), 200


@main_bp.route('/followers/<int:follower_id>', methods=['DELETE'])
def remove_follower(follower_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    follower = User.query.get(follower_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not follower or not current_user.followers.filter_by(id=follower_id).first():
        return jsonify({"error": "Invalid request"}), 400

    # A follower unfollows the current user
    follower.unfollow(current_user)
    db.session.commit()
    return jsonify({"message": "Follower removed successfully"}), 200


@main_bp.route('/followers', methods=['GET'])
def get_followers():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)  # Check if current user follows their follower back
    } for u in current_user.followers.all()]), 200


@main_bp.route('/following', methods=['GET'])
def get_following():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar
    } for u in user.followed.all()]), 200


@main_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Trim whitespace
    username = username.strip()
    password = password.strip()
    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    # Backend length validation
    if len(username) > 32:
        return jsonify({"error": "Username cannot exceed 32 characters"}), 400
    if len(password) > 64:
        return jsonify({"error": "Password cannot exceed 64 characters"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists"}), 409

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User {username} registered successfully"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error during signup: {e}")
        return jsonify({"error": "Could not register user"}), 500


@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Trim whitespace
    username = username.strip()
    password = password.strip()
    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    # Backend length validation (consistentie)
    if len(username) > 32:
        return jsonify({"error": "Invalid login credentials"}), 401  # Username too long
    if len(password) > 64:
        return jsonify({"error": "Invalid login credentials"}), 401  # Password too long

    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid login credentials"}), 401

    session.clear()
    session['user_id'] = user.id
    session['username'] = user.username

    return jsonify({"message": f"Logged in as {user.username}",
                    "user": {"id": user.id, "username": user.username, "avatar": user.avatar}}), 200


@main_bp.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401

    user = User.query.get(session['user_id'])
    if not user:  # Check if user still exists
        session.clear()
        return jsonify({"error": "Niet gemachtigd"}), 401

    username = session.get('username', 'Onbekend')  # Fallback, though should be set on login
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."}), 200


@main_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Uitgelogd"}), 200


# --- Quiz Management ---
@main_bp.route('/quizzes', methods=['GET'])
def get_user_quizzes():
    if 'user_id' not in session:
        return jsonify({"error": "Niet ingelogd"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.desc()).all()
    quizzes_data = []

    for quiz in quizzes:
        global_questions = []
        for question in quiz.questions:
            q_data = {
                "id": question.id,
                "type": question.question_type,
                "text": question.question_text
            }

            if hasattr(question, 'options'):  # Check if it's MultipleChoiceQuestion
                q_data['options'] = [{
                    "id": opt.id,
                    "text": opt.text,
                    "is_correct": opt.is_correct
                } for opt in question.options]
            elif hasattr(question, 'min_value'):  # Check if it's SliderQuestion
                q_data.update({
                    "min": question.min_value,
                    "max": question.max_value,
                    "step": question.step,
                    "correct_value": question.correct_value
                })
            elif hasattr(question, 'max_length'):  # Check if it's TextInputQuestion
                q_data.update({
                    "max_length": question.max_length,
                    "correct_answer": question.correct_answer
                })

            global_questions.append(q_data)

        quizzes_data.append({
            "id": quiz.id,
            "name": quiz.name,
            "created_at": quiz.created_at.isoformat(),
            "questions": global_questions,
            "questions_count": len(global_questions)  # Add question count
        })

    return jsonify(quizzes_data), 200


@main_bp.route('/quiz', methods=['POST'])
def create_quiz():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    data = request.get_json()
    if not data or 'name' not in data or not data['name'].strip():
        return jsonify({"error": "Quiz name required"}), 400
    if 'questions' not in data or not isinstance(data['questions'], list):
        return jsonify({"error": "Invalid questions format"}), 400

    try:
        new_quiz = Quiz(
            user_id=session['user_id'],
            name=data['name'].strip()  # Trim whitespace
        )
        db.session.add(new_quiz)
        db.session.flush()  # Flush to get the new_quiz.id before creating questions

        for q_data in data.get('questions', []):
            if not q_data or 'type' not in q_data or 'text' not in q_data or not q_data['text'].strip():
                raise ValueError("Invalid question data: Missing type or text.")

            question = None
            q_type = q_data['type']
            q_text = q_data['text'].strip()

            if q_type == 'text_input':
                question = TextInputQuestion(
                    quiz_id=new_quiz.id,
                    question_text=q_text,
                    max_length=q_data.get('max_length', 255),
                    correct_answer=q_data.get('correct_answer')
                )
            elif q_type == 'multiple_choice':
                question = MultipleChoiceQuestion(
                    quiz_id=new_quiz.id,
                    question_text=q_text
                )
                db.session.add(question)
                db.session.flush()

                options_data = q_data.get('options', [])
                if not options_data or not isinstance(options_data, list):
                    raise ValueError("Multiple choice question requires options.")

                correct_options_count = 0
                for opt_data in options_data:
                    if not opt_data or 'text' not in opt_data or not opt_data['text'].strip():
                        raise ValueError("Invalid option data: Missing text.")
                    is_correct = opt_data.get('isCorrect', False)
                    if is_correct:
                        correct_options_count += 1
                    option = MultipleChoiceOption(
                        question_id=question.id,
                        text=opt_data['text'].strip(),
                        is_correct=is_correct
                    )
                    db.session.add(option)
            elif q_type == 'slider':
                min_val = q_data.get('min', 0)
                max_val = q_data.get('max', 10)
                step_val = q_data.get('step', 1)
                correct_val = q_data.get('correct_value')

                if not isinstance(min_val, int) or not isinstance(max_val, int) or not isinstance(step_val, int):
                    raise ValueError("Slider min, max, and step must be integers.")
                if min_val >= max_val:
                    raise ValueError("Slider min value must be less than max value.")
                if step_val <= 0:
                    raise ValueError("Slider step must be positive.")
                if correct_val is not None:
                    if not isinstance(correct_val, int):
                        raise ValueError("Slider correct value must be an integer.")
                    if not (min_val <= correct_val <= max_val):
                        raise ValueError("Slider correct value must be within min/max range.")
                question = SliderQuestion(
                    quiz_id=new_quiz.id,
                    question_text=q_text,
                    min_value=min_val,
                    max_value=max_val,
                    step=step_val,
                    correct_value=correct_val
                )
            else:
                raise ValueError(f"Unsupported question type: {q_type}")

            if question:
                db.session.add(question)

        db.session.commit()
        return jsonify({"message": "Quiz created", "quiz_id": new_quiz.id}), 201

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating quiz: {e}")
        return jsonify({"error": "Could not create quiz due to an internal error."}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    questions = []
    for question in quiz.questions:
        q_data = {
            "id": question.id,
            "type": question.question_type,
            "text": question.question_text
        }
        if hasattr(question, 'options'):
            q_data['options'] = [{"id": opt.id, "text": opt.text, "is_correct": opt.is_correct} for opt in
                                 question.options]
        elif hasattr(question, 'min_value'):
            q_data.update({"min": question.min_value, "max": question.max_value, "step": question.step,
                           "correct_value": question.correct_value})
        elif hasattr(question, 'max_length'):
            q_data.update({"max_length": question.max_length, "correct_answer": question.correct_answer})
        questions.append(q_data)

    creator_username = quiz.user.username if quiz.user else "Unknown User"
    creator_avatar = quiz.user.avatar if quiz.user else None

    return jsonify({
        "id": quiz.id,
        "name": quiz.name,
        "created_at": quiz.created_at.isoformat(),
        "creator": creator_username,
        "creator_avatar": creator_avatar,
        "questions": questions,
        "questions_count": len(questions)
    }), 200


@main_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear();
        return jsonify({"error": "Invalid session"}), 401

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        existing_quiz = db.session.get(Quiz, quiz_id)
        return jsonify({"error": "Forbidden: You do not own this quiz"}), 403 if existing_quiz else jsonify(
            {"error": "Quiz not found"}), 404

    try:
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"message": "Quiz deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting quiz {quiz_id}: {e}")
        return jsonify({"error": "Could not delete quiz due to an internal error."}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear();
        return jsonify({"error": "Invalid session"}), 401

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        existing_quiz = db.session.get(Quiz, quiz_id)
        return jsonify({"error": "Forbidden: You do not own this quiz"}), 403 if existing_quiz else jsonify(
            {"error": "Quiz not found"}), 404

    data = request.get_json()
    if not data: return jsonify({"error": "No data provided"}), 400
    if 'name' not in data or not data['name'].strip(): return jsonify({"error": "Quiz name required"}), 400
    if 'questions' not in data or not isinstance(data['questions'], list): return jsonify(
        {"error": "Invalid questions format"}), 400

    try:
        quiz.name = data['name'].strip()
        existing_question_ids = {q.id for q in quiz.questions}
        questions_to_add = []
        updated_question_ids = set()

        for q_data in data.get('questions', []):
            if not q_data or 'type' not in q_data or 'text' not in q_data or not q_data['text'].strip():
                raise ValueError("Invalid question data: Missing type or text.")

            q_id = q_data.get('id')
            q_type = q_data['type']
            q_text = q_data['text'].strip()

            if q_id and q_id in existing_question_ids:  # Update existing
                question = db.session.get(Question, q_id)
                if not question or question.quiz_id != quiz.id: raise ValueError(f"Invalid question ID {q_id}")
                if question.question_type != q_type: raise ValueError(f"Changing question type not supported.")

                question.question_text = q_text
                updated_question_ids.add(q_id)

                if q_type == 'text_input':
                    question.max_length = q_data.get('max_length', 255)
                    question.correct_answer = q_data.get('correct_answer')
                elif q_type == 'multiple_choice':
                    MultipleChoiceOption.query.filter_by(question_id=q_id).delete(
                        synchronize_session=False)  # clear old options
                    options_data = q_data.get('options', [])
                    if not options_data: raise ValueError("MC Question needs options.")
                    for opt_data in options_data:
                        if not opt_data or 'text' not in opt_data or not opt_data['text'].strip(): raise ValueError(
                            "Invalid option data.")
                        db.session.add(MultipleChoiceOption(question_id=q_id, text=opt_data['text'].strip(),
                                                            is_correct=opt_data.get('isCorrect', False)))
                elif q_type == 'slider':
                    min_val, max_val = q_data.get('min', 0), q_data.get('max', 10)
                    if min_val >= max_val: raise ValueError("Slider min >= max")
                    question.min_value, question.max_value = min_val, max_val
                    question.step = q_data.get('step', 1)
                    question.correct_value = q_data.get('correct_value')
            else:  # Add new question
                new_question = None
                if q_type == 'text_input':
                    new_question = TextInputQuestion(quiz_id=quiz.id, question_text=q_text,
                                                     max_length=q_data.get('max_length', 255),
                                                     correct_answer=q_data.get('correct_answer'))
                elif q_type == 'multiple_choice':
                    new_question = MultipleChoiceQuestion(quiz_id=quiz.id, question_text=q_text)
                    db.session.add(new_question);
                    db.session.flush()  # Need ID for options
                    options_data = q_data.get('options', [])
                    if not options_data: raise ValueError("MC Question needs options.")
                    for opt_data in options_data:
                        if not opt_data or 'text' not in opt_data or not opt_data['text'].strip(): raise ValueError(
                            "Invalid option data.")
                        db.session.add(MultipleChoiceOption(question_id=new_question.id, text=opt_data['text'].strip(),
                                                            is_correct=opt_data.get('isCorrect', False)))
                elif q_type == 'slider':
                    min_val, max_val = q_data.get('min', 0), q_data.get('max', 10)
                    if min_val >= max_val: raise ValueError("Slider min >= max")
                    new_question = SliderQuestion(quiz_id=quiz.id, question_text=q_text, min_value=min_val,
                                                  max_value=max_val, step=q_data.get('step', 1),
                                                  correct_value=q_data.get('correct_value'))
                else:
                    raise ValueError(f"Unsupported question type: {q_type}")

                if new_question: questions_to_add.append(new_question)

        # --- CORRECTED Deletion Logic ---
        question_ids_to_delete = existing_question_ids - updated_question_ids
        if question_ids_to_delete:
            print(f"Attempting to delete question IDs: {question_ids_to_delete}")

            # 1. Delete dependent Multiple Choice Options first
            mc_questions_to_delete_ids = db.session.query(MultipleChoiceQuestion.id) \
                .filter(MultipleChoiceQuestion.id.in_(question_ids_to_delete)).all()
            if mc_questions_to_delete_ids:
                actual_mc_ids = [q_id for q_id, in mc_questions_to_delete_ids]
                if actual_mc_ids:
                    print(f"Deleting options for MC question IDs: {actual_mc_ids}")
                    MultipleChoiceOption.query.filter(MultipleChoiceOption.question_id.in_(actual_mc_ids)).delete(
                        synchronize_session='fetch')

            # 2. Delete from the specific subtype tables FIRST
            print(f"Deleting from text_input_questions for IDs: {question_ids_to_delete}")
            TextInputQuestion.query.filter(TextInputQuestion.id.in_(question_ids_to_delete)).delete(
                synchronize_session='fetch')

            print(f"Deleting from multiple_choice_questions for IDs: {question_ids_to_delete}")
            MultipleChoiceQuestion.query.filter(MultipleChoiceQuestion.id.in_(question_ids_to_delete)).delete(
                synchronize_session='fetch')

            print(f"Deleting from slider_questions for IDs: {question_ids_to_delete}")
            SliderQuestion.query.filter(SliderQuestion.id.in_(question_ids_to_delete)).delete(
                synchronize_session='fetch')

            # 3. NOW it's safe to delete from the base Question table
            print(f"Deleting from base questions table for IDs: {question_ids_to_delete}")
            Question.query.filter(Question.id.in_(question_ids_to_delete)).delete(synchronize_session='fetch')
            print("Deletion queries executed.")

        if questions_to_add:
            print(f"Adding {len(questions_to_add)} new questions.")
            db.session.add_all(questions_to_add)

        print("Committing transaction.")
        db.session.commit()
        print("Transaction committed.")
        return jsonify({"message": "Quiz updated", "quiz_id": quiz.id}), 200

    except ValueError as ve:
        db.session.rollback()
        print(f"ValueError during quiz update {quiz_id}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error updating quiz {quiz_id}: {type(e).__name__} - {e}")
        traceback.print_exc()
        return jsonify({"error": "Could not update quiz due to an internal error."}), 500


# --- Profile Management ---
@main_bp.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = db.session.get(User, session['user_id'])
    if not user:
        session.clear()
        return jsonify({"error": "User not found or session invalid"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id,
            "username": user.username,
            "bio": user.bio,
            "avatar": user.avatar,
            "registered_at": user.registered_at.isoformat() if user.registered_at else None,
            # --- RETURN BANNER DATA ---
            "banner_type": user.banner_type,
            "banner_value": user.banner_value
        }), 200

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        updated = False

        if 'username' in data:
            new_username = data['username'].strip()
            if not new_username:
                return jsonify({"error": "Username cannot be empty"}), 400
            if new_username != user.username:
                existing_user = User.query.filter(User.username == new_username, User.id != user.id).first()
                if existing_user:
                    return jsonify({"error": "Username already taken"}), 409
                user.username = new_username
                session['username'] = new_username
                updated = True

        if 'bio' in data:
            if data['bio'] is not None and data['bio'] != user.bio:
                user.bio = data['bio']
                updated = True

        if 'avatar' in data:
            new_avatar = data['avatar']
            # Assuming avatar is an integer identifier for pre-defined images
            if isinstance(new_avatar, int) and 1 <= new_avatar <= 12:  # Example range
                if new_avatar != user.avatar:
                    user.avatar = new_avatar
                    updated = True
            else:
                return jsonify({"error": "Invalid avatar number."}), 400

        # --- HANDLE BANNER UPDATE ---
        if 'banner_type' in data and 'banner_value' in data:
            banner_type = data['banner_type']
            banner_value = data['banner_value']

            if banner_type not in ['image', 'color']:
                return jsonify({"error": "Invalid banner type. Must be 'image' or 'color'."}), 400

            if banner_type == 'image':
                # Banner images identified by a string key (e.g., "1", "2", ..., "5", "default")
                # These keys correspond to image files like banner1.jpg, banner_default.jpg
                valid_banner_identifiers = ['1', '2', '3', '4', '5', '6','default']  # Define your valid identifiers
                if not isinstance(banner_value, str) or banner_value not in valid_banner_identifiers:
                    return jsonify({"error": f"Invalid banner image identifier. Choose from predefined options."}), 400

            elif banner_type == 'color':
                if not isinstance(banner_value, str) or not re.match(r"^#(?:[0-9a-fA-F]{3}){1,2}$", banner_value):
                    return jsonify({"error": "Invalid color hex code. Must be e.g., #RRGGBB or #RGB."}), 400

            if user.banner_type != banner_type or user.banner_value != banner_value:
                user.banner_type = banner_type
                user.banner_value = banner_value
                updated = True

        elif 'banner_type' in data or 'banner_value' in data:  # Only one provided
            return jsonify({"error": "Both banner_type and banner_value are required if updating banner."}), 400

        if not updated:
            return jsonify({"message": "No changes detected"}), 200

        try:
            db.session.commit()
            # After commit, fetch the user again to ensure the returned data is fresh,
            # especially if 'updated_at' or other server-side defaults are modified.
            # However, for this specific case, returning the already modified user object is fine.
            return jsonify({
                "message": "Profile updated",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "bio": user.bio,
                    "avatar": user.avatar,
                    # --- RETURN UPDATED BANNER DATA ---
                    "banner_type": user.banner_type,
                    "banner_value": user.banner_value
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating profile for user {user.id}: {e}")
            return jsonify({"error": "Could not update profile due to an internal error."}), 500


@main_bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = db.session.get(User, session['user_id'])
    if not user:
        session.clear()
        return jsonify({"error": "User not found or session invalid"}), 401

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    confirm_password = data.get('confirmPassword')  # Add confirmation check

    if not current_password or not new_password or not confirm_password:
        return jsonify({"error": "All password fields required"}), 400

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match"}), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error changing password for user {user.id}: {e}")
        return jsonify({"error": "Could not change password due to an internal error."}), 500


@main_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']  # Get user_id from session
    user = db.session.get(User, user_id)  # Fetch user using the ID
    if not user:
        session.clear()
        return jsonify({"error": "User not found or session invalid"}), 401

    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({"error": "Password required to delete account"}), 400

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 401

    try:
        # Deletion Order: Sessions, Participants, Follows, Quiz Content, Quizzes, User
        hosted_session_ids_query = QuizSession.query.filter_by(host_id=user.id).with_entities(QuizSession.id)
        hosted_session_ids = [id_tuple[0] for id_tuple in hosted_session_ids_query.all()]
        if hosted_session_ids:
            SessionParticipant.query.filter(SessionParticipant.session_id.in_(hosted_session_ids)).delete(
                synchronize_session=False)
            QuizSession.query.filter(QuizSession.id.in_(hosted_session_ids)).delete(synchronize_session=False)
        SessionParticipant.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        db.session.execute(
            followers.delete().where((followers.c.follower_id == user.id) | (followers.c.followed_id == user.id)))

        user_quiz_ids_query = Quiz.query.filter_by(user_id=user.id).with_entities(Quiz.id)
        user_quiz_ids = [id_tuple[0] for id_tuple in user_quiz_ids_query.all()]
        if user_quiz_ids:
            question_ids_query = Question.query.filter(Question.quiz_id.in_(user_quiz_ids)).with_entities(Question.id)
            question_ids = [id_tuple[0] for id_tuple in question_ids_query.all()]
            if question_ids:
                mc_question_ids_query = MultipleChoiceQuestion.query.filter(
                    MultipleChoiceQuestion.id.in_(question_ids)).with_entities(MultipleChoiceQuestion.id)
                mc_question_ids = [id_tuple[0] for id_tuple in mc_question_ids_query.all()]
                if mc_question_ids:
                    MultipleChoiceOption.query.filter(MultipleChoiceOption.question_id.in_(mc_question_ids)).delete(
                        synchronize_session=False)
                TextInputQuestion.query.filter(TextInputQuestion.id.in_(question_ids)).delete(synchronize_session=False)
                MultipleChoiceQuestion.query.filter(MultipleChoiceQuestion.id.in_(question_ids)).delete(
                    synchronize_session=False)
                SliderQuestion.query.filter(SliderQuestion.id.in_(question_ids)).delete(synchronize_session=False)
                Question.query.filter(Question.id.in_(question_ids)).delete(synchronize_session=False)
            Quiz.query.filter(Quiz.id.in_(user_quiz_ids)).delete(synchronize_session=False)

        db.session.delete(user)
        db.session.commit()
        session.clear()
        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"ERROR deleting account for user {user.id} ({user.username}): {type(e).__name__} - {e}")
        traceback.print_exc()
        return jsonify({"error": "Could not delete account due to an internal error. Please check server logs."}), 500


# ------------------------------
# SESSION MANAGEMENT ROUTES
# ------------------------------
@main_bp.route('/sessions', methods=['POST'])
def create_session():
    """Creates a new quiz session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    host_user = User.query.get(user_id)
    if not host_user:
        session.clear()
        return jsonify({'error': 'Invalid session'}), 401

    data = request.get_json()
    quiz_id = data.get('quiz_id')
    num_teams_req = data.get('num_teams')

    if not quiz_id:
        return jsonify({'error': 'Quiz ID is required'}), 400

    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    if len(quiz.questions) == 0:  # Check if quiz has questions
        return jsonify({'error': 'Cannot host a quiz with no questions'}), 400

    try:
        num_teams = int(num_teams_req)
        if num_teams < 1:
            raise ValueError()
    except (ValueError, TypeError):
        num_teams = 1

    def generate_code(length=6):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    code = generate_code()
    while QuizSession.query.filter_by(code=code).first():
        code = generate_code()

    try:
        new_session = QuizSession(
            quiz_id=quiz_id,
            host_id=user_id,
            code=code,
            num_teams=num_teams
        )
        db.session.add(new_session)
        db.session.commit()
        return jsonify({'message': 'Session created', 'code': code, 'quiz_id': quiz_id, 'num_teams': num_teams}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating session: {e}")
        return jsonify({'error': 'Could not create session'}), 500


@main_bp.route('/sessions/<string:code>/join', methods=['POST'])
def join_session(code):
    """Allows a logged-in user to join or switch teams in a session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'error': 'Invalid session'}), 401

    data = request.get_json()
    team_number_req = data.get('team_number')

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.started:
        return jsonify({'error': 'Session has already started'}), 403

    team_number = None
    if quiz_session.is_team_mode:
        try:
            team_number = int(team_number_req)
            if not (1 <= team_number <= quiz_session.num_teams):
                return jsonify({'error': f'Invalid team number. Choose between 1 and {quiz_session.num_teams}.'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Team number is required for this session'}), 400

    participant = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=user_id
    ).first()

    try:
        if participant:
            if participant.team_number != team_number:
                participant.team_number = team_number
                db.session.commit()
                return jsonify({
                                   'message': f'Switched to Team {team_number}' if team_number else 'Switched to individual participation',
                                   'action': 'switched_team'}), 200
            else:
                return jsonify(
                    {'message': 'Already in this team' if team_number else 'Already participating individually',
                     'action': 'no_change'}), 200
        else:
            new_participant = SessionParticipant(
                session_id=quiz_session.id,
                user_id=user_id,
                team_number=team_number
            )
            db.session.add(new_participant)
            db.session.commit()
            return jsonify(
                {'message': f'Joined Team {team_number}' if team_number else 'Joined session', 'action': 'joined'}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Could not join session due to a conflict. Please try again.'}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error joining/switching team for session {code}, user {user_id}: {e}")
        return jsonify({'error': 'Could not join session'}), 500


@main_bp.route('/sessions/<string:code>/start', methods=['POST'])
def start_session(code):
    """Starts the quiz session (only host)."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    quiz_session = QuizSession.query.filter_by(code=code).first()

    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.host_id != user_id:
        return jsonify({'error': 'Only the host can start this session'}), 403

    if quiz_session.started:
        return jsonify({'error': 'Session already started'}), 400

    try:
        quiz_session.started = True
        db.session.commit()
        return jsonify({'message': 'Session started'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error starting session {code}: {e}")
        return jsonify({'error': 'Could not start session'}), 500


@main_bp.route('/sessions/<string:code>', methods=['GET'])
def get_session_info(code):
    """Gets basic information about a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    host_username = quiz_session.host.username if quiz_session.host else "Unknown Host"
    quiz_name = "Unknown Quiz"
    quiz_maker_username = "Unknown Maker" # NIEUW: Default waarde
    quiz_maker_avatar = None # NIEUW: Default waarde
    quiz_maker_id = None # NIEUW: Default waarde

    if quiz_session.quiz:
        quiz_name = quiz_session.quiz.name
        if quiz_session.quiz.user: # De 'user' relatie op het Quiz model is de maker
            quiz_maker_username = quiz_session.quiz.user.username
            quiz_maker_avatar = quiz_session.quiz.user.avatar
            quiz_maker_id = quiz_session.quiz.user.id


    return jsonify({
        'code': quiz_session.code,
        'quiz_id': quiz_session.quiz_id,
        'quiz_name': quiz_name,
        'host_id': quiz_session.host_id,
        'host_username': host_username,
        'started': quiz_session.started,
        'created_at': quiz_session.created_at.isoformat(),
        'num_teams': quiz_session.num_teams,
        'is_team_mode': quiz_session.is_team_mode,
        'quiz_maker_username': quiz_maker_username, # NIEUW
        'quiz_maker_avatar': quiz_maker_avatar,     # NIEUW
        'quiz_maker_id': quiz_maker_id              # NIEUW (optioneel, voor link naar profiel)
    }), 200


@main_bp.route('/sessions/<string:code>/participants', methods=['GET'])
def get_participants(code):
    """Gets the list of participants in a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participants_data = []
    for p in quiz_session.participants:
        if p.user:
            participants_data.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'avatar': p.user.avatar,
                'team_number': p.team_number,
                'score': p.score
            })
        else:
            print(f"Warning: Participant record {p.id} in session {code} has no associated user.")

    return jsonify(participants_data), 200


@main_bp.route('/sessions/<string:code>/submit-score', methods=['POST'])
def submit_score(code):
    """Submits the score for a participant in a session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    data = request.get_json()
    score_req = data.get('score')

    if score_req is None:
        return jsonify({'error': 'Score is required'}), 400

    try:
        score = float(score_req)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid score format'}), 400

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participant = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=user_id
    ).first()

    if not participant:
        return jsonify({'error': 'You are not part of this session'}), 403

    try:
        participant.score = score
        db.session.commit()
        print(f'Score {score} submitted for user {user_id} in session {code}')
        return jsonify({'message': 'Score submitted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error submitting score for user {user_id}, session {code}: {e}")
        return jsonify({'error': 'Could not submit score'}), 500


@main_bp.route('/sessions/<string:code>/results', methods=['GET'])
def get_session_results(code):
    """Gets the final results/scores for a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participants = SessionParticipant.query.filter_by(
        session_id=quiz_session.id
    ).order_by(SessionParticipant.score.desc()).all()

    results = []
    for p in participants:
        if p.user:
            results.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'avatar': p.user.avatar,
                'score': p.score,
                'team_number': p.team_number
            })
    return jsonify(results), 200


@main_bp.route('/simulate/<int:quiz_id>', methods=['GET'])
def simulate_session(quiz_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    questions_data = []
    for question in quiz.questions:
        q_data = {
            'id': question.id,
            'type': question.question_type,
            'text': question.question_text
        }
        if hasattr(question, 'options'):
            q_data['options'] = [{'id': opt.id, 'text': opt.text} for opt in question.options]
            correct_option = next((opt for opt in question.options if opt.is_correct), None)
            q_data['correct_option_id'] = correct_option.id if correct_option else None
            q_data['correct_answer_text'] = correct_option.text if correct_option else None
        elif hasattr(question, 'min_value'):
            q_data.update({
                'min': question.min_value, 'max': question.max_value,
                'step': question.step, 'correct_value': question.correct_value
            })
        elif hasattr(question, 'max_length'):
            q_data.update({
                'max_length': question.max_length, 'correct_answer': question.correct_answer
            })
        questions_data.append(q_data)

    return jsonify({
        'quiz_id': quiz.id,
        'quiz_name': quiz.name,
        'questions': questions_data
    }), 200


def create_app():
    from .init_flask import create_app as flask_create_app
    app = flask_create_app()
    return app
```

## src/backend/__init__.py

```

```

## src/backend/tests/test_app.py

```
import pytest
from werkzeug.security import generate_password_hash

from src.backend.Questions import SliderQuestion, TextInputQuestion
from src.backend.init_flask import create_app, db
from src.backend.config import TestConfig
from src.backend.app import User, Quiz

@pytest.fixture
def app():
    """Create and configure a new app instance for testing."""
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()  # Forceer tabel creatie
    yield app
    with app.app_context():
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


def test_signup_success(client, app):
    # 1) Verstuur POST /signup
    response = client.post('/signup', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Gebruiker testuser geregistreerd'

    # 2) Check in DB
    with app.app_context():
        user_in_db = User.query.filter_by(username='testuser').first()
        assert user_in_db is not None
        # Niet plaintext
        assert user_in_db.password_hash != 'testpassword'
        # Check dat het ofwel scrypt ofwel pbkdf2 is
        valid_prefixes = ('scrypt:', 'pbkdf2:')
        assert user_in_db.password_hash.startswith(valid_prefixes)


def test_signup_duplicate_username(client, app):
    # Maak user in DB
    with app.app_context():
        user = User(username='dupeuser',
                    password_hash=generate_password_hash('somepassword'))
        db.session.add(user)
        db.session.commit()

    response = client.post('/signup', json={
        'username': 'dupeuser',
        'password': 'anderewachtwoord'
    })
    assert response.status_code == 409
    data = response.get_json()
    assert 'Gebruikersnaam bestaat al' in data['error']


def test_login_success(client, app):
    # Vooraf user in DB + onthoud ID als int
    with app.app_context():
        user = User(username='loginuser',
                    password_hash=generate_password_hash('mypassword'))
        db.session.add(user)
        db.session.commit()
        created_user_id = user.id

    # Inloggen
    response = client.post('/login', json={
        'username': 'loginuser',
        'password': 'mypassword'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'Ingelogd als loginuser' in data['message']

    # Check session
    with client.session_transaction() as sess:
        # Vergelijk met de integer, zodat we user niet opnieuw hoeven aan te roepen
        assert sess['user_id'] == created_user_id
        assert sess['username'] == 'loginuser'


def test_login_invalid(client, app):
    response = client.post('/login', json={
        'username': 'nietbestaat',
        'password': 'foutpw'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'Ongeldige login' in data['error']


def test_home_protected(client, app):
    # Oningelogd => 401
    resp_unauth = client.get('/home')
    assert resp_unauth.status_code == 401
    assert resp_unauth.get_json()['error'] == 'Niet gemachtigd'

    # Maak user en login
    with app.app_context():
        user = User(username='homeuser',
                    password_hash=generate_password_hash('secret'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'homeuser','password': 'secret'})

    resp_home = client.get('/home')
    assert resp_home.status_code == 200
    data_home = resp_home.get_json()
    assert 'Welkom, homeuser!' in data_home['message']


def test_logout(client, app):
    with app.app_context():
        user = User(username='logoutuser',
                    password_hash=generate_password_hash('secret'))
        db.session.add(user)
        db.session.commit()

    # Inloggen
    login_resp = client.post('/login', json={
        'username': 'logoutuser',
        'password': 'secret'
    })
    assert login_resp.status_code == 200

    # Logout
    logout_resp = client.post('/logout')
    assert logout_resp.status_code == 200
    data = logout_resp.get_json()
    assert data['message'] == 'Uitgelogd'

    with client.session_transaction() as sess:
        assert 'user_id' not in sess
        assert 'username' not in sess


def test_get_user_quizzes_unauthenticated(client):
    response = client.get('/quizzes')
    assert response.status_code == 401
    assert response.json['error'] == 'Niet ingelogd'


def test_get_user_quizzes_empty(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get('/quizzes')
    assert response.status_code == 200
    assert response.json == []


def test_get_user_quizzes_with_data(client, app):
    with app.app_context():
        # Eerst user committen
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()  # Explicit commit

        # Nu quiz aanmaken met geldige user_id
        quiz = Quiz(user_id=user.id, name='Test Quiz')
        question = TextInputQuestion(
            quiz=quiz,
            question_text='Test Question',
            max_length=255,
            correct_answer='Answer'
        )
        db.session.add_all([quiz, question])
        db.session.commit()  # Opnieuw committen

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get('/quizzes')
    data = response.json

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['name'] == 'Test Quiz'

def test_create_quiz_unauthenticated(client):
    response = client.post('/quiz', json={'name': 'New Quiz'})
    assert response.status_code == 401


def test_create_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})

    quiz_data = {
        'name': 'New Quiz',
        'questions': [{
            'type': 'multiple_choice',
            'text': 'MC Question',
            'options': [
                {'text': 'Option 1', 'isCorrect': False},
                {'text': 'Option 2', 'isCorrect': True}
            ]
        }]
    }

    response = client.post('/quiz', json=quiz_data)
    assert response.status_code == 201

    with app.app_context():
        quiz = Quiz.query.first()
        assert quiz.name == 'New Quiz'
        assert len(quiz.questions) == 1
        assert quiz.questions[0].question_type == 'multiple_choice'
        assert len(quiz.questions[0].options) == 2


def test_get_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        quiz = Quiz(user_id=user.id, name='Test Quiz')
        question = SliderQuestion(
            quiz=quiz,
            question_text='Slider Question',
            min_value=0,
            max_value=100,
            correct_value=50
        )
        db.session.add_all([quiz, question])
        db.session.commit()
        quiz_id = quiz.id  # ID opslaan terwijl de sessie actief is

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get(f'/quizzes/{quiz_id}')
    data = response.json

    assert response.status_code == 200
    assert data['name'] == 'Test Quiz'


def test_profile_operations(client, app):
    # Test GET profile
    with app.app_context():
        user = User(
            username='profileuser',
            password_hash=generate_password_hash('testpass'),
            bio='Original bio',
            avatar=3
        )
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'profileuser', 'password': 'testpass'})

    # Get profile
    response = client.get('/profile')
    assert response.status_code == 200
    assert response.json['avatar'] == 3

    # Update profile
    update_data = {
        'username': 'newusername',
        'bio': 'Updated bio',
        'avatar': 5
    }
    response = client.post('/profile', json=update_data)
    assert response.status_code == 200

    with app.app_context():
        updated_user = User.query.first()
        assert updated_user.username == 'newusername'
        assert updated_user.avatar == 5


def test_delete_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        quiz = Quiz(user_id=user.id, name='To Delete')
        db.session.add(quiz)
        db.session.commit()
        quiz_id = quiz.id  # ID opslaan binnen sessie context

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.delete(f'/quizzes/{quiz_id}')
    assert response.status_code == 200

    with app.app_context():
        assert db.session.get(Quiz, quiz_id) is None


def test_update_quiz_success(client, app):
    with app.app_context():
        # User opslaan en committen
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        # Quiz aanmaken
        quiz = Quiz(user_id=user.id, name='Old Name')
        db.session.add(quiz)
        db.session.commit()

        # Quiz ID direct uit database halen
        quiz_id = quiz.id

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})

    update_data = {
        'name': 'Updated Name',
        'questions': [{
            'type': 'text_input',
            'text': 'New Question',
            'max_length': 500,
            'correct_answer': 'Correct'
        }]
    }

    response = client.put(f'/quizzes/{quiz_id}', json=update_data)
    assert response.status_code == 200

    with app.app_context():
        updated_quiz = db.session.get(Quiz, quiz_id)
        assert updated_quiz.name == 'Updated Name'

def test_duplicate_username_update(client, app):
    with app.app_context():
        user1 = User(username='user1', password_hash=generate_password_hash('pass1'))
        user2 = User(username='user2', password_hash=generate_password_hash('pass2'))
        db.session.add_all([user1, user2])
        db.session.commit()

    client.post('/login', json={'username': 'user1', 'password': 'pass1'})
    response = client.post('/profile', json={'username': 'user2'})
    assert response.status_code == 409
```

## src/backend/tests/__init__.py

```

```

## script/MarkDownMaker.py

```
import os
import json


def generate_tree_markdown(directory, ignored_dirs, indent=""):
    tree = ""
    items = sorted(os.listdir(directory))
    for index, item in enumerate(items):
        item_path = os.path.join(directory, item)
        is_last = (index == len(items) - 1)
        prefix = "└── " if is_last else "├── "

        if os.path.isdir(item_path):
            if any(os.path.commonpath([item_path]).startswith(ignored) for ignored in ignored_dirs):
                continue
            tree += f"{indent}{prefix}{item}/\n"
            tree += generate_tree_markdown(item_path, ignored_dirs, indent + ("    " if is_last else "│   "))
        else:
            tree += f"{indent}{prefix}{item}\n"
    return tree


def extract_files_with_extension(directory, extensions, ignored_dirs):
    files = []
    for root, _, filenames in os.walk(directory):
        if any(os.path.commonpath([root]).startswith(ignored) for ignored in ignored_dirs):
            continue
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    return files


def generate_markdown_output(directory, extensions, ignored_dirs, output_file="output.md"):
    markdown_content = f"# File Structure of {directory}\n\n"
    markdown_content += "```\n" + generate_tree_markdown(directory, ignored_dirs) + "```\n\n"

    files = extract_files_with_extension(directory, extensions, ignored_dirs)

    for file_path in files:
        relative_path = os.path.relpath(file_path, directory)
        markdown_content += f"## {relative_path}\n\n```\n"
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            markdown_content += content + "\n```\n\n"
        except Exception as e:
            markdown_content += f"Error reading file: {e}\n\n```\n\n"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    print(f"Markdown output saved to {output_file}")


if __name__ == "__main__":
    config_file = input("Enter the path to the configuration JSON file: ").strip()

    try:
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)

        folder = config.get("folder", "").strip()
        extensions = config.get("extensions", [])
        ignored_dirs = config.get("ignored_dirs", [])
        output_file = config.get("output_file", "output.md")

        if not os.path.isdir(folder):
            print("Invalid folder path. Please enter a valid directory.")
        else:
            generate_markdown_output(folder, extensions, ignored_dirs, output_file)
    except Exception as e:
        print(f"Error reading config file: {e}")

```

