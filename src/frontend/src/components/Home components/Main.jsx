// src/frontend/src/components/Home components/Main.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Assuming you use react-select for dropdown

// --- Helper Components ---

// Join Session Component (blijft ongewijzigd, hier voor context)
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

// Start/Host Session Component (blijft ongewijzigd, hier voor context)
export const StartQuizSection = () => {
    const navigate = useNavigate();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [numTeams, setNumTeams] = useState('1');

    const fetchQuizzes = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/quizzes', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                const validQuizzes = data.filter(q => q.questions_count > 0);
                setQuizzes(validQuizzes.map(q => ({
                    value: q.id,
                    label: q.name,
                    questions_count: q.questions_count
                })) || []);
                if (data.length > 0 && validQuizzes.length === 0) {
                    setError("All your quizzes have 0 questions. Add questions to host a session.");
                }
            } else {
                 const errData = await response.json().catch(() => ({}));
                 throw new Error(errData.error || 'Failed to fetch quizzes');
            }
        } catch (err) {
            console.error("Error fetching quizzes:", err);
            setError('Could not load your quizzes.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

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
                            isLoading={isLoading && quizzes.length === 0}
                            isDisabled={isLoading || quizzes.length === 0}
                            placeholder={isLoading ? "Loading quizzes..." : (quizzes.length === 0 ? "No quizzes with questions" : "Choose a quiz...")}
                            noOptionsMessage={() => isLoading ? 'Loading...' : 'No quizzes with questions available'}
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
                             disabled={isLoading}
                         />
                         <div className="form-text">
                             Enter 1 for individual play, or 2 or more for team mode.
                         </div>
                     </div>
                    {error && <div className="alert alert-danger mt-2 p-2">{error}</div>}
                    <button
                        className="btn btn-success btn-lg mt-auto"
                        onClick={handleStartSession}
                        disabled={isLoading || !selectedQuiz || (selectedQuiz && selectedQuiz.questions_count === 0)}
                    >
                        {isLoading ? (
                             <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Starting...</>
                         ) : (
                             'Start Session'
                         )}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- How It Works Component (VERNIEUWD) ---
export const HowItWorksSection = () => (
    <div className="col-12 mb-4">
        <div className="card border-light-subtle shadow-sm"> {/* Lichtere rand, subtiele schaduw */}
            <div className="card-body p-lg-4 p-3"> {/* Meer padding, vooral op grotere schermen */}
                <h5 className="card-title text-primary mb-4"> {/* Consistent met andere titels */}
                    <i className="bi bi-info-circle-fill me-2"></i>How Aquimemni Sessions Work
                </h5>
                {/* Gebruik list-unstyled voor meer controle over styling */}
                <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-start">
                        {/* Badge voor stapnummer */}
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

// --- Activity Feed Component (VERNIEUWD) ---
export const ActivitySection = () => {
    // Placeholder voor recente activiteit - haal data op van backend indien nodig
    const recentActivities = [
        // Voorbeeld items (vervang met echte data)
        // { id: 1, type: 'hosted', text: "You hosted 'History Buffs'", time: "2h ago", icon: "bi-megaphone-fill text-success", link: "/session/XYZ123/results" },
        // { id: 2, type: 'joined', text: "Joined session 'FUNQUIZ'", time: "1d ago", icon: "bi-joystick text-primary", link: "/session/ABC789/results" },
        // { id: 3, type: 'created', text: "Created quiz 'Science Facts'", time: "3d ago", icon: "bi-plus-square-fill text-info", link: "/quiz/123" },
    ];
    const navigate = useNavigate();

    return (
        <div className="col-12 mb-4">
            <div className="card border-light-subtle shadow-sm"> {/* Lichtere rand, subtiele schaduw */}
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
        <div className="container-fluid"> {/* Gebruik container-fluid voor betere padding controle binnen de main */}
            <div className="row">
                {/* Sections for Joining and Starting */}
                <JoinSessionSection />
                <StartQuizSection />

                {/* Other sections like How It Works or Activity Feed */}
                <HowItWorksSection />
                <ActivitySection />

                {/* Render any additional children passed */}
                {children}
            </div>
        </div>
    </main>
);