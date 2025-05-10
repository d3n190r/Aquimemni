// frontend/src/components/feature components/MyQuizzes.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(''); // Algemene fouten voor de pagina
  const [apiErrorModal, setApiErrorModal] = useState(''); // Fouten specifiek voor de modal
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const navigate = useNavigate();

  // --- State voor de "Host Session" Modal ---
  const [showHostModal, setShowHostModal] = useState(false);
  const [quizToHost, setQuizToHost] = useState(null); // Welke quiz wordt gehost vanuit de modal
  const [numTeams, setNumTeams] = useState('1');
  const [isCreatingSession, setIsCreatingSession] = useState(false);


  useEffect(() => {
    const fetchQuizzes = async () => {
      setError('');
      try {
        const response = await fetch('/api/quizzes', {
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({error: 'Failed to fetch quizzes'}));
          throw new Error(data.error);
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message || 'A network error occurred while loading quizzes');
        console.error("Error fetching quizzes in MyQuizzes:", err);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone!')) {
      return;
    }
    setError(''); // Reset algemene error
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        // Als de verwijderde quiz de expanded quiz was, sluit de details
        if (expandedQuizId === quizId) {
            setExpandedQuizId(null);
        }
      } else {
        const data = await response.json().catch(() => ({error: 'Deletion failed with non-JSON response'}));
        setError(data.error || 'Deletion failed');
      }
    } catch (err) {
      setError('Network error during deletion');
      console.error("Error deleting quiz in MyQuizzes:", err);
    }
  };

  const handleOpenHostModal = (quiz) => {
    if (quiz.questions_count === 0) {
        setError(`Quiz "${quiz.name}" has no questions and cannot be hosted. Please add questions first.`);
        window.scrollTo(0,0); // Scroll naar boven om error te zien
        return;
    }
    setError(''); // Reset algemene error
    setQuizToHost(quiz);
    setApiErrorModal('');
    setNumTeams('1');
    setShowHostModal(true);
  };

  const handleCreateSessionFromModal = async () => {
    if (!quizToHost) {
        setApiErrorModal('No quiz selected to host.');
        return;
    }
    setApiErrorModal('');

    const teamCount = parseInt(numTeams, 10);
    if (isNaN(teamCount) || teamCount < 1) {
        setApiErrorModal('Number of teams must be a positive number (1 or more).');
        return;
    }
    if (quizToHost.questions_count === 0) {
        setApiErrorModal('Cannot host a quiz with no questions.');
        return;
    }

    setIsCreatingSession(true);
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizToHost.id,
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
        console.error("Error creating session from MyQuizzes modal:", err);
        setApiErrorModal(err.message || 'Could not create session. Please try again.');
    } finally {
        setIsCreatingSession(false);
    }
  };


  const toggleQuizDetails = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
        return new Date(dateString).toLocaleDateString(navigator.language || 'en-US', options);
    } catch {
        return String(dateString);
    }
  };

  const countQuestionTypes = (questions) => {
    const counts = { text: 0, multiple: 0, slider: 0 };
    if (!questions || !Array.isArray(questions)) return counts;
    questions.forEach(q => {
      if (q.type === 'text_input') counts.text++;
      if (q.type === 'multiple_choice') counts.multiple++;
      if (q.type === 'slider') counts.slider++;
    });
    return counts;
  };


  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">My Quizzes</h2>
          <div>
              <Link to="/home" className="btn btn-outline-secondary me-2">
                  <i className="bi bi-house-door me-1 d-none d-sm-inline"></i> Back to Home
              </Link>
              <Link to="/quiz-maker" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i> Create New Quiz
              </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}

        {quizzes.length === 0 && !error && (
            <div className="text-center p-5 border rounded bg-light-subtle mt-4">
                <i className="bi bi-journal-richtext display-1 text-secondary mb-3"></i>
                <h4>You haven't created any quizzes yet.</h4>
                <p className="text-muted">Click "Create New Quiz" to get started!</p>
            </div>
        )}

        {quizzes.length > 0 && (
          <div className="list-group">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="list-group-item list-group-item-action p-0 mb-3 border rounded-3 shadow-sm overflow-hidden">
                <div
                  className="d-flex justify-content-between align-items-center p-3"
                  onClick={() => toggleQuizDetails(quiz.id)}
                  style={{ cursor: 'pointer', backgroundColor: expandedQuizId === quiz.id ? '#e9ecef' : 'transparent' }} // Iets donkerder geselecteerd
                  aria-expanded={expandedQuizId === quiz.id}
                  aria-controls={`quiz-details-${quiz.id}`}
                  role="button" // Maak het klikbaar voor accessibility
                  tabIndex={0} // Maak het focusseerbaar
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleQuizDetails(quiz.id); }} // Toetsenbord navigatie
                >
                  <div>
                    <h5 className="mb-1 d-flex align-items-center">
                        {quiz.name}
                        {quiz.questions_count === 0 && <span className="badge bg-warning text-dark ms-2 small py-1 px-2">No Questions</span>}
                    </h5>
                    <small className="text-muted">
                        Created on {formatDate(quiz.created_at)} • {quiz.questions_count || 0} question{quiz.questions_count !== 1 ? 's' : ''}
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0"> {/* flex-shrink-0 voorkomt dat knoppen krimpen */}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/edit/${quiz.id}`, { state: { quiz } }); }}
                      title="Edit quiz"
                    >
                      <i className="bi bi-pencil-fill"></i> <span className="d-none d-md-inline">Edit</span>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id); }}
                      title="Delete quiz"
                    >
                      <i className="bi bi-trash-fill"></i> <span className="d-none d-md-inline">Delete</span>
                    </button>
                    <span // Veranderd naar span om dubbele focus te vermijden, onClick is al op parent
                      className="btn btn-light btn-sm border p-1 d-flex align-items-center justify-content-center"
                      title={expandedQuizId === quiz.id ? "Hide details" : "Show details"}
                      style={{ width: '32px', height: '32px' }} // Vaste grootte voor chevron knop
                    >
                      {expandedQuizId === quiz.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </span>
                  </div>
                </div>

                {expandedQuizId === quiz.id && (
                  <div className="p-3 border-top bg-light-subtle" id={`quiz-details-${quiz.id}`}> {/* Iets andere achtergrond voor details */}
                    <div className="mb-3 d-grid gap-2 d-sm-flex">
                      <button
                        className="btn btn-primary flex-sm-fill"
                        onClick={(e) => {e.stopPropagation(); navigate(`/simulate/${quiz.id}`)}}
                      >
                        <i className="bi bi-person-workspace me-2"></i>Simulate Quiz
                      </button>
                      <button
                          className="btn btn-success flex-sm-fill"
                          onClick={(e) => {e.stopPropagation(); handleOpenHostModal(quiz)}}
                          disabled={quiz.questions_count === 0}
                          title={quiz.questions_count === 0 ? "Cannot host: quiz has no questions." : "Start a new session for this quiz"}
                      >
                        <i className="bi bi-megaphone-fill me-2"></i>Host Session
                      </button>
                    </div>
                    {quiz.questions_count === 0 && (
                      <div className="alert alert-warning p-2 small text-center">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          This quiz currently has no questions. Add questions to enable hosting.
                      </div>
                    )}
                    {quiz.questions_count > 0 && (
                      <>
                          <h6 className="text-secondary">Overview:</h6>
                          <ul className="list-unstyled small text-muted mb-3">
                          <li>Total answers recorded (example): {
                              quiz.questions.reduce((acc, q) => acc + (q.answers?.length || 0), 0)
                              // Let op: 'answers' property moet bestaan op je question objecten hiervoor
                          }</li>
                          <li>Question types: {Object.entries(countQuestionTypes(quiz.questions))
                              .filter(([, count]) => count > 0) // Toon alleen types die aanwezig zijn
                              .map(([type, count]) => `${count} ${type.replace('_', ' ')}`)
                              .join(', ') || 'N/A'}
                          </li>
                          </ul>
                          <h6 className="text-secondary">Questions Preview:</h6>
                          <ul className="list-group list-group-flush" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          {quiz.questions?.map((question, qIndex) => (
                              <li key={question.id || qIndex} className="list-group-item bg-transparent px-0 py-2"> {/* bg-transparent voor betere look in .bg-light-subtle */}
                              <div className="d-flex justify-content-between">
                                  <span className="text-truncate" style={{maxWidth: '70%'}}>
                                    <strong>Q{qIndex + 1}:</strong> {question.text}
                                  </span>
                                  <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                                  {question.type.replace('_', ' ')}
                                  </span>
                              </div>
                              </li>
                          ))}
                          </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Host Session Modal --- */}
      {showHostModal && quizToHost && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-labelledby="hostSessionModalMyQuizzesLabel" aria-hidden={!showHostModal}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header p-4 border-bottom-0">
                <h4 className="modal-title fw-bold mb-0 fs-4" id="hostSessionModalMyQuizzesLabel">Host Session: <span className="text-primary">{quizToHost.name}</span></h4>
                <button type="button" className="btn-close" onClick={() => setShowHostModal(false)} aria-label="Close" disabled={isCreatingSession}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                {apiErrorModal && <div className="alert alert-danger py-2 small mb-3">{apiErrorModal}</div>}
                <p className="text-muted small">Configure the number of teams for this live session.</p>
                <div className="mb-3">
                  <label htmlFor="numTeamsInputModalMyQuizzes" className="form-label fw-medium">Number of Teams:</label>
                  <input
                    type="number"
                    id="numTeamsInputModalMyQuizzes"
                    className="form-control form-control-lg fs-5"
                    value={numTeams}
                    onChange={(e) => setNumTeams(e.target.value)}
                    min="1"
                    step="1"
                    disabled={isCreatingSession}
                    autoFocus
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
      {showHostModal && quizToHost && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default MyQuizzes;