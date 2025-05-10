// src/frontend/src/components/Home components/Main.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

// --- Helper Components ---

// Join Session Component
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

// Start/Host Session Component
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
export const ActivitySection = () => {
    const recentActivities = [];
    const navigate = useNavigate();

    return (
        <div className="col-12 mb-4">
            <div className="card border-light-subtle shadow-sm">
                <div className="card-body p-lg-4 p-3">
                    <h5 className="card-title text-primary mb-3">
                        <i className="bi bi-activity me-2"></i>Recent Activity
                    </h5>
                    {recentActivities.length > 0 ? (
                        <ul className="list-group list-group-flush">
                            {recentActivities.map(activity => (
                                <li
                                    key={activity.id}
                                    className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2"
                                    style={ activity.link ? {cursor: 'pointer'} : {} }
                                    onClick={ activity.link ? () => navigate(activity.link) : undefined }
                                >
                                    <div className="d-flex align-items-center">
                                        <span className={`me-3 p-2 rounded-circle bg-light d-inline-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                                            <i className={`bi ${activity.icon || 'bi-bell-fill'} fs-5`}></i>
                                        </span>
                                        <span>{activity.text}</span>
                                    </div>
                                    <small className="text-muted">{activity.time}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted py-4">
                            <i className="bi bi-clock-history display-4 mb-3 d-block text-primary-emphasis"></i>
                            <p className="h5 mb-2">No recent activity yet.</p>
                            <p className="small">
                                Your hosted games, created quizzes, and joined sessions will appear here once you get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
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