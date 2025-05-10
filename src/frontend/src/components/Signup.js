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