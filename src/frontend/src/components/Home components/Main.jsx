// src/frontend/src/components/Home components/Main.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Assuming you use react-select for dropdown

// --- Helper Components ---

// Join Session Component
export const JoinSessionSection = () => {
    const navigate = useNavigate();
    const [sessionCode, setSessionCode] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false); // Loading state

    const handleJoin = async () => {
        setError('');
        if (!sessionCode.trim()) {
            setError('Please enter a session code.');
            return;
        }
        // Optional: Basic validation if code looks right (e.g., length, characters)
        if (sessionCode.trim().length !== 6) {
             setError('Session code must be 6 characters long.');
             return;
        }

        setIsChecking(true); // Start loading
        try {
            // Check if session exists before navigating
            const response = await fetch(`/api/sessions/${sessionCode.trim()}`, {credentials: 'include'}); // Added credentials
            if (response.ok) {
                navigate(`/session/${sessionCode.trim()}`);
            } else if (response.status === 404) {
                setError(`Session with code "${sessionCode.trim()}" not found.`);
            } else {
                 const errData = await response.json().catch(() => ({})); // Try parsing error
                setError(errData.error || 'Could not verify session code. Please try again.');
            }
        } catch (err) {
            console.error("Error checking session code:", err);
            setError('A network error occurred.');
        } finally {
            setIsChecking(false); // Stop loading
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
                            placeholder="ABCXYZ" // Example placeholder
                            value={sessionCode}
                            onChange={(e) => setSessionCode(e.target.value.toUpperCase().trim())} // Force uppercase and trim
                            maxLength="6" // Assuming 6-character codes
                            aria-label="Session Code"
                            disabled={isChecking} // Disable input while checking
                        />
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleJoin}
                            disabled={isChecking || !sessionCode || sessionCode.length !== 6} // Disable button appropriately
                        >
                            {isChecking ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Join'}
                        </button>
                    </div>
                     {/* Display error below the input group */}
                    {error && <div className="text-danger small mt-1">{error}</div>}
                </div>
            </div>
        </div>
    );
};

// Start/Host Session Component
export const StartQuizSection = () => {
    const navigate = useNavigate();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Combined loading state
    const [error, setError] = useState('');
    // --- State for number of teams ---
    const [numTeams, setNumTeams] = useState('1'); // Default to '1' (individual)

    // Fetch user's quizzes
    const fetchQuizzes = useCallback(async () => { // useCallback to avoid re-creating function on every render
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/quizzes', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                // Filter out quizzes with 0 questions before setting state
                const validQuizzes = data.filter(q => q.questions_count > 0);
                setQuizzes(validQuizzes.map(q => ({
                    value: q.id,
                    label: q.name,
                    questions_count: q.questions_count // Keep count for validation
                })) || []);
                if (data.length > 0 && validQuizzes.length === 0) {
                    setError("All your quizzes have 0 questions. Add questions to host a session.");
                }
                 if (data.length === 0) {
                    // Optional: Set error or specific message if no quizzes exist at all
                     // setError("You haven't created any quizzes yet.");
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
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]); // Include fetchQuizzes in dependency array

    const handleStartSession = async () => {
        if (!selectedQuiz) {
            setError('Please select a quiz to host.');
            return;
        }
        // This check is now redundant if quizzes are pre-filtered, but keep as safeguard
        if (selectedQuiz.questions_count === 0) {
             setError('Cannot host a quiz with no questions.');
             return;
        }

        setError('');
        setIsLoading(true); // Start loading for session creation

        // --- Validate numTeams ---
        const teamCount = parseInt(numTeams, 10);
        let isTeamMode = false;
        if (isNaN(teamCount) || teamCount < 1) {
             setError('Number of teams must be a positive number (1 or more).');
             setIsLoading(false);
             return;
        }
        if (teamCount > 1) {
            isTeamMode = true;
        }


        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: selectedQuiz.value,
                    num_teams: teamCount // Send the validated number of teams
                    // Backend now determines team_mode based on num_teams > 1
                 }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                // Navigate to the lobby, passing host flag
                navigate(`/session/${data.code}`); // The QuizSession component will fetch details including host status
            } else {
                const errData = await response.json().catch(() => ({})); // Try parsing error
                throw new Error(errData.error || 'Failed to create session');
            }
        } catch (err) {
            console.error("Error creating session:", err);
            setError(err.message || 'Could not create session.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px', // Match form-control-lg height
             boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none', // Add focus style
             borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
             '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' } // Optional hover effect
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 5 // Ensure dropdown appears above other elements
        }),
         option: (provided, state) => ({
             ...provided,
             backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
             color: state.isSelected ? 'white' : '#212529',
             ':active': {
                 backgroundColor: !state.isDisabled ? (state.isSelected ? '#0b5ed7' : '#dee2e6') : undefined,
             },
             cursor: 'pointer' // Indicate clickable options
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

                     {/* Quiz Selection Dropdown */}
                    <div className="mb-3">
                        <label htmlFor="quizSelectHost" className="form-label">Select Quiz:</label>
                        <Select
                            id="quizSelectHost"
                            options={quizzes}
                            value={selectedQuiz}
                            onChange={setSelectedQuiz}
                            isLoading={isLoading && quizzes.length === 0} // Show loading only initially or when fetching
                            isDisabled={isLoading || quizzes.length === 0} // Disable if loading or no valid quizzes
                            placeholder={isLoading ? "Loading quizzes..." : (quizzes.length === 0 ? "No quizzes with questions" : "Choose a quiz...")}
                            noOptionsMessage={() => isLoading ? 'Loading...' : 'No quizzes with questions available'}
                            styles={selectStyles} // Apply custom styles
                            classNamePrefix="react-select" // Prefix for internal class names
                         />
                         {/* Removed redundant validation message here, handled by disabling select/button */}
                    </div>

                     {/* Number of Teams Input */}
                     <div className="mb-3">
                         <label htmlFor="numTeamsInput" className="form-label">Number of Teams:</label>
                         <input
                             type="number"
                             id="numTeamsInput"
                             className="form-control"
                             value={numTeams}
                             onChange={(e) => setNumTeams(e.target.value)}
                             min="1" // Minimum 1 team (individual)
                             step="1"
                             placeholder="e.g., 1 for individual, 2+ for teams"
                             disabled={isLoading} // Disable while creating session
                         />
                         <div className="form-text">
                             Enter 1 for individual play, or 2 or more for team mode.
                         </div>
                     </div>

                    {error && <div className="alert alert-danger mt-2 p-2">{error}</div>}

                    <button
                        className="btn btn-success btn-lg mt-auto"
                        onClick={handleStartSession}
                        // Disable if loading, no quiz selected, or selected quiz has 0 questions
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


// How It Works Component (Example - Keep or modify)
export const HowItWorksSection = () => (
    <div className="col-12 mb-4">
        <div className="card shadow-sm">
            <div className="card-body">
                <h5 className="card-title text-info mb-3"><i className="bi bi-info-circle me-2"></i>How It Works</h5>
                <ol className="list-group list-group-numbered list-group-flush">
                    <li className="list-group-item border-0 ps-0"><strong>Host:</strong> Select one of your quizzes and choose the number of teams (1+).</li>
                    <li className="list-group-item border-0 ps-0"><strong>Share:</strong> Give the unique 6-character session code to participants.</li>
                    <li className="list-group-item border-0 ps-0"><strong>Join:</strong> Participants enter the code to join the lobby (and select team if applicable).</li>
                     <li className="list-group-item border-0 ps-0"><strong>Play:</strong> Host starts the quiz, and everyone plays together in real-time!</li>
                </ol>
            </div>
        </div>
    </div>
);

// Activity Feed Component (Placeholder - Fetch real data if implemented)
export const ActivitySection = () => {
    // Placeholder for recent activity - fetch data from backend if needed
    const recentActivities = [
        // { id: 1, text: "You hosted 'History Buffs'", time: "2h ago" },
        // { id: 2, text: "Joined session 'FUNQUIZ'", time: "1d ago" },
        // { id: 3, text: "Created quiz 'Science Facts'", time: "3d ago" },
    ];

    return (
        <div className="col-12 mb-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title text-warning mb-3"><i className="bi bi-clock-history me-2"></i>Recent Activity</h5>
                    {recentActivities.length > 0 ? (
                        <ul className="list-group list-group-flush">
                            {recentActivities.map(activity => (
                                <li key={activity.id} className="list-group-item d-flex justify-content-between align-items-center border-0 ps-0">
                                    {activity.text}
                                    <small className="text-muted">{activity.time}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">No recent activity to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
// Add padding here to ensure content isn't stuck to the top/sides
export const Main = ({ children }) => (
    <main className="px-md-4 py-3"> {/* Added padding */}
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
    </main>
);