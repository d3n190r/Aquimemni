// frontend/src/components/feature components/QuizSimulator.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams} from 'react-router-dom';

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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          credentials: 'include'
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

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex) => {
    if (timeLeft > 0) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleNext = () => {
    const currentQ = quiz.questions[currentQuestion];
    
    if (currentQ.type === 'multiple_choice' && 
        selectedAnswer === currentQ.options.findIndex(opt => opt.is_correct)) {
      setScore(score + 1);
    }

    setSelectedAnswer(null);
    setTimeLeft(15);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowScore(true);
    }
  };
  console.log(quiz);

  if (!quiz) return <div className="container mt-4">Loading simulation...</div>;
  if (loading) return <div className="container mt-4">Loading quiz...</div>;

  return (
    <div className="container quiz-container mt-4">
      <div className="mb-4">
        <button 
          className="btn btn-outline-secondary me-2"
          onClick={() => navigate('/quizzes')}
        >
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
            <progress
              className="w-100"
              value={timeLeft}
              max="15"
              style={{ height: '3px' }}
            />
          </div>

          <h4 className="mb-4">
            {quiz.questions[currentQuestion].text}
          </h4>

          {quiz.questions[currentQuestion].type === 'multiple_choice' && (
            <div className="options-grid">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`option-button btn btn-outline-primary ${
                    selectedAnswer === index ? 'active' : ''
                  } ${
                    timeLeft === 0 && option.is_correct 
                      ? 'correct-answer' 
                      : ''
                  }`}
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

          <div className="mt-4 text-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={selectedAnswer === null && timeLeft > 0}
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