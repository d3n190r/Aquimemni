// frontend/src/components/Home.js
/*import React from 'react'
import { useEffect, useState } from 'react';

function Home({ onLogout }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Bij laden van de component, haal een bericht op van de server (optioneel)
    const fetchMessage = async () => {
      try {
        const resp = await fetch('/api/home', { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          setMessage(data.message || '');
        } else {
          setMessage('Je bent niet (meer) ingelogd.');
        }
      } catch (err) {
        console.error('Error fetching home message', err);
      }
    };
    fetchMessage();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    // Verwijder eventuele lokale auth-status en navigeer terug naar login:
    onLogout && onLogout();
  };

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <h2>Home</h2>
      {message && <p>{message}</p>}
      <button className="btn btn-secondary" onClick={handleLogout}>
        Uitloggen
      </button>
    </div>
  );
}

export default Home;
*/
// frontend/src/components/Home.js
import React, { useEffect, useState } from 'react';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';
import { Main, StartQuizSection, HowItWorksSection, ActivitySection } from './Main';
import { useNavigate } from 'react-router-dom';

const Home = ({ onLogout }) => {
  const [message, setMessage] = useState('WELOME BACK!');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const resp = await fetch('/api/home', { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          setMessage(data.message || '');
        }
      } catch (err) {
        console.error('Error fetching home message', err);
      }
    };
    fetchMessage();
  }, []);

  const handleStartQuiz = () => navigate('/quiz');
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    onLogout?.();
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <NavigationSidebar />
      <Main>
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 text-primary">{'Welcome Back!' || message }</h1>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>

        <StartQuizSection onStart={handleStartQuiz} />
        <ActivitySection />
        <HowItWorksSection />
      </Main>
    </div>
  );
};

export default Home;