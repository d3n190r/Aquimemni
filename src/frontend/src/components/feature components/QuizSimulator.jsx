// src/frontend/src/components/feature components/QuizSimulator.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

// ***** Accepteer nu ook sessionCode als prop *****
function QuizSimulator({ quizId: quizIdProp, sessionCode: sessionCodeProp }) {
  // Get ID from URL params as a fallback (blijft hetzelfde)
  const { quizId: quizIdFromParams } = useParams();
  // Determine the actual quiz ID (blijft hetzelfde)
  const quizIdToUse = quizIdProp ?? quizIdFromParams;

  // --- State ---
  const [searchParams] = useSearchParams(); // Blijf deze gebruiken voor 'showResults'

  // ***** Gebruik de prop ALS EERSTE, val terug op searchParams indien nodig *****
  const sessionCode = sessionCodeProp ?? searchParams.get('session');
  // ****************************************************************************

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
  const isMountedRef = useRef(true); // Track mount status

  // Initial Debug log (runs once on mount/prop change)
  console.log(`[QuizSimulator Initial] ID: ${quizIdToUse}, Session (Prop): ${sessionCodeProp}, Session (URL): ${searchParams.get('session')}, Final Session Used: ${sessionCode}`);

  // --- Callbacks ---
  const submitSessionScore = useCallback(async (finalScore) => {
    // Gebruik de 'sessionCode' variabele die hierboven is bepaald
    if (!sessionCode || !isMountedRef.current) return;
    console.log(`QuizSimulator: Submitting score ${finalScore} for session ${sessionCode}`);
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
        console.log("Score submitted successfully.");
      }
    } catch (err) {
        if (isMountedRef.current) {
            console.error('Network error submitting score:', err);
        }
    }
  }, [sessionCode]); // Nu afhankelijk van de 'sessionCode' variabele

  const handleNext = useCallback(() => {
    if (!isMountedRef.current) return;

    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }

    const currentQ = quiz?.questions?.[currentQuestion];

    if (!quiz || !currentQ) {
      console.warn("handleNext called without quiz or current question data.");
      if(isMountedRef.current) setShowScore(true); // Set showScore if mounted
      submitSessionScore(score); // Submit huidige score
      return;
    }

    let answerResult = "Wrong";
    const currentAnswer = selectedAnswers[currentQuestion];
    let pointsEarned = 0;

    // Evaluation Logic
    if (currentQ.type === 'multiple_choice') {
      const correctOptionId = currentQ.correct_option_id;
      const selectedOptionId = currentQ.options?.[currentAnswer]?.id;
      if (selectedOptionId !== undefined && selectedOptionId === correctOptionId) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    } else if (currentQ.type === 'text_input') {
      const userText = String(currentAnswer ?? '').trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      if (userText !== '' && userText === correctText) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    } else if (currentQ.type === 'slider') {
      if (Number(currentAnswer) === Number(currentQ.correct_value)) {
        answerResult = "Correct";
        pointsEarned = 1;
      }
    }

    if (isMountedRef.current) {
        setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
        const newScore = score + pointsEarned;
        setScore(newScore); // Update score state

        const nextQuestionIndex = currentQuestion + 1;
        if (nextQuestionIndex < quiz.questions.length) {
            setCurrentQuestion(nextQuestionIndex);
            setTimeLeft(15); // Reset timer
        } else {
            setShowScore(true); // Show score screen
            submitSessionScore(newScore); // Submit final calculated score
        }
    }
  }, [quiz, currentQuestion, selectedAnswers, score, submitSessionScore]); // Dependencies

  // --- Effects ---
  useEffect(() => {
      isMountedRef.current = true;
      console.log("[QuizSimulator Mounted]");
      return () => {
          console.log("[QuizSimulator Unmounting]");
          isMountedRef.current = false;
          if (timerId.current) {
              clearInterval(timerId.current);
              timerId.current = null;
              console.log("  Timer cleared on unmount.");
          }
      };
  }, []); // Mount/Unmount effect

  useEffect(() => {
    // Start timer only if component is mounted and conditions met
    if (!showScore && quiz?.questions?.length > 0 && quizIdToUse && isMountedRef.current) {
        console.log("[QuizSimulator Timer Effect] Starting timer for question:", currentQuestion);
        timerId.current = setInterval(() => {
            if (!isMountedRef.current) { // Check mount status inside interval
                if (timerId.current) clearInterval(timerId.current);
                return;
            }
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    console.log("[QuizSimulator Timer Effect] Timer expired, calling handleNext.");
                     handleNext(); // handleNext checks mount status internally
                    return 15; // Reset for next question (or doesn't matter if quiz ends)
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup function for this effect
        return () => {
            console.log("[QuizSimulator Timer Effect] Cleanup for question:", currentQuestion);
            if (timerId.current) {
                clearInterval(timerId.current);
                timerId.current = null;
            }
        };
    } else {
       // Ensure timer is cleared if conditions are not met or score is shown
       console.log("[QuizSimulator Timer Effect] Conditions not met or score shown, timer stopped/not started.", { showScore, hasQuestions: quiz?.questions?.length > 0, quizIdToUse });
       if (timerId.current) {
           clearInterval(timerId.current);
           timerId.current = null;
        }
    }
  }, [currentQuestion, showScore, quiz, quizIdToUse, handleNext]); // Dependencies for timer


  useEffect(() => {
    // Fetch quiz data
    const fetchQuiz = async () => {
      if (!quizIdToUse) {
        console.error("[QuizSimulator Data Fetch] No Quiz ID available.");
        if (isMountedRef.current) setLoading(false);
        return;
      }

      console.log(`[QuizSimulator Data Fetch] Fetching simulation data for ID: ${quizIdToUse}`);
      if (isMountedRef.current) setLoading(true);
      try {
        // Use the /simulate endpoint to get data including correct answers
        const response = await fetch(`/api/simulate/${quizIdToUse}`, { credentials: 'include' });
        if (!isMountedRef.current) return; // Check mount after await

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Quiz simulation fetch failed (ID: ${quizIdToUse}, Status: ${response.status})`);
        }
        const data = await response.json();
        console.log("[QuizSimulator Data Fetch] Simulation data fetched successfully.");

        if (isMountedRef.current) {
             setQuiz(data); // Set quiz data
             // Reset state for a new simulation/quiz
             setCurrentQuestion(0);
             setScore(0);
             setSelectedAnswers([]);
             setAnswerStatus([]);
             setTimeLeft(15);

             // Check if we should immediately show results based on URL param
             const showResultsParam = searchParams.get('showResults') === 'true';
             console.log(`[QuizSimulator Data Fetch] showResults param: ${showResultsParam}`);
             setShowScore(showResultsParam); // Set state accordingly
             if (showResultsParam) {
                 console.log("[QuizSimulator Data Fetch] Set showScore=true based on URL param.");
             }
         }
      } catch (err) {
        console.error('[QuizSimulator Data Fetch] Error:', err.message);
        if (isMountedRef.current) setQuiz(null); // Clear quiz data on error
      } finally {
        if (isMountedRef.current) setLoading(false); // Stop loading indicator
      }
    };

    fetchQuiz();
  }, [quizIdToUse, searchParams]); // Re-fetch if ID or searchParams change


  useEffect(() => {
    // Set default answer values when the question changes, only if no answer exists yet
    if (quiz && quiz.questions && quiz.questions[currentQuestion] && isMountedRef.current) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
          // Only update if the answer for the current index is undefined
          if (typeof prev[currentQuestion] === 'undefined') {
              const newAnswers = [...prev]; // Create a mutable copy
              if (currentQ.type === 'slider') {
                  newAnswers[currentQuestion] = currentQ.min ?? 0; // Default to min value
              } else if (currentQ.type === 'text_input') {
                  newAnswers[currentQuestion] = ''; // Default to empty string
              }
              // For multiple choice, undefined is the desired initial state (no selection)
              console.log(`[QuizSimulator Default Answer] Set default for Q${currentQuestion} (Type: ${currentQ.type})`);
              return newAnswers; // Return the updated array
          }
          return prev; // Return the original array if an answer already exists
      });
    }
  }, [currentQuestion, quiz]); // Dependencies: run when question or quiz data changes


  // Function to format time
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Helper to get the text of the user's answer for the results screen
  const getUserAnswerText = (question, index) => {
      const answerValue = selectedAnswers[index];
      if (typeof answerValue === 'undefined') return 'No answer given';

      if (question.type === 'multiple_choice') {
          return question.options?.[answerValue]?.text ?? 'Invalid option index';
      }
      return String(answerValue);
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Failed to load quiz data (ID: {quizIdToUse || 'None Provided'}).
        </div>
        <Link to="/my-quizzes" className="btn btn-primary">Go to My Quizzes</Link>
      </div>
    );
  }

  // --- Debug Logs before return ---
  console.log("-------------------------------------");
  console.log("[QuizSimulator Render Check]");
  console.log(`  quizIdToUse: ${quizIdToUse} (Type: ${typeof quizIdToUse})`);
  console.log(`  sessionCode (Prop): ${sessionCodeProp}`);
  console.log(`  sessionCode (URL): ${searchParams.get('session')}`);
  console.log(`  sessionCode (Final Used): ${sessionCode} (Type: ${typeof sessionCode})`);
  console.log(`  Condition (sessionCode && quizIdToUse): ${!!(sessionCode && quizIdToUse)}`);
  console.log(`  showScore state: ${showScore}`);
  console.log("-------------------------------------");
  // --- End Debug Logs ---


  // --- Main Component Return JSX ---
  return (
    <div className="container quiz-container mt-4">
       {/* Navigation Links */}
       <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/my-quizzes')}>
          ← Back to My Quizzes
        </button>
        {/* --- KNOP TERUGGEZET --- */}
        <Link to="/home" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      {showScore ? (
        // --- Score Screen ---
         <div className="quiz-results">
          <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
            <h2 className="mb-3">🎉 Simulation Complete! 🎉</h2>
            <div className="score-display bg-white p-3 rounded-pill shadow">
              <span className="display-2 fw-bold text-dark">{score}</span>
              <span className="fs-3 text-muted">/{quiz.questions.length}</span>
            </div>

            {/* ***** Action Buttons - Use the 'sessionCode' variable ***** */}
            <div className="mt-4 d-flex justify-content-center flex-wrap gap-2">
              {/* Retry button only if NOT in a session */}
              {!sessionCode && (
                <button
                  className="btn btn-light btn-lg"
                  onClick={() => {
                    if (!isMountedRef.current) return;
                    setCurrentQuestion(0); setScore(0); setShowScore(false);
                    setSelectedAnswers([]); setAnswerStatus([]); setTimeLeft(15);
                  }}
                >
                 <i className="bi bi-arrow-clockwise me-2"></i>Retry Quiz
                </button>
              )}

              {/* View Session Results Button - Condition uses 'sessionCode' */}
              {console.log("  Rendering score screen button check:", !!(sessionCode && quizIdToUse))}
              {sessionCode && quizIdToUse && (
                <button
                  className="btn btn-warning btn-lg"
                  onClick={() => navigate(`/session/${quizIdToUse}/results?session=${sessionCode}`)}
                  title="View scores of all participants" // Tooltip added
                >
                  <i className="bi bi-trophy-fill me-2"></i> View Session Results
                </button>
              )}

               {/* --- KNOP BLIJFT VERWIJDERD --- */}
            </div>
          </div>

            {/* Results Breakdown */}
            <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
                {quiz.questions.map((q, index) => {
                const isCorrect = answerStatus[index] === 'Correct';
                let correctAnswerText = 'N/A';
                // Get correct answer text/value from quiz data (provided by /simulate endpoint)
                if (q.type === 'multiple_choice') correctAnswerText = q.correct_answer_text ?? 'N/A';
                else if (q.type === 'text_input') correctAnswerText = q.correct_answer ?? 'N/A';
                else if (q.type === 'slider') correctAnswerText = q.correct_value?.toString() ?? 'N/A';

                return (
                    <div className="col" key={index}>
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
                                <p className="text-success mb-1">
                                <strong>Correct Answer:</strong> {correctAnswerText}
                                </p>
                                {!isCorrect && (
                                <p className="text-danger mb-0">
                                    <strong>Your Answer:</strong> {getUserAnswerText(q, index)}
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
        // --- Question Screen ---
        // (No functional changes needed here based on the prop change)
        <div>
            {/* Question Header */}
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
                    className="w-100 progress"
                    value={timeLeft}
                    max="15"
                    style={{ height: '5px' }}
                />
            </div>

            {/* Question Text */}
            <h4 className="mb-4">{quiz.questions[currentQuestion]?.text || 'Loading question...'}</h4>

            {/* Answer Input Area */}
            {quiz.questions[currentQuestion]?.type === 'multiple_choice' && (
                <div className="options-grid">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            if (timeLeft > 0 && isMountedRef.current) {
                                setSelectedAnswers(prev => {
                                    const newAnswers = [...prev];
                                    newAnswers[currentQuestion] = index;
                                    return newAnswers;
                                });
                            }
                        }}
                        className={`option-button btn btn-lg btn-outline-primary w-100 d-block text-start p-3 mb-2 ${selectedAnswers[currentQuestion] === index ? 'active' : ''} ${timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id ? 'correct-answer' : ''}`}
                        disabled={timeLeft === 0}
                    >
                    {option.text}
                    {timeLeft === 0 && option.id === quiz.questions[currentQuestion].correct_option_id && ( <span className="correct-badge float-end fs-4 text-success">✓</span> )}
                    </button>
                ))}
                </div>
            )}

            {quiz.questions[currentQuestion]?.type === 'text_input' && (
                <div className="mb-3">
                    <label htmlFor="textAnswer" className="form-label fs-5">Your Answer:</label>
                    <input
                        type="text"
                        id="textAnswer"
                        className="form-control form-control-lg"
                        value={selectedAnswers[currentQuestion] || ''}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = e.target.value; return na; }); } }}
                        maxLength={quiz.questions[currentQuestion].max_length || 255}
                        disabled={timeLeft === 0}
                    />
                    <div className="form-text">Max length: {quiz.questions[currentQuestion].max_length || 255} characters.</div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Answer: {quiz.questions[currentQuestion].correct_answer}</div> )}
                </div>
            )}

            {quiz.questions[currentQuestion]?.type === 'slider' && (
                <div className="mb-3">
                    <label htmlFor="sliderAnswer" className="form-label fs-5 d-block"> Your Selection: <strong className="text-primary">{selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}</strong></label>
                    <input
                        type="range"
                        id="sliderAnswer"
                        className="form-range"
                        min={quiz.questions[currentQuestion].min}
                        max={quiz.questions[currentQuestion].max}
                        step={quiz.questions[currentQuestion].step}
                        value={selectedAnswers[currentQuestion] ?? quiz.questions[currentQuestion].min ?? 0}
                        onChange={(e) => { if (timeLeft > 0 && isMountedRef.current) { setSelectedAnswers(prev => { const na = [...prev]; na[currentQuestion] = parseInt(e.target.value, 10); return na; }); } }}
                        disabled={timeLeft === 0}
                        style={{ height: '1.5rem' }}
                    />
                    <div className="d-flex justify-content-between text-muted"><span>{quiz.questions[currentQuestion].min}</span><span>{quiz.questions[currentQuestion].max}</span></div>
                    {timeLeft === 0 && ( <div className="alert alert-success mt-2">Correct Value: {quiz.questions[currentQuestion].correct_value}</div>)}
                </div>
            )}

            {/* Next Button */}
            <div className="mt-4 text-end">
                <button
                className="btn btn-primary btn-lg px-5"
                onClick={handleNext}
                disabled={ timeLeft === 0 || (timeLeft > 0 && quiz.questions[currentQuestion]?.type !== 'text_input' && typeof selectedAnswers[currentQuestion] === 'undefined') }
                >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish Simulation' : 'Next Question →'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default QuizSimulator;