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
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const navigate = useNavigate();
  const [answerStatus, setAnswerStatus] = useState([]);

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
        navigate('/my-quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  // Initialize default answers
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        if (typeof newAnswers[currentQuestion] === 'undefined') {
          if (currentQ.type === 'slider') {
            newAnswers[currentQuestion] = currentQ.min;
          } else if (currentQ.type === 'text_input') {
            newAnswers[currentQuestion] = '';
          }
        }
        return newAnswers;
      });
    }
  }, [currentQuestion, quiz]);

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    const currentQ = quiz.questions[currentQuestion];
    let answerResult = "Wrong";
    const currentAnswer = selectedAnswers[currentQuestion];

    if (currentQ.type === 'multiple_choice') {
      const correctIndex = currentQ.options.findIndex(opt => opt.is_correct);
      if (currentAnswer === correctIndex) {
        answerResult = "Correct";
        setScore(prev => prev + 1);
      }
    } else if (currentQ.type === 'text_input') {
      const userText = String(currentAnswer).trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      if (userText === correctText && userText !== '') {
        answerResult = "Correct";
        setScore(prev => prev + 1);
      }
    } else if (currentQ.type === 'slider') {
      if (Number(currentAnswer) === Number(currentQ.correct_value)) {
        answerResult = "Correct";
        setScore(prev => prev + 1);
      }
    }

    setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
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

  const getUserAnswer = (question, index) => {
    if (answerStatus[index] === 'Correct') return '-';
    const answer = selectedAnswers[index];

    if (question.type === 'multiple_choice') {
      return typeof answer !== 'undefined'
        ? question.options[answer]?.text
        : 'No answer selected';
    }
    return typeof answer !== 'undefined' ? answer : 'No answer given';
  };

  return (
    <div className="container quiz-container mt-4">
      <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/my-quizzes')}>
          ← Back to My Quizzes
        </button>
        <Link to="/home" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      {showScore ? (
        <div className="quiz-results">
          <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
            <h2 className="mb-3">🎉 Simulation Complete! 🎉</h2>
            <div className="score-display bg-white p-3 rounded-pill shadow">
              <span className="display-2 fw-bold text-dark">{score}</span>
              <span className="fs-3 text-muted">/{quiz.questions.length}</span>
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
                onClick={() => navigate('/my-quizzes')}
              >
                🏠 Back to My Quizzes
              </button>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
            {quiz.questions.map((q, index) => {
              const isCorrect = answerStatus[index] === 'Correct';
              const correctAnswer = q.type === 'multiple_choice'
                ? q.options.find(opt => opt.is_correct)?.text
                : q.type === 'text_input'
                ? q.correct_answer
                : q.correct_value;

              return (
                <div className="col" key={index}>
                  <div className={`card h-100 shadow-sm ${isCorrect ? 'border-success' : 'border-danger'}`}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span>Question {index + 1}</span>
                      <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                        {answerStatus[index]} {isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{q.text}</h5>
                      <div className="mt-3">
                        <p className="text-success mb-1">
                          <strong>Correct Answer:</strong> {correctAnswer}
                        </p>
                        {!isCorrect && (
                          <p className="text-danger mb-0">
                            <strong>Your Answer:</strong> {getUserAnswer(q, index)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

          {currentQ.type === 'multiple_choice' && (
            <div className="options-grid">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswers(prev => {
                    const newAnswers = [...prev];
                    newAnswers[currentQuestion] = index;
                    return newAnswers;
                  })}
                  className={`option-button btn btn-outline-primary
                    ${selectedAnswers[currentQuestion] === index ? 'active' : ''}
                    ${timeLeft === 0 && option.is_correct ? 'correct-answer' : ''}`}
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

          {currentQ.type === 'text_input' && (
            <div className="mb-3">
              <label htmlFor="textAnswer" className="form-label">Your Answer:</label>
              <input
                type="text"
                id="textAnswer"
                className="form-control"
                value={selectedAnswers[currentQuestion] || ''}
                onChange={(e) => setSelectedAnswers(prev => {
                  const newAnswers = [...prev];
                  newAnswers[currentQuestion] = e.target.value;
                  return newAnswers;
                })}
                disabled={timeLeft === 0}
              />
            </div>
          )}

          {currentQ.type === 'slider' && (
            <div className="mb-3">
              <label htmlFor="sliderAnswer" className="form-label">
                Your Answer: {selectedAnswers[currentQuestion] ?? currentQ.min}
              </label>
              <input
                type="range"
                id="sliderAnswer"
                className="form-range"
                min={currentQ.min}
                max={currentQ.max}
                step={currentQ.step}
                value={selectedAnswers[currentQuestion] ?? currentQ.min}
                onChange={(e) => setSelectedAnswers(prev => {
                  const newAnswers = [...prev];
                  newAnswers[currentQuestion] = parseInt(e.target.value, 10);
                  return newAnswers;
                })}
                disabled={timeLeft === 0}
              />
            </div>
          )}

          <div className="mt-4 text-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={
                (typeof selectedAnswers[currentQuestion] === 'undefined' ||
                 selectedAnswers[currentQuestion] === '') &&
                timeLeft > 0
              }
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