// src/frontend/src/components/feature components/QuizDetails.jsx
/**
 * Quiz details component for viewing and interacting with a specific quiz.
 * 
 * This component displays detailed information about a quiz, including its questions,
 * creation date, and creator. It provides functionality for simulating the quiz,
 * hosting a session with team options, and navigating to related pages.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * QuizDetails component for displaying and interacting with a specific quiz.
 * 
 * @returns {JSX.Element} The rendered quiz details page
 */
export default function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(''); // Voor fouten bij het laden van quizdetails
  const [apiError, setApiError] = useState(''); // Voor fouten tijdens sessie creatie in de modal
  const [showQuestions, setShowQuestions] = useState(false);

  // State voor de "Host Session" Modal
  const [showHostModal, setShowHostModal] = useState(false);
  const [numTeams, setNumTeams] = useState('1'); // Default 1 team (solo)
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Optioneel: loggedInUserId kan nog steeds nuttig zijn voor andere UI-elementen,
  // maar is niet meer direct nodig voor de logica van de Host Session knop.
  // const [loggedInUserId, setLoggedInUserId] = useState(null);
  // useEffect(() => {
  //   const fetchLoggedInUser = async () => { /* ... */ };
  //   fetchLoggedInUser();
  // }, []);

  /**
   * Effect hook to fetch quiz data when component mounts or quizId changes.
   * 
   * Retrieves detailed information about the quiz from the API, including its questions,
   * creator, and creation date. Handles errors and updates the quiz state with the fetched data.
   */
  useEffect(() => {
    const fetchQuiz = async () => {
      setError('');
      setApiError(''); // Reset ook API error van modal
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, { credentials: 'include' });
        if (!res.ok) {
             const errData = await res.json().catch(() => ({ error: 'Quiz not found or access denied. Please ensure the quiz ID is correct.' }));
             throw new Error(errData.error);
        }
        const quizData = await res.json();
        setQuiz(quizData);
      } catch (err) {
        console.error("Error fetching quiz details:", err);
        setError(err.message);
      }
    };
    if (quizId) {
        fetchQuiz();
    }
  }, [quizId]);

  /**
   * Formats a date string into a localized, human-readable format.
   * 
   * Converts an ISO date string to a formatted string showing the year, month, and day
   * in the US locale format. Provides a fallback for invalid date strings.
   * 
   * @param {string} iso - The ISO date string to format
   * @returns {string} The formatted date string
   */
  const formatDate = iso => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { // Of gebruik navigator.language
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return String(iso); // Fallback
    }
  };

  /**
   * Navigates to the quiz simulation page.
   * 
   * Redirects the user to a page where they can simulate taking the quiz
   * without creating an actual session.
   */
  const handleSimulate = () => navigate(`/simulate/${quizId}`);

  /**
   * Opens the host session modal for the quiz.
   * 
   * Validates that the quiz has questions before opening the modal.
   * Displays an error message if the quiz has no questions.
   */
  const handleOpenHostModal = () => {
    if (quiz && quiz.questions_count === 0) {
        // Dit zou ook door de disabled state van de knop afgevangen moeten worden, maar extra check kan geen kwaad.
        alert("This quiz has no questions and cannot be hosted. Please add questions to the quiz first.");
        return;
    }
    setApiError('');
    setNumTeams('1');
    setShowHostModal(true);
  };

  /**
   * Creates a new quiz session from the host modal.
   * 
   * Validates the quiz and team settings, then sends a request to the API
   * to create a new session. On success, navigates to the session page.
   * Handles errors and loading states appropriately.
   * 
   * @returns {Promise<void>} A promise that resolves when the session creation process completes
   */
  const handleCreateSessionFromModal = async () => {
    if (!quiz) {
        setApiError('Quiz data is not available.');
        return;
    }
    setApiError('');

    const teamCount = parseInt(numTeams, 10);
    if (isNaN(teamCount) || teamCount < 1) {
        setApiError('Number of teams must be a positive number (1 or more).');
        return;
    }
    if (quiz.questions_count === 0) {
        setApiError('Cannot host a quiz with no questions.'); // Dubbele check
        return;
    }

    setIsCreatingSession(true);
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quiz.id,
                num_teams: teamCount
            }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            setShowHostModal(false);
            navigate(`/session/${data.code}`);
        } else {
            throw new Error(data.error || 'Failed to create session');
        }
    } catch (err) {
        console.error("Error creating session from modal:", err);
        setApiError(err.message || 'Could not create session. Please try again.');
    } finally {
        setIsCreatingSession(false);
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
            <h4 className="alert-heading">Oops! Something went wrong.</h4>
            <p>{error}</p>
        </div>
        <div className="text-center">
            <button className="btn btn-primary" onClick={() => navigate('/home')}>Go Back to Home</button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status"></div>
        <p className="mt-3 fs-5">Loading quiz details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i>Back
            </button>
        </div>

        <div className="card border rounded-4 shadow-lg p-4 p-lg-5"> {/* Meer shadow en padding */}
            {/* Quiz creator info */}
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <img
                src={`/avatars/avatar${quiz.creator_avatar || 1}.png`}
                alt={quiz.creator}
                className="rounded-circle shadow-sm me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }} // Iets kleiner dan vorige versie, consistenter
              />
              <div>
                <h5 className="card-title mb-0 fs-5"> {/* Consistentere titelgrootte */}
                    <a
                        href={`/profile/view/${quiz.creator_id}`}
                        onClick={(e) => { e.preventDefault(); navigate(`/profile/view/${quiz.creator_id}`);}}
                        className="text-decoration-none fw-medium"
                        title={`View profile of ${quiz.creator}`}
                    >
                        {quiz.creator}
                    </a>
                </h5>
                <small className="text-muted">Created on {formatDate(quiz.created_at)}</small>
              </div>
            </div>

            <h2 className="display-5 fw-bold mb-2 text-primary">{quiz.name}</h2> {/* Quiznaam prominenter */}
            <p className="lead text-secondary mb-4">
                This quiz features {quiz.questions_count || 0} question{quiz.questions_count !== 1 ? 's' : ''}.
            </p>

            <div className="mb-4 d-grid gap-3"> {/* d-grid voor full-width knoppen op mobile */}
              <button className="btn btn-lg btn-primary py-3 fs-5" onClick={handleSimulate}> {/* Meer padding, groter font */}
                <i className="bi bi-person-arms-up me-2"></i>Simulate Quiz Solo
              </button>

              <button
                className="btn btn-lg btn-success py-3 fs-5"
                onClick={handleOpenHostModal}
                disabled={quiz.questions_count === 0}
                title={quiz.questions_count === 0 ? "This quiz has no questions and cannot be hosted." : "Host this quiz for others to join"}
              >
                <i className="bi bi-megaphone-fill me-2"></i>Host Live Session
              </button>
            </div>
            {quiz.questions_count === 0 &&
                <div className="alert alert-warning mt-2 p-2 small text-center">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    This quiz currently has no questions. You can simulate it, but it cannot be hosted until questions are added.
                </div>
            }

            <div className="mt-4 text-center">
                <button className="btn btn-outline-secondary" onClick={() => setShowQuestions(v => !v)}>
                {showQuestions ? <><i className="bi bi-eye-slash-fill me-1"></i>Hide Questions Overview</> : <><i className="bi bi-eye-fill me-1"></i>Show Questions Overview</>}
                </button>
            </div>

            {showQuestions && (
              <div className="mt-4 pt-3 border-top">
                <h4 className="mb-3 text-muted">Questions Overview:</h4>
                {quiz.questions.length === 0 ? (
                    <p className="text-muted fst-italic">No questions are currently available for this quiz.</p>
                ) : (
                    <ul className="list-group list-group-flush">
                    {quiz.questions.map((q, idx) => (
                        <li key={q.id || idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                            <span><strong>Q{idx + 1}:</strong> {q.text.length > 80 ? q.text.substring(0, 80) + "..." : q.text}</span>
                            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill"> {/* BS 5.3+ */}
                                {q.type.replace('_', ' ')}
                            </span>
                        </li>
                    ))}
                    </ul>
                )}
              </div>
            )}
        </div>
      </div>

      {/* --- Host Session Modal --- */}
      {showHostModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-labelledby="hostSessionModalLabel" aria-hidden={!showHostModal}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header p-4 border-bottom-0">
                <h4 className="modal-title fw-bold mb-0 fs-4" id="hostSessionModalLabel">Host Session: <span className="text-primary">{quiz.name}</span></h4>
                <button type="button" className="btn-close" onClick={() => setShowHostModal(false)} aria-label="Close" disabled={isCreatingSession}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                {apiError && <div className="alert alert-danger py-2 small mb-3">{apiError}</div>}
                <p className="text-muted small">Configure the number of teams for this live session.</p>
                <div className="mb-3">
                  <label htmlFor="numTeamsInputModal" className="form-label fw-medium">Number of Teams:</label>
                  <input
                    type="number"
                    id="numTeamsInputModal"
                    className="form-control form-control-lg fs-5" // Groter input veld
                    value={numTeams}
                    onChange={(e) => setNumTeams(e.target.value)}
                    min="1"
                    step="1"
                    disabled={isCreatingSession}
                    autoFocus // Zet focus op dit veld als modal opent
                  />
                  <div className="form-text small mt-1">
                    Enter 1 for individual play, or 2 or more for team mode.
                  </div>
                </div>
              </div>
              <div className="modal-footer flex-nowrap p-0">
                <button
                    type="button"
                    className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end text-secondary"
                    onClick={() => setShowHostModal(false)}
                    disabled={isCreatingSession}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-lg btn-success fs-6 text-decoration-none col-6 py-3 m-0 rounded-0"
                    onClick={handleCreateSessionFromModal}
                    disabled={isCreatingSession || !numTeams || parseInt(numTeams, 10) < 1}
                >
                  {isCreatingSession ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Starting...</>
                  ) : (
                    <><i className="bi bi-play-circle-fill me-1"></i>Start Session</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Conditionally render backdrop only when modal is shown */}
      {showHostModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
