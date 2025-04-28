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
// src/frontend/src/components/Home components/Home.js
import React, { useEffect } from 'react';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';
import {
  Main,
  JoinSessionSection,
  StartQuizSection,
  HowItWorksSection,
  ActivitySection
} from './Main';
import { useNavigate } from 'react-router-dom';

const Home = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/home', { credentials: 'include' });
      } catch (err) {
        console.error('Error fetching home message', err);
      }
    })();
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
        <div
          className="col-12 d-flex justify-content-between align-items-center mb-4"
          style={{ paddingTop: '20px' /* 20px naar beneden verschuiving */ }}
        >
          <h1 className="h3 mb-0 text-primary">Welcome Back!</h1>
        </div>

        <JoinSessionSection />
        <ActivitySection />
        <HowItWorksSection />
      </Main>
    </div>
  );
};

export default Home;
