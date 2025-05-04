// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Trim whitespace before sending
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      // Basic check for empty fields after trimming
      if (!trimmedUsername || !trimmedPassword) {
        setError('Username and password are required.');
        return;
      }

      // Frontend length check (optional but good UX)
      // Note: Backend validation is generally recommended as well.
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
        // Use backend error message if available
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error: Please try again');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      {/* LOGO */}
      <div className="text-center">
        <img src="/logo.png" alt="App Logo" style={{ width: '150px', marginBottom: '20px' }} />
      </div>

      <h2 className="mb-4">Login</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            maxLength="32" // Username length limit
          />
        </div>

        {/* --- Password Field with Icon --- */}
        <div className="mb-3 position-relative"> {/* Keep parent relative */}
          <label className="form-label">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control" // Input field itself
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            maxLength="64" // Password length limit
            style={{ paddingRight: '3rem' }} // Add padding for the icon space
          />
          {/* Reveal Button - Positioned absolute within the relative parent */}
          <button
            type="button"
            className="btn btn-link position-absolute top-50 translate-middle-y" // Use top-50 and translate for vertical centering
            onClick={() => setShowPassword(!showPassword)}
            style={{
              right: '10px', // Position from the right edge
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              zIndex: 2 // Ensure button is clickable over input padding
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
        {/* --- End Password Field --- */}


        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>

      {/* SIGNUP BUTTON */}
      <div className="text-center mt-3">
        <button
          type="button"
          className="btn btn-link"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;