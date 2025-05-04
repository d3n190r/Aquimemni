// frontend/src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showPassword2, setShowPassword2] = useState(false); // State for confirm password visibility
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Trim whitespace before validation and sending
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedPassword2 = password2.trim();

    // Frontend length check (optional but good UX)
     if (trimmedUsername.length > 32) {
        setError('Username cannot exceed 32 characters.');
        return;
     }
     if (trimmedPassword.length > 64) {
        setError('Password cannot exceed 64 characters.');
        return;
     }
     // No need for password2 length check here, handled by equality check

    if (!trimmedUsername || !trimmedPassword || !trimmedPassword2) {
      setError('All fields are required.');
      return;
    }

    // Check if passwords match (after trimming)
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
        navigate('/login'); // Registration complete -> go to login
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
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className="mb-4">Sign Up</h2>
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

        {/* --- Password Field 1 with Icon (using Settings style) --- */}
        <div className="mb-3 position-relative"> {/* Parent relative */}
          <label className="form-label">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control" // Input field
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            maxLength="64" // Password length limit
            style={{ paddingRight: '3rem' }} // Padding for icon
          />
          {/* Reveal Button 1 */}
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
        {/* --- End Password Field 1 --- */}

        {/* --- Password Field 2 with Icon (using Settings style) --- */}
        <div className="mb-3 position-relative"> {/* Parent relative */}
          <label className="form-label">Confirm Password</label>
          <input
            type={showPassword2 ? 'text' : 'password'}
            className="form-control" // Input field
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            maxLength="64" // Password length limit
            style={{ paddingRight: '3rem' }} // Padding for icon
          />
          {/* Reveal Button 2 */}
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
            onClick={() => setShowPassword2(!showPassword2)}
            aria-label={showPassword2 ? "Hide password confirmation" : "Show password confirmation"}
          >
            <i className={`bi ${showPassword2 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
        {/* --- End Password Field 2 --- */}

        <button type="submit" className="btn btn-primary w-100 mb-3">
          Create Account
        </button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default Signup;