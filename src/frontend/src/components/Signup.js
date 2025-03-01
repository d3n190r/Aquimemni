// frontend/src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check of beide wachtwoorden gelijk zijn
    if (password !== password2) {
      setError('Wachtwoorden komen niet overeen!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.status === 201) {
        onSignup && onSignup();
        navigate('/login'); // Registratie klaar -> naar login
      } else {
        const data = await response.json();
        setError(data.error || 'Registreren mislukt');
      }
    } catch (err) {
      setError('Netwerkfout: Probeer opnieuw');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className="mb-4">Registreren</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Gebruikersnaam</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Wachtwoord</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bevestig wachtwoord</label>
          <input
            type="password"
            className="form-control"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">
          Account aanmaken
        </button>
      </form>

      {/* Terug naar inlogscherm */}
      <div className="text-center">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/login')}
        >
          Terug naar inlog
        </button>
      </div>
    </div>
  );
}

export default Signup;
