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
