// src/frontend/src/components/feature components/QuizSimulator.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

function QuizSimulator({ quizId: quizIdProp, sessionCode: sessionCodeProp }) {
  const { quizId: quizIdFromParams } = useParams();
  const quizIdToUse = quizIdProp ?? quizIdFromParams;
  const [searchParams] = useSearchParams();
  const sessionCode = sessionCodeProp ?? searchParams.get('session');

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answerStatus, setAnswerStatus] = useState([]);
  const navigate = useNavigate();
  const timerId = useRef(null);
  const isMountedRef = useRef(true);

  const submitSessionScore = useCallback(async (finalScore) => {
    if (!sessionCode || !isMountedRef.current) return;
    try {
      const response = await fetch(`/api/sessions/${sessionCode}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: finalScore })
      });
      if (!isMountedRef.current) return;
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Failed to submit score:", errData.error || response.status);
      } else {
        console.log("Score submitted successfully for session:", sessionCode);
      }
    } catch (err) {
        if (isMountedRef.current) {
            console.error('Network error submitting score:', err);
        }
    }
  }, [sessionCode]);

  const handleNext = useCallback(() => {
    if (!isMountedRef.current) return;
    if (timerId.current) { clearInterval(timerId.current); timerId.current = null; }

    const currentQ = quiz?.questions?.[currentQuestion];
    if (!quiz || !currentQ) {
      if(isMountedRef.current) setShowScore(true);
      if(sessionCode) submitSessionScore(score); 
      return;
    }

    let answerResult = "Wrong"; let pointsEarned = 0;
    const currentAnswer = selectedAnswers[currentQuestion];

    if (currentQ.type === 'multiple_choice') {
      const correctOptionId = currentQ.correct_option_id;
      const selectedOptionId = currentQ.options?.[currentAnswer]?.id;
      if (selectedOptionId !== undefined && selectedOptionId === correctOptionId) {
        answerResult = "Correct"; pointsEarned = 1;
      }
    } else if (currentQ.type === 'text_input') {
      const userText = String(currentAnswer ?? '').trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      if (userText !== '' && userText === correctText) {
        answerResult = "Correct"; pointsEarned = 1;
      }
    } else if (currentQ.type === 'slider') {
      if (Number(currentAnswer) === Number(currentQ.correct_value)) {
        answerResult = "Correct"; pointsEarned = 1;
      }
    }

    if (isMountedRef.current) {
        setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
        const newScore = score + pointsEarned;
        setScore(newScore);

        const nextQuestionIndex = currentQuestion + 1;
        if (nextQuestionIndex < quiz.questions.length) {
            setCurrentQuestion(nextQuestionIndex);
            setTimeLeft(15);
        } else {
            setShowScore(true);
            if(sessionCode) submitSessionScore(newScore); 
        }
    }
  }, [quiz, currentQuestion, selectedAnswers, score, submitSessionScore, sessionCode]);

  useEffect(() => {
      isMountedRef.current = true;
      return () => { isMountedRef.current = false; if (timerId.current) clearInterval(timerId.current); };
  }, []);

  useEffect(() => {
    if (!showScore && quiz?.questions?.length > 0 && quizIdToUse && isMountedRef.current) {
        timerId.current = setInterval(() => {
            if (!isMountedRef.current) { if (timerId.current) clearInterval(timerId.current); return; }
            setTimeLeft((prev) => {
                if (prev <= 1) { handleNext(); return 15; }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerId.current) clearInterval(timerId.current); };
    } else {
       if (timerId.current) { clearInterval(timerId.current); timerId.current = null; }
    }
  }, [currentQuestion, showScore, quiz, quizIdToUse, handleNext]);


  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizIdToUse) { if (isMountedRef.current) setLoading(false); return; }
      if (isMountedRef.current) setLoading(true);
      try {
        const response = await fetch(`/api/simulate/${quizIdToUse}`, { credentials: 'include' });
        if (!isMountedRef.current) return;
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Quiz simulation fetch failed`);
        }
        const data = await response.json();
        if (isMountedRef.current) {
             setQuiz(data);
             setCurrentQuestion(0); setScore(0); setSelectedAnswers([]); setAnswerStatus([]); setTimeLeft(15);
             const showResultsParam = searchParams.get('showResults') === 'true';
             setShowScore(showResultsParam);
         }
      } catch (err) {
        if (isMountedRef.current) setQuiz(null);
        console.error('[QuizSimulator Data Fetch] Error:', err.message);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizIdToUse, searchParams]);


  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentQuestion] && isMountedRef.current) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
          if (typeof prev[currentQuestion] === 'undefined') {
              const newAnswers = [...prev];
              if (currentQ.type === 'slider') newAnswers[currentQuestion] = currentQ.min ?? 0;
              else if (currentQ.type === 'text_input') newAnswers[currentQuestion] = '';
              return newAnswers;
          }
          return prev;
      });
    }
  }, [currentQuestion, quiz]);


  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const getUserAnswerText = (question, index) => {
      const answerValue = selectedAnswers[index];
      if (typeof answerValue === 'undefined') return 'No answer given';
      if (question.type === 'multiple_choice') return question.options?.[answerValue]?.text ?? 'Invalid option index';
      return String(answerValue);
  };

  if (loading) return <div className="container mt-4 text-center"><div className="spinner-border text-primary"></div><p className="mt-2">Loading quiz...</p></div>;
  if (!quiz) return <div className="container mt-4"><div className="alert alert-danger">Failed to load quiz data.</div><Link to="/my-quizzes" className="btn btn-primary">Go to My Quizzes</Link></div>;

  return (
    <div className="container quiz-container mt-4">
       <div className="mb-4">
        {!sessionCode && (
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/my-quizzes')}>
            ← Back to My Quizzes
          </button>
        )}
        <Link to="/home" className="btn btn-outline-secondary">← Back to Home</Link>
      </div>

      {showScore ? (
         <div className="quiz-results">
          <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
            <h2 className="mb-3">🎉 {sessionCode ? "Quiz Finished!" : "Simulation Complete!"} 🎉</h2>
            <div className="score-display bg-white p-3 rounded-pill shadow">
              <span className="display-2 fw-bold text-dark">{score}</span>
              <span className="fs-3 text-muted">/{quiz.questions.length}</span>
            </div>
            <div className="mt-4 d-flex justify-content-center flex-wrap gap-2">
              {!sessionCode && (
                <button className="btn btn-light btn-lg" onClick={() => {
                    if (!isMountedRef.current) return;
                    setCurrentQuestion(0); setScore(0); setShowScore(false);
                    setSelectedAnswers([]); setAnswerStatus([]); setTimeLeft(15);}}>
                 <i className="bi bi-arrow-clockwise me-2"></i>Retry Quiz
                </button>
              )}
              {sessionCode && ( 
                <button className="btn btn-warning btn-lg" onClick={() => navigate(`/session/results/${sessionCode}`)} title="View scores of all participants">
                  <i className="bi bi-trophy-fill me-2"></i> View Session Results
                </button>
              )}
            </div>
          </div>
            <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
                {quiz.questions.map((q, index) => {
                const isCorrect = answerStatus[index] === 'Correct';
                let correctAnswerText = 'N/A';
                if (q.type === 'multiple_choice') correctAnswerText = q.correct_answer_text ?? 'N/A';
                else if (q.type === 'text_input') correctAnswerText = q.correct_answer ?? 'N/A';
                else if (q.type === 'slider') correctAnswerText = q.correct_value?.toString() ?? 'N/A';
                return (
                    <div className="col" key={q.id || index}>
                        <div className={`card h-100 shadow-sm ${isCorrect ? 'border-success' : 'border-danger'}`}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Question {index + 1}</span>
                            <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                                {answerStatus[index] || 'Not Answered'} {isCorrect ? '✓' : '✗'}
                            </span>
                            </div>
                            <div className="card-body">
                            <h5 className="card-title">{q.text}</h5>
                            <div className="mt-3">
                                <p className="text-success mb-1"><strong>Correct Answer:</strong> {correctAnswerText}</p>
                                {!isCorrect && (<p className="text-danger mb-0"><strong>Your Answer:</strong> {getUserAnswerText(q, index)}</p>)}
                            </div>
                            </div>
                        </div>
                    </div>);})}
            </div>
        </div>
      ) : (
        <div>
            <div className="quiz-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                <h3>Question {currentQuestion + 1}<span className="text-muted">/{quiz.questions.length}</span></h3>
                <div className="timer-display fs-4 text-danger">{formatTime(timeLeft)}</div>
                </div>
                <progress className="w-100 progress" value={timeLeft} max="15" style={{ height: '5px' }}/>
            </div>
            <h4 className="mb-4">{quiz.questions[currentQuestion]?.text || 'Loading question...'}</h4>
            {quiz.questions[currentQuestion]?.type === 'multiple_choice' && (
                <div className="options-grid">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button key={option.id} onClick={() => { if (timeLeft > 0 && isMountedRef.current) setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = index; return na; }); }}
                        className={`option-button btn btn-lg btn-outline-primary w-100 d-block text-start p-3 mb-2 ${selectedAnswers[currentQuestion] === index ? 'active' : ''} ${timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id ? 'correct-answer' : ''}`}
                        disabled={timeLeft === 0}>
                    {option.text}
                    {timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id && ( <span className="correct-badge float-end fs-4 text-success">✓</span> )}
                    </button>))}
                </div>)}
            {quiz.questions[currentQuestion]?.type === 'text_input' && (
                <div className="mb-3">
                    <label htmlFor="textAnswer" className="form-label fs-5">Your Answer:</label>
                    <input type="text" id="textAnswer" className="form-control form-control-lg" value={selectedAnswers[currentQuestion] || ''}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = e.target.value; return na; }); } }}
                        maxLength={quiz.questions[currentQuestion].max_length || 255} disabled={timeLeft === 0}/>
                    <div className="form-text">Max length: {quiz.questions[currentQuestion].max_length || 255} characters.</div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Answer: {quiz.questions[currentQuestion].correct_answer}</div> )}
                </div>)}
            {quiz.questions[currentQuestion]?.type === 'slider' && (
                <div className="mb-3">
                    <label htmlFor="sliderAnswer" className="form-label fs-5 d-block"> Your Selection: <strong className="text-primary">{selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}</strong></label>
                    <input type="range" id="sliderAnswer" className="form-range" min={quiz.questions[currentQuestion].min} max={quiz.questions[currentQuestion].max} step={quiz.questions[currentQuestion].step}
                        value={selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = parseInt(e.target.value, 10); return na; }); } }}
                        disabled={timeLeft === 0} style={{ height: '1.5rem' }}/>
                    <div className="d-flex justify-content-between text-muted"><span>{quiz.questions[currentQuestion].min}</span><span>{quiz.questions[currentQuestion].max}</span></div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Value: {quiz.questions[currentQuestion].correct_value}</div>)}
                </div>)}
            <div className="mt-4 text-end">
                <button className="btn btn-primary btn-lg px-5" onClick={handleNext}
                disabled={ timeLeft === 0 || (timeLeft > 0 && quiz.questions[currentQuestion]?.type !== 'text_input' && typeof selectedAnswers[currentQuestion] === 'undefined') }>
                {currentQuestion === quiz.questions.length - 1 ? (sessionCode ? 'Finish Quiz' : 'Finish Simulation') : 'Next Question →'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default QuizSimulator;