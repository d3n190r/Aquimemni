// src/frontend/src/components/feature components/QuizSimulator.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react'; // Import useCallback
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

// 1. Accept quizId as a prop
function QuizSimulator({ quizId: quizIdProp }) {
  // 2. Get ID from URL params as a fallback
  const { quizId: quizIdFromParams } = useParams();
  // 3. Determine the actual quiz ID to use, prioritizing the prop
  const quizIdToUse = quizIdProp ?? quizIdFromParams;

  // --- State ---
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  // const isHost = searchParams.get('isHost') === 'true'; // Likely not needed here

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

  // Debug log
  console.log(`QuizSimulator using ID: ${quizIdToUse} (Prop: ${quizIdProp}, Params: ${quizIdFromParams})`);

  // --- Callbacks (defined before useEffect hooks that use them) ---

  // Function to submit final score to the backend session
  const submitSessionScore = useCallback(async () => {
    // Use score from state directly inside useCallback
    if (!sessionCode) return;
    console.log(`QuizSimulator: Submitting score ${score} for session ${sessionCode}`);
    try {
      const response = await fetch(`/api/sessions/${sessionCode}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score }) // Pass the current score state
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Failed to submit score:", errData.error || response.status);
      } else {
        console.log("Score submitted successfully.");
      }
    } catch (err) {
      console.error('Network error submitting score:', err);
    }
    // Dependencies: sessionCode (stable if from params), score (state)
  }, [sessionCode, score]);

  // Function to handle moving to the next question or finishing
  // WRAPPED IN useCallback and defined BEFORE the timer useEffect
  const handleNext = useCallback(() => {
    if (timerId.current) { // Clear timer immediately
      clearInterval(timerId.current);
      timerId.current = null;
    }

    const currentQ = quiz?.questions?.[currentQuestion]; // Get current question safely

    if (!quiz || !currentQ) {
      console.warn("handleNext called without quiz or current question data.");
      setShowScore(true);
      submitSessionScore();
      return;
    }

    // Evaluate answer
    let answerResult = "Wrong";
    const currentAnswer = selectedAnswers[currentQuestion];
    let pointsEarned = 0;

    if (currentQ.type === 'multiple_choice') {
      const correctOptionIndex = currentQ.options?.findIndex(opt => opt.is_correct); // Safe navigation
      if (currentAnswer === correctOptionIndex) {
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

    setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
    // Update score based on points for *this* question
    setScore(prevScore => prevScore + pointsEarned);

    // Move to next question or finish
    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < quiz.questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      setTimeLeft(15); // Reset timer for the next question
    } else {
      setShowScore(true);
      // Submit score *after* the final score state has potentially been updated
      // We need to call submitSessionScore, but it uses the 'score' state.
      // Since state updates are async, the 'score' inside submitSessionScore
      // might not be the final one if called immediately.
      // Option 1: Rely on submitSessionScore having 'score' in its deps (done above).
      // Option 2: Pass the calculated final score directly (more complex).
      // Let's stick with Option 1 for now. submitSessionScore will be called
      // potentially in the next render cycle after score updates, or we ensure
      // it runs when showScore becomes true.
      // Let's call it here, assuming the dependency array handles the state update.
       submitSessionScore();
    }
    // Dependencies for handleNext
  }, [quiz, currentQuestion, selectedAnswers, submitSessionScore]); // Removed score, let submitSessionScore handle it


  // --- Effects ---

  // Timer effect - Now defined AFTER handleNext
  useEffect(() => {
    // Conditions to start timer
    if (!showScore && quiz?.questions?.length > 0 && quizIdToUse) {
      console.log("QuizSimulator: Starting timer effect for question:", currentQuestion);
      timerId.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log("Timer expired, calling handleNext");
            handleNext(); // Call the memoized handleNext
            // Returning 15 here might cause a flicker if handleNext also sets it.
            // Let handleNext manage the reset.
            // We need to clear the interval here though.
            if (timerId.current) clearInterval(timerId.current);
            return 15; // Or just let handleNext reset it? Let's keep it for now.
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup
      return () => {
        console.log("QuizSimulator: Clearing timer effect cleanup for question:", currentQuestion);
        if (timerId.current) {
          clearInterval(timerId.current);
          timerId.current = null;
        }
      };
    } else {
       console.log("QuizSimulator: Timer conditions not met or score shown.", { showScore, hasQuestions: quiz?.questions?.length > 0, quizIdToUse });
        // Ensure timer is cleared if conditions become false while it's running
       if (timerId.current) {
           clearInterval(timerId.current);
           timerId.current = null;
        }
    }
    // Dependencies: Include handleNext now it's stable
  }, [currentQuestion, showScore, quiz, quizIdToUse, handleNext]);


  // Fetch quiz data using the determined ID
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizIdToUse) {
        console.error("QuizSimulator: No Quiz ID available to fetch.");
        setLoading(false);
        navigate('/my-quizzes');
        return;
      }

      console.log(`QuizSimulator: Fetching quiz data for ID: ${quizIdToUse}`);
      setLoading(true);
      try {
        const response = await fetch(`/api/quizzes/${quizIdToUse}`, { credentials: 'include' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Quiz fetch failed (ID: ${quizIdToUse}, Status: ${response.status})`);
        }
        const data = await response.json();
        console.log("QuizSimulator: Quiz data fetched successfully:", data);
        setQuiz(data);
        // Reset state when new quiz data arrives
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswers([]);
        setAnswerStatus([]);
        setTimeLeft(15);
      } catch (err) {
        console.error('QuizSimulator: Error fetching quiz:', err.message);
        setQuiz(null);
        navigate('/my-quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizIdToUse, navigate]);


  // Effect to handle showing score if navigated with showResults param
  useEffect(() => {
    const showResults = searchParams.get('showResults') === 'true';
    if (showResults && quiz) {
      setShowScore(true);
      // If showing results directly, ensure score submission happens if needed
      if (sessionCode) {
          submitSessionScore();
      }
    }
  }, [searchParams, quiz, sessionCode, submitSessionScore]); // Add sessionCode & submitSessionScore deps


  // Initialize default answers for slider/text when question changes
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentQuestion]) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        if (typeof newAnswers[currentQuestion] === 'undefined') {
          if (currentQ.type === 'slider') {
            newAnswers[currentQuestion] = currentQ.min ?? 0;
          } else if (currentQ.type === 'text_input') {
            newAnswers[currentQuestion] = '';
          }
        }
        return newAnswers;
      });
    }
  }, [currentQuestion, quiz]);

  // Get current question data safely
  const currentQ = quiz?.questions?.[currentQuestion];

  // Function to format time (MM:SS)
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Helper to get the text of the user's answer for the results screen
  const getUserAnswerText = (question, index) => {
    const answerValue = selectedAnswers[index];
    if (typeof answerValue === 'undefined') return 'No answer given';
    if (question.type === 'multiple_choice') {
      return question.options?.[answerValue]?.text ?? 'Invalid option selected';
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

  // --- Main Component Return JSX ---
  return (
    <div className="container quiz-container mt-4">
      {/* Navigation Links */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/my-quizzes')}>
          ← Back to My Quizzes
        </button>
        <Link to="/home" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      {showScore ? (
        // --- Score Screen ---
         <div className="quiz-results">
           {/* ... (Score screen JSX remains the same) ... */}
          <div className="result-header p-4 bg-primary text-white rounded-3 text-center">
            <h2 className="mb-3">🎉 Simulation Complete! 🎉</h2>
            {/* Score Display */}
            <div className="score-display bg-white p-3 rounded-pill shadow">
              <span className="display-2 fw-bold text-dark">{score}</span>
              <span className="fs-3 text-muted">/{quiz.questions.length}</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 d-flex justify-content-center gap-2">
              {/* Retry button only if NOT in a session */}
              {!sessionCode && (
                <button
                className="btn btn-light btn-lg"
                onClick={() => { // Reset state to retry
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowScore(false);
                  setSelectedAnswers([]);
                  setAnswerStatus([]);
                  setTimeLeft(15);
                }}
                >
                ↻ Retry Quiz
                </button>
              )}
              {/* Button to see session results if in a session */}
              {sessionCode && (
                <button
                  className="btn btn-outline-light btn-lg"
                  // Navigate to the session results page, passing quizId and sessionCode
                  onClick={() => navigate(`/session/${quizIdToUse}/results?session=${sessionCode}`)}
                >
                  <i className="bi bi-trophy me-2"></i> View Session Results
                </button>
              )}
               {/* Always show Back to Home */}
               <Link to="/home" className="btn btn-secondary btn-lg">
                 <i className="bi bi-house me-2"></i> Back to Home
               </Link>
            </div>
          </div>

          {/* Results Breakdown per Question */}
          <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
            {quiz.questions.map((q, index) => {
              const isCorrect = answerStatus[index] === 'Correct';
              const correctAnswerText = q.type === 'multiple_choice'
                ? q.options?.find(opt => opt.is_correct)?.text ?? 'N/A' // Safe navigation
                : q.type === 'text_input'
                ? q.correct_answer ?? 'N/A'
                : q.correct_value?.toString() ?? 'N/A';

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
        <div>
          {/* Question Header (Progress, Timer) */}
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
            {/* Progress Bar for Timer - Value represents remaining time */}
            <progress
                className="w-100 progress" // <-- REMOVED CONDITIONAL CLASSES
                value={timeLeft}
                max="15"
                style={{ height: '5px' }}
             />
          </div>

          {/* Question Text */}
          <h4 className="mb-4">{currentQ?.text || 'Loading question...'}</h4>

          {/* --- Answer Input Area --- */}
           {/* Multiple Choice Options */}
          {currentQ?.type === 'multiple_choice' && (
            <div className="options-grid">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                      if (timeLeft > 0) {
                          setSelectedAnswers(prev => {
                              const newAnswers = [...prev];
                              newAnswers[currentQuestion] = index;
                              return newAnswers;
                          });
                      }
                  }}
                  className={`option-button btn btn-lg btn-outline-primary w-100 d-block text-start p-3
                    ${selectedAnswers[currentQuestion] === index ? 'active' : ''}
                    ${timeLeft === 0 && option.is_correct ? 'correct-answer' : ''}`} // Show correct only after time runs out
                  disabled={timeLeft === 0}
                >
                  {option.text}
                  {timeLeft === 0 && option.is_correct && (
                    <span className="correct-badge float-end fs-4 text-success">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          {currentQ?.type === 'text_input' && (
             <div className="mb-3">
               {/* ... (Text input JSX remains the same) ... */}
                <label htmlFor="textAnswer" className="form-label fs-5">Your Answer:</label>
              <input
                type="text"
                id="textAnswer"
                className="form-control form-control-lg"
                value={selectedAnswers[currentQuestion] || ''}
                onChange={(e) => {
                    if (timeLeft > 0) {
                        setSelectedAnswers(prev => {
                            const newAnswers = [...prev];
                            newAnswers[currentQuestion] = e.target.value;
                            return newAnswers;
                        });
                    }
                }}
                maxLength={currentQ.max_length || 255} // Use max_length from question data
                disabled={timeLeft === 0}
                aria-describedby="textHelp"
              />
               <div id="textHelp" className="form-text">
                  Max length: {currentQ.max_length || 255} characters. Press Enter or click Next.
               </div>
               {/* Optionally show correct answer after time runs out */}
               {timeLeft === 0 && (
                   <div className="alert alert-success mt-2">Correct Answer: {currentQ.correct_answer}</div>
               )}
             </div>
           )}

          {/* Slider Input */}
          {currentQ?.type === 'slider' && (
             <div className="mb-3">
              {/* ... (Slider input JSX remains the same) ... */}
                <label htmlFor="sliderAnswer" className="form-label fs-5 d-block">
                Your Selection: <strong className="text-primary">{selectedAnswers[currentQuestion] ?? currentQ.min ?? 0}</strong>
              </label>
              <input
                type="range"
                id="sliderAnswer"
                className="form-range"
                min={currentQ.min}
                max={currentQ.max}
                step={currentQ.step}
                // Use controlled value, defaulting to min if nothing selected yet
                value={selectedAnswers[currentQuestion] ?? currentQ.min ?? 0}
                onChange={(e) => {
                    if (timeLeft > 0) {
                         setSelectedAnswers(prev => {
                             const newAnswers = [...prev];
                             // Store the value as a number
                             newAnswers[currentQuestion] = parseInt(e.target.value, 10);
                             return newAnswers;
                         });
                    }
                }}
                disabled={timeLeft === 0}
                style={{ height: '1.5rem' }} // Make slider easier to grab
              />
              {/* Display Min/Max values for clarity */}
               <div className="d-flex justify-content-between text-muted">
                    <span>{currentQ.min}</span>
                    <span>{currentQ.max}</span>
               </div>
               {/* Optionally show correct answer after time runs out */}
               {timeLeft === 0 && (
                   <div className="alert alert-success mt-2">Correct Value: {currentQ.correct_value}</div>
               )}
             </div>
           )}

          {/* Next/Finish Button */}
          <div className="mt-4 text-end">
            <button
              className="btn btn-primary btn-lg px-5"
              onClick={handleNext} // Call the memoized handleNext
              // Simplified disabled logic: Button is active unless timer is up
              // OR for MC/Slider, if timer is running AND no answer is selected yet.
               disabled={
                 timeLeft === 0 ||
                 (timeLeft > 0 &&
                  currentQ?.type !== 'text_input' &&
                  typeof selectedAnswers[currentQuestion] === 'undefined')
               }
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