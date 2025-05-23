// src/frontend/src/components/Home components/Main.jsx
/**
 * Main content components for the home page.
 * 
 * This file contains various components that make up the main content area of the home page,
 * including sections for joining sessions, starting new quiz sessions, displaying how the
 * application works, and showing recent activity. These components are combined in the Main
 * component to create the complete home page content.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

// --- Helper Components ---

/**
 * Component for joining an existing quiz session.
 * 
 * Provides a form for users to enter a session code and join an active quiz session.
 * Validates the session code and navigates to the session page if valid.
 * 
 * @returns {JSX.Element} The rendered join session section
 */
export const JoinSessionSection = () => {
    const navigate = useNavigate();
    const [sessionCode, setSessionCode] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleJoin = async () => {
        setError('');
        if (!sessionCode.trim()) {
            setError('Please enter a session code.');
            return;
        }
        if (sessionCode.trim().length !== 6) {
             setError('Session code must be 6 characters long.');
             return;
        }
        setIsChecking(true);
        try {
            const response = await fetch(`/api/sessions/${sessionCode.trim()}`, {credentials: 'include'});
            if (response.ok) {
                navigate(`/session/${sessionCode.trim()}`);
            } else if (response.status === 404) {
                setError(`Session with code "${sessionCode.trim()}" not found.`);
            } else {
                 const errData = await response.json().catch(() => ({}));
                setError(errData.error || 'Could not verify session code. Please try again.');
            }
        } catch (err) {
            console.error("Error checking session code:", err);
            setError('A network error occurred.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="col-12 col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary mb-3">
                        <i className="bi bi-joystick me-2"></i>Join a Quiz Session
                    </h5>
                    <p className="card-text text-muted">Enter the 6-character code provided by the host.</p>
                    <div className="input-group mb-3 mt-auto">
                        <input
                            type="text"
                            className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
                            placeholder="ABCXYZ"
                            value={sessionCode}
                            onChange={(e) => setSessionCode(e.target.value.toUpperCase().trim())}
                            maxLength="6"
                            aria-label="Session Code"
                            disabled={isChecking}
                        />
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleJoin}
                            disabled={isChecking || !sessionCode || sessionCode.length !== 6}
                        >
                            {isChecking ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Join'}
                        </button>
                    </div>
                    {error && <div className="text-danger small mt-1">{error}</div>}
                </div>
            </div>
        </div>
    );
};

/**
 * Component for starting a new quiz session as a host.
 * 
 * Allows users to select one of their quizzes, configure team settings,
 * and create a new session. Handles quiz preselection from navigation state.
 * 
 * @returns {JSX.Element} The rendered start quiz section
 */
export const StartQuizSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [numTeams, setNumTeams] = useState('1');

    const preselectHandledForCurrentIdRef = useRef(null);

    const fetchQuizzesAndPreselect = useCallback(async () => {
        console.log("StartQuizSection: fetchQuizzesAndPreselect called. Current location.state:", location.state, "isLoading:", isLoading);

        if (!isLoading) setIsLoading(true);
        setError('');

        let quizOptionsToUse = [];

        try {
            const response = await fetch('/api/quizzes', { credentials: 'include' });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch quizzes');
            }
            const data = await response.json();
            const validQuizzes = data.filter(q => q.questions_count > 0);
            quizOptionsToUse = validQuizzes.map(q => ({
                value: q.id,
                label: q.name,
                questions_count: q.questions_count
            }));
            setQuizzes(quizOptionsToUse);

            if (data.length > 0 && validQuizzes.length === 0) {
                setError("All your quizzes have 0 questions. Add questions to host a session.");
            } else if (data.length === 0) {
                console.log("User has no quizzes.");
            }

            if (location.state?.preselectQuizId) {
                if (location.state.preselectQuizId !== preselectHandledForCurrentIdRef.current) {
                    console.log("StartQuizSection: Attempting to preselect quiz ID:", location.state.preselectQuizId);
                    const quizToSelect = quizOptionsToUse.find(q => q.value === location.state.preselectQuizId);
                    if (quizToSelect) {
                        console.log("StartQuizSection: Preselecting quiz:", quizToSelect.label);
                        setSelectedQuiz(quizToSelect);
                        preselectHandledForCurrentIdRef.current = location.state.preselectQuizId;
                        navigate(location.pathname, { replace: true, state: {} });
                    } else {
                        console.warn("StartQuizSection: PreselectQuizId not found in options:", location.state.preselectQuizId);
                        navigate(location.pathname, { replace: true, state: {} });
                        preselectHandledForCurrentIdRef.current = location.state.preselectQuizId;
                    }
                } else {
                     if (Object.keys(location.state).length > 0) {
                        navigate(location.pathname, { replace: true, state: {} });
                     }
                }
            }

        } catch (err) {
            console.error("Error in fetchQuizzesAndPreselect:", err);
            setError('Could not load or preselect quizzes.');
            setQuizzes([]);
        } finally {
            console.log("StartQuizSection: Fetch/Preselect attempt finished. Setting isLoading to false.");
            setIsLoading(false);
        }
    }, [location.state, navigate, location.pathname]); // isLoading en quizzes.length verwijderd

    useEffect(() => {
        fetchQuizzesAndPreselect();
    }, [fetchQuizzesAndPreselect]);


    const handleStartSession = async () => {
        if (!selectedQuiz) {
            setError('Please select a quiz to host.');
            return;
        }
        if (selectedQuiz.questions_count === 0) {
             setError('Cannot host a quiz with no questions.');
             return;
        }
        setError('');
        setIsLoading(true);
        const teamCount = parseInt(numTeams, 10);
        if (isNaN(teamCount) || teamCount < 1) {
             setError('Number of teams must be a positive number (1 or more).');
             setIsLoading(false);
             return;
        }
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: selectedQuiz.value,
                    num_teams: teamCount
                 }),
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                navigate(`/session/${data.code}`);
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create session');
            }
        } catch (err) {
            console.error("Error creating session:", err);
            setError(err.message || 'Could not create session.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px',
             boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
             borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
             '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' }
        }),
        menu: (provided) => ({ ...provided, zIndex: 5 }),
         option: (provided, state) => ({
             ...provided,
             backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
             color: state.isSelected ? 'white' : '#212529',
             ':active': { backgroundColor: !state.isDisabled ? (state.isSelected ? '#0b5ed7' : '#dee2e6') : undefined, },
             cursor: 'pointer'
         }),
    };

    return (
        <div className="col-12 col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-success mb-3">
                         <i className="bi bi-play-circle-fill me-2"></i>Host a New Session
                    </h5>
                    <p className="card-text text-muted">Select one of your quizzes to start a live session.</p>
                    <div className="mb-3">
                        <label htmlFor="quizSelectHost" className="form-label">Select Quiz:</label>
                        <Select
                            id="quizSelectHost"
                            options={quizzes}
                            value={selectedQuiz}
                            onChange={setSelectedQuiz}
                            isLoading={isLoading}
                            isDisabled={isLoading || (quizzes.length === 0 && !error)}
                            placeholder={isLoading ? "Loading quizzes..." : (quizzes.length === 0 && !error ? "No quizzes with questions available" : "Choose a quiz...")}
                            noOptionsMessage={() => isLoading ? 'Loading...' : (error ? 'Error loading quizzes' : 'No quizzes with questions available')}
                            styles={selectStyles}
                            classNamePrefix="react-select"
                         />
                    </div>
                     <div className="mb-3">
                         <label htmlFor="numTeamsInput" className="form-label">Number of Teams:</label>
                         <input
                             type="number"
                             id="numTeamsInput"
                             className="form-control"
                             value={numTeams}
                             onChange={(e) => setNumTeams(e.target.value)}
                             min="1"
                             step="1"
                             placeholder="e.g., 1 for individual, 2+ for teams"
                             disabled={isLoading || (quizzes.length === 0 && !error)}
                         />
                         <div className="form-text">
                             Enter 1 for individual play, or 2 or more for team mode.
                         </div>
                     </div>
                    {error && <div className="alert alert-danger mt-2 p-2">{error}</div>}
                    <button
                        className="btn btn-success btn-lg mt-auto"
                        onClick={handleStartSession}
                        disabled={isLoading || !selectedQuiz || (selectedQuiz && selectedQuiz.questions_count === 0) || (quizzes.length === 0 && !error)}
                    >
                        {isLoading ? (
                             <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...</>
                         ) : (
                             'Start Session'
                         )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- How It Works Component ---
/**
 * Component that explains how the quiz sessions work.
 * 
 * Provides a step-by-step guide on how to host, share, join, and play
 * quiz sessions in the application.
 * 
 * @returns {JSX.Element} The rendered how-it-works section
 */
export const HowItWorksSection = () => (
    <div className="col-12 mb-4">
        <div className="card border-light-subtle shadow-sm">
            <div className="card-body p-lg-4 p-3">
                <h5 className="card-title text-primary mb-4">
                    <i className="bi bi-info-circle-fill me-2"></i>How Aquimemni Sessions Work
                </h5>
                <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            1
                        </span>
                        <div>
                            <strong>Host:</strong> Select one of your quizzes, choose the number of teams (1 for individual, 2+ for teams), and start the session.
                        </div>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            2
                        </span>
                        <div>
                            <strong>Share:</strong> Give the unique 6-character session code to your participants. They can enter this on the home page.
                        </div>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            3
                        </span>
                        <div>
                            <strong>Join:</strong> Participants enter the code to join the session lobby. If it's a team game, they'll select their team there.
                        </div>
                    </li>
                    <li className="d-flex align-items-start">
                        <span
                            className="badge bg-primary-subtle text-primary-emphasis rounded-pill me-3 p-2"
                            style={{ fontSize: '0.9rem', minWidth: '35px', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            4
                        </span>
                        <div>
                            <strong>Play:</strong> Once everyone is ready, the host starts the quiz from the lobby, and all participants play together in real-time!
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
);

// --- Activity Feed Component ---
/**
 * Component that displays recent user activity.
 * 
 * Shows recently created quizzes and recently played quizzes.
 * Provides quick access to the user's recent quiz activities.
 * 
 * @returns {JSX.Element} The rendered activity section
 */
export const ActivitySection = () => {
    const [recentlyCreatedQuizzes, setRecentlyCreatedQuizzes] = useState([]);
    const [recentlyPlayedQuizzes, setRecentlyPlayedQuizzes] = useState([]);
    const [isLoadingCreated, setIsLoadingCreated] = useState(true);
    const [isLoadingPlayed, setIsLoadingPlayed] = useState(true);
    const [createdError, setCreatedError] = useState('');
    const [playedError, setPlayedError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentQuizzes = async () => {
            setIsLoadingCreated(true);
            setCreatedError('');
            try {
                const response = await fetch('/api/quizzes', { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Failed to fetch quizzes');
                }
                const data = await response.json();
                // Take only the 5 most recent quizzes
                setRecentlyCreatedQuizzes(data.slice(0, 5));
            } catch (err) {
                console.error('Error fetching recent quizzes:', err);
                setCreatedError('Failed to load recent quizzes');
            } finally {
                setIsLoadingCreated(false);
            }
        };

        const fetchRecentlyPlayedQuizzes = async () => {
            setIsLoadingPlayed(true);
            setPlayedError('');
            try {
                const response = await fetch('/api/recently-played-quizzes', { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Failed to fetch recently played quizzes');
                }
                const data = await response.json();
                setRecentlyPlayedQuizzes(data);
            } catch (err) {
                console.error('Error fetching recently played quizzes:', err);
                setPlayedError('Failed to load recently played quizzes');
            } finally {
                setIsLoadingPlayed(false);
            }
        };

        fetchRecentQuizzes();
        fetchRecentlyPlayedQuizzes();
    }, []);

    /**
     * Formats a date string into a human-readable format.
     * 
     * @param {string} dateString - The ISO date string to format
     * @returns {string} The formatted date string
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (err) {
            return 'Invalid date';
        }
    };

    /**
     * Navigates to the appropriate page when a recently played quiz is clicked.
     * 
     * @param {Object} quiz - The quiz object that was clicked
     */
    const handlePlayedQuizClick = (quiz) => {
        // If the session has a code, navigate to the session results
        if (quiz.session_code) {
            navigate(`/session/results/${quiz.session_code}`);
        } else {
            // Otherwise, navigate to the quiz details
            navigate(`/quiz/${quiz.quiz_id}`);
        }
    };

    return (
        <div className="col-12 mb-4">
            <div className="card border-light-subtle shadow-sm">
                <div className="card-body p-lg-4 p-3">
                    <h5 className="card-title text-primary mb-3">
                        <i className="bi bi-lightning-charge-fill me-2"></i>Quick Menu
                    </h5>

                    {/* Recently Created Quizzes Section */}
                    <h6 className="mt-4 mb-3 border-bottom pb-2">
                        <i className="bi bi-pencil-square me-2"></i>Recently Created Quizzes
                    </h6>

                    {isLoadingCreated ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading recent quizzes...</span>
                        </div>
                    ) : createdError ? (
                        <div className="alert alert-danger py-2">{createdError}</div>
                    ) : recentlyCreatedQuizzes.length > 0 ? (
                        <ul className="list-group list-group-flush">
                            {recentlyCreatedQuizzes.map(quiz => (
                                <li
                                    key={quiz.id}
                                    className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                >
                                    <div className="d-flex align-items-center">
                                        <span className="me-3 p-2 rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                            <i className="bi bi-question-circle fs-5"></i>
                                        </span>
                                        <div>
                                            <div className="fw-medium">{quiz.name}</div>
                                            <small className="text-muted">{quiz.questions_count} questions</small>
                                        </div>
                                    </div>
                                    <small className="text-muted">{formatDate(quiz.created_at)}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted text-center py-3">You haven't created any quizzes yet.</p>
                    )}

                    {/* Recently Played Quizzes Section */}
                    <h6 className="mt-4 mb-3 border-bottom pb-2">
                        <i className="bi bi-controller me-2"></i>Recently Played Quizzes
                    </h6>

                    {isLoadingPlayed ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading recently played quizzes...</span>
                        </div>
                    ) : playedError ? (
                        <div className="alert alert-danger py-2">{playedError}</div>
                    ) : recentlyPlayedQuizzes.length > 0 ? (
                        <ul className="list-group list-group-flush">
                            {recentlyPlayedQuizzes.map(quiz => (
                                <li
                                    key={quiz.session_id}
                                    className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handlePlayedQuizClick(quiz)}
                                >
                                    <div className="d-flex align-items-center">
                                        <span className="me-3 p-2 rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                            <i className="bi bi-controller fs-5"></i>
                                        </span>
                                        <div>
                                            <div className="fw-medium">{quiz.quiz_name}</div>
                                            <small className="text-muted">
                                                Score: {quiz.score} {quiz.is_team_mode && quiz.team_number && `• Team ${quiz.team_number}`}
                                            </small>
                                        </div>
                                    </div>
                                    <small className="text-muted">{formatDate(quiz.played_at)}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted py-3">
                            <i className="bi bi-joystick display-4 mb-3 d-block text-primary-emphasis opacity-50"></i>
                            <p className="mb-2">No recently played quizzes.</p>
                            <p className="small">
                                Join quiz sessions to see them appear here.
                            </p>
                            <button 
                                className="btn btn-outline-primary btn-sm mt-2"
                                onClick={() => navigate('/quiz-maker')}
                            >
                                <i className="bi bi-plus-circle me-1"></i> Create a Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
/**
 * Main content component that combines all sections for the home page.
 * 
 * Assembles the JoinSessionSection, StartQuizSection, HowItWorksSection,
 * and ActivitySection components into a complete layout for the home page.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Optional child components to render
 * @returns {JSX.Element} The rendered main content area
 */
export const Main = ({ children }) => (
    <main className="px-md-4 py-3">
        <div className="container-fluid">
            <div className="row">
                <JoinSessionSection />
                <StartQuizSection />
                <HowItWorksSection />
                <ActivitySection />
                {children}
            </div>
        </div>
    </main>
);
