// frontend/src/components/feature components/QuizSimulator.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function QuizSimulator() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (!showScore && quiz?.questions?.length > 0) {
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
  }, [currentQuestion, showScore, quiz]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Quiz not found');
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  // Initialize default antwoord voor slider en tekstinvoer als er een nieuwe vraag laadt
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const currentQ = quiz.questions[currentQuestion];
      if (currentQ.type === 'slider' && selectedAnswer === null) {
        setSelectedAnswer(currentQ.min);
      } else if (currentQ.type === 'text_input' && selectedAnswer === null) {
        setSelectedAnswer('');
      }
    }
  }, [currentQuestion, quiz, selectedAnswer]);

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    const currentQ = quiz.questions[currentQuestion];

    if (currentQ.type === 'multiple_choice') {
      // Zoek de index van het juiste antwoord
      const correctIndex = currentQ.options.findIndex(opt => opt.is_correct);
      if (selectedAnswer === correctIndex) {
        setScore(prev => prev + 1);
      }
    } else if (currentQ.type === 'text_input') {
      // Converteer beide antwoorden naar lower-case strings en trim spaties
      const userText = String(selectedAnswer).trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      if (userText === correctText && userText !== '') {
        setScore(prev => prev + 1);
      }
    } else if (currentQ.type === 'slider') {
      // Vergelijk de numerieke waarden
      if (Number(selectedAnswer) === Number(currentQ.correct_value)) {
        setScore(prev => prev + 1);
      }
    }

    // Reset geselecteerd antwoord en timer
    setSelectedAnswer(null);
    setTimeLeft(15);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  if (!quiz) return <div className="container mt-4">Loading simulation...</div>;
  if (loading) return <div className="container mt-4">Loading quiz...</div>;

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="container quiz-container mt-4">
      <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/quizzes')}>
          ← Back to My Quizzes
        </button>
        <Link to="/home" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      {showScore ? (
        <div className="alert alert-success text-center">
          <h3>Simulation Complete!</h3>
          <p className="display-4">
            Score: {score}/{quiz.questions.length}
          </p>
          <div className="mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setShowScore(false);
                setSelectedAnswer(null);
              }}
            >
              Retry Quiz
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="quiz-header mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h3>
                Question {currentQuestion + 1}
                <span className="text-muted">/{quiz.questions.length}</span>
              </h3>
              <div className="timer-display fs-4 text-danger">
                {formatTime(timeLeft)}
              </div>
            </div>
            <progress className="w-100" value={timeLeft} max="15" style={{ height: '3px' }} />
          </div>

          <h4 className="mb-4">{currentQ.text}</h4>

          {/* Multiple Choice */}
          {currentQ.type === 'multiple_choice' && (
            <div className="options-grid">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`option-button btn btn-outline-primary ${selectedAnswer === index ? 'active' : ''} ${timeLeft === 0 && option.is_correct ? 'correct-answer' : ''}`}
                  disabled={timeLeft === 0}
                >
                  {option.text}
                  {timeLeft === 0 && option.is_correct && (
                    <span className="correct-badge">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          {currentQ.type === 'text_input' && (
            <div className="mb-3">
              <label htmlFor="textAnswer" className="form-label">Your Answer:</label>
              <input
                type="text"
                id="textAnswer"
                className="form-control"
                value={selectedAnswer !== null ? selectedAnswer : ''}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={timeLeft === 0}
              />
            </div>
          )}

          {/* Slider */}
          {currentQ.type === 'slider' && (
            <div className="mb-3">
              <label htmlFor="sliderAnswer" className="form-label">
                Your Answer: {selectedAnswer !== null ? selectedAnswer : currentQ.min}
              </label>
              <input
                type="range"
                id="sliderAnswer"
                className="form-range"
                min={currentQ.min}
                max={currentQ.max}
                step={currentQ.step}
                value={selectedAnswer !== null ? selectedAnswer : currentQ.min}
                onChange={(e) => setSelectedAnswer(parseInt(e.target.value, 10))}
                disabled={timeLeft === 0}
              />
            </div>
          )}

          <div className="mt-4 text-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={(selectedAnswer === null || selectedAnswer === '') && timeLeft > 0}
            >
              {currentQuestion === quiz.questions.length - 1
                ? 'Finish Simulation'
                : 'Next Question →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizSimulator;