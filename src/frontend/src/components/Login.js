// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
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
            maxLength="32"
          />
        </div>
        {/* --- Password Field with Icon (Updated Position) --- */}
        <div className="mb-3 position-relative">
          <label className="form-label">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control pe-5" // Padding blijft belangrijk
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            maxLength="64"
          />
          {/* Reveal Button (Updated Position) */}
          <button
            type="button"
            // GEWIJZIGD: top-50 class weg, translate-middle-y weg uit class
            className="btn btn-link position-absolute end-0 d-inline-flex align-items-center justify-content-center p-0"
            onClick={() => setShowPassword(!showPassword)}
            // GEWIJZIGD: top en transform direct in style
            style={{
              width: '2.5rem',
              height: '2.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              top: '74%', // <<-- VERHOOG DEZE WAARDE (start met 55% - 60%)
              transform: 'translateY(-50%)', // <<-- Houd deze voor centering t.o.v. nieuwe top
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