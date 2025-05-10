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