// src/frontend/src/components/feature components/QuizSimulator.jsx
import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams, useSearchParams} from 'react-router-dom';

// 1. Accept quizId as a prop
function QuizSimulator({ quizId: quizIdProp }) { // Rename prop to avoid clash with useParams variable
  // 2. Get ID from URL params as a fallback
  const { quizId: quizIdFromParams } = useParams();
  // 3. Determine the actual quiz ID to use, prioritizing the prop
  const quizIdToUse = quizIdProp ?? quizIdFromParams;

  // --- Keep other existing setup ---
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const isHost = searchParams.get('isHost') === 'true'; // This might not be needed if session determines behavior

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  // 'joining' and 'joined' might be redundant if QuizSession handles joining state before rendering this
  const [joined, setJoined] = useState(!!sessionCode); // Assume joined if sessionCode is present initially
  const navigate = useNavigate();
  const [answerStatus, setAnswerStatus] = useState([]);
  const timerId = useRef(null);


   // Debug log to confirm which ID is being used
   console.log(`QuizSimulator using ID: ${quizIdToUse} (Prop: ${quizIdProp}, Params: ${quizIdFromParams})`);


  // Timer effect
  useEffect(() => {
    // Ensure we have quiz data and are ready to run timer
    if (!showScore && quiz?.questions?.length > 0 && quizIdToUse && joined) {
        console.log("QuizSimulator: Starting timer effect.");
        timerId.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext(); // Go to next question/results on timeout
            return 15; // Reset timer duration
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup function for the timer
      return () => {
          console.log("QuizSimulator: Clearing timer effect.");
          clearInterval(timerId.current);
          timerId.current = null; // Clear the ref
      }
    } else {
        console.log("QuizSimulator: Timer not started.", { showScore, hasQuestions: quiz?.questions?.length > 0, quizIdToUse, joined });
    }
    // Dependencies for the timer effect
  }, [currentQuestion, showScore, quiz, joined, quizIdToUse]); // Added quizIdToUse


  // Fetch quiz data using the determined ID
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizIdToUse) {
        console.error("QuizSimulator: No Quiz ID available to fetch.");
        setLoading(false);
        // Optionally navigate away or display an error message
        navigate('/my-quizzes'); // Navigate back if no ID
        return;
      }

      console.log(`QuizSimulator: Fetching quiz data for ID: ${quizIdToUse}`);
      setLoading(true);
      try {
        const response = await fetch(`/api/quizzes/${quizIdToUse}`, { // Use quizIdToUse
          credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Quiz fetch failed (ID: ${quizIdToUse}, Status: ${response.status})`);
        }
        const data = await response.json();
        console.log("QuizSimulator: Quiz data fetched successfully:", data);
        setQuiz(data);
        // Reset quiz state when new data is loaded
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswers([]);
        setAnswerStatus([]);
        setTimeLeft(15); // Reset timer duration for the first question
        setJoined(true); // Mark as joined now that data is loaded
      } catch (err) {
        console.error('QuizSimulator: Error fetching quiz:', err.message);
        setQuiz(null); // Clear quiz data on error
        navigate('/my-quizzes'); // Navigate back on error
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  // Depend on the ID being used and navigate function
  }, [quizIdToUse, navigate]);

  // Session joiner logic - Simplified: Assume joined if sessionCode exists and data loads
  // This might need refinement based on exact requirements for participant view vs host view
  useEffect(() => {
     setJoined(!!sessionCode && !!quiz); // Consider joined if in session mode and quiz loaded
  }, [sessionCode, quiz]);


  // Check if we should show results directly (e.g., retrying after finishing)
  useEffect(() => {
    const showResults = searchParams.get('showResults') === 'true';
    if (showResults && quiz) { // Only show score if quiz data is loaded
      setShowScore(true);
    }
  }, [searchParams, quiz]);

  // Function to submit final score to the backend session
  const submitSessionScore = async () => {
    if (!sessionCode) return; // Only submit if in a session
    console.log(`QuizSimulator: Submitting score ${score} for session ${sessionCode}`);
    try {
      const response = await fetch(`/api/sessions/${sessionCode}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score })
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
  };

  // Initialize default answers for slider/text when question changes
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentQuestion]) {
      const currentQ = quiz.questions[currentQuestion];
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        if (typeof newAnswers[currentQuestion] === 'undefined') {
          if (currentQ.type === 'slider') {
            newAnswers[currentQuestion] = currentQ.min ?? 0; // Default to min value
          } else if (currentQ.type === 'text_input') {
            newAnswers[currentQuestion] = ''; // Default to empty string
          }
          // Multiple choice doesn't need a default selection
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

  // Function to handle moving to the next question or finishing
  const handleNext = () => {
    clearInterval(timerId.current); // Stop timer for current question
    timerId.current = null;

    if (!quiz || !currentQ) {
      console.warn("handleNext called without quiz or current question data.");
      setShowScore(true); // Default to showing score screen
      submitSessionScore(); // Submit score if in session
      return;
    }

    // --- Evaluate answer ---
    let answerResult = "Wrong"; // Default assumption
    const currentAnswer = selectedAnswers[currentQuestion];
    let pointsEarned = 0; // Use points for score calculation

    if (currentQ.type === 'multiple_choice') {
      // Find the index of the correct option
      const correctOptionIndex = currentQ.options.findIndex(opt => opt.is_correct);
      if (currentAnswer === correctOptionIndex) {
        answerResult = "Correct";
        pointsEarned = 1; // Assign 1 point for correct MC
      }
    } else if (currentQ.type === 'text_input') {
      const userText = String(currentAnswer ?? '').trim().toLowerCase();
      const correctText = String(currentQ.correct_answer || '').trim().toLowerCase();
      // Ensure non-empty match
      if (userText !== '' && userText === correctText) {
        answerResult = "Correct";
        pointsEarned = 1; // Assign 1 point for correct text
      }
    } else if (currentQ.type === 'slider') {
      // Ensure comparison is done with numbers
      if (Number(currentAnswer) === Number(currentQ.correct_value)) {
        answerResult = "Correct";
        pointsEarned = 1; // Assign 1 point for correct slider value
      }
    }

    setAnswerStatus(prevStatus => [...prevStatus, answerResult]);
    setScore(prevScore => prevScore + pointsEarned); // Update score based on points earned

    // --- Move to next question or finish ---
    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < quiz.questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      setTimeLeft(15); // Reset timer for the next question
    } else {
      // --- Quiz Finished ---
      setShowScore(true);
      submitSessionScore(); // Submit final score if in session
    }
  };


  // --- Render Logic ---

  // Display loading indicator
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading quiz...</p>
      </div>
    );
  }

  // Display error if quiz failed to load
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

  // Display joining message if in session mode but quiz not loaded yet (should be brief)
  if (sessionCode && !joined) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Loading quiz data for session...</p>
      </div>
    );
  }

  // Helper to get the text of the user's answer for the results screen
  const getUserAnswerText = (question, index) => {
    const answerValue = selectedAnswers[index];

    if (typeof answerValue === 'undefined') {
        return 'No answer given';
    }

    if (question.type === 'multiple_choice') {
      // Check if the selected index is valid for the options array
      return question.options?.[answerValue]?.text ?? 'Invalid option selected';
    }
    // For slider and text input, the answer itself is the value/text
    return String(answerValue);
  };


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

      {/* Conditional Rendering: Score Screen or Question Screen */}
      {showScore ? (
        // --- Score Screen ---
        <div className="quiz-results">
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
              // Determine the correct answer text based on question type
              const correctAnswerText = q.type === 'multiple_choice'
                ? q.options.find(opt => opt.is_correct)?.text ?? 'N/A'
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
                        {/* Show user's answer only if it was wrong */}
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
            {/* Progress Bar for Timer */}
            <progress className="w-100 progress" value={timeLeft} max="15" style={{ height: '5px' }} />
          </div>

          {/* Question Text - Ensure currentQ exists */}
          <h4 className="mb-4">{currentQ?.text || 'Loading question...'}</h4>

           {/* --- Answer Input Area --- */}
           {/* Ensure currentQ exists before rendering options */}

          {/* Multiple Choice Options */}
          {currentQ?.type === 'multiple_choice' && (
            <div className="options-grid">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                      // Update selected answer only if timer hasn't run out
                      if (timeLeft > 0) {
                          setSelectedAnswers(prev => {
                              const newAnswers = [...prev];
                              newAnswers[currentQuestion] = index;
                              return newAnswers;
                          });
                      }
                  }}
                  // Apply 'active' class if selected, potential 'correct-answer' class if timer runs out
                  className={`option-button btn btn-lg btn-outline-primary w-100 d-block text-start p-3
                    ${selectedAnswers[currentQuestion] === index ? 'active' : ''}
                    ${timeLeft === 0 && option.is_correct ? 'correct-answer' : ''}`}
                  disabled={timeLeft === 0} // Disable button when timer runs out
                >
                  {option.text}
                  {/* Visual indicator for correct answer shown AFTER time runs out */}
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
              onClick={handleNext}
              // Disable if timer is running AND no answer selected yet (for MC/Slider)
              // Text input can be submitted empty, maybe add validation?
              disabled={
                timeLeft > 0 &&
                (typeof selectedAnswers[currentQuestion] === 'undefined' && currentQ?.type !== 'text_input')
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