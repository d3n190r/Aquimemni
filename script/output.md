# File Structure of /home/manaci4466/Aquimemni/src/frontend/src/components

```
├── Home components/
│   └── Home.js
├── Login.js
├── Quiz.js
├── Signup.js
├── Yilmaz.jsx
└── index.css
```

## Signup.js

```
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
      const response = await fetch('/api/signup', {
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

```

## Login.js

```
// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      if (response.ok) {
        onLogin && onLogin();
        navigate('/quiz');
      } else {
        const data = await response.json();
        setError(data.error || 'Inloggen mislukt');
      }
    } catch (err) {
      setError('Netwerkfout: Probeer opnieuw');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      {/* LOGO */}
      <div className="text-center">
        <img src="/logo.png" alt="App Logo" style={{ width: '150px', marginBottom: '20px' }} />
      </div>

      <h2 className="mb-4">Inloggen</h2>

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

        <button type="submit" className="btn btn-primary w-100">
          Inloggen
        </button>
      </form>

      {/* SIGNUP-KNOP */}
      <div className="text-center mt-3">
        <button
          type="button"
          className="btn btn-link"
          onClick={() => navigate('/signup')}
        >
          Signup
        </button>
      </div>
    </div>
  );
}

export default Login;

```

## index.css

```
/* Voeg dit toe aan je bestaande index.css */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.text-danger {
  animation: pulse 1s infinite;
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
```

## Quiz.js

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
import './index.css';

function Quiz({ onLogout }) {
  // State Management
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

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
      setSelectedAnswer(optionIndex);
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
    if (selectedAnswer === questions[currentQuestion]?.correct) {
      setScore(score + 1);
    }

    setSelectedAnswer(null);
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

  // Render logica
  if (questions.length === 0) {
    return <div className="container text-center mt-5">Loading questions...</div>;
  }

  return (
    <div className="container quiz-container" style={{ marginTop: '50px' }}>
      {!quizStarted ? (
        <div className="text-center">
          <h2>Welkom bij de Quiz!</h2>
          <p>{questions.length} vragen | 15 seconden per vraag</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
          >
            Start Quiz
          </button>
        </div>
      ) : showScore ? (
        <div className="alert alert-success text-center">
          <h3>Quiz Voltooid!</h3>
          <p className="display-4">
            Score: {score}/{questions.length}
          </p>
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
                  selectedAnswer === index ? 'active' : ''
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
              disabled={selectedAnswer === null && timeLeft > 0}
            >
              {currentQuestion === questions.length - 1
                ? 'Resultaten Bekijken'
                : 'Volgende Vraag →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;

```

## Home components/Home.js

```
// frontend/src/components/Home.js
import React from 'react'
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

```

