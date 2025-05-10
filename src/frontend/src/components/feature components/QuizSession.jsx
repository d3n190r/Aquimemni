// src/frontend/src/components/feature components/QuizSession.jsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import QuizSimulator from './QuizSimulator';
import 'bootstrap-icons/font/bootstrap-icons.css';

function QuizSession() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [sessionInfo, setSessionInfo] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Controls initial loading indicator
    const [error, setError] = useState('');
    const [joinError, setJoinError] = useState('');
    const [startError, setStartError] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const pollIntervalRef = useRef(null); // Ref to store interval ID
    const isMountedRef = useRef(true); // Ref to track mount status for async operations

    // --- Fetch Current User ---
    // This function should be stable as `navigate` is stable.
    const fetchCurrentUser = useCallback(async () => {
        console.log("Fetching current user...");
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (!isMountedRef.current) return null; // Check if component is still mounted

            if (response.ok) {
                const userData = await response.json();
                console.log("Current user fetched:", userData.username);
                setCurrentUser(userData);
                return userData;
            } else {
                console.error("Failed to fetch profile, status:", response.status);
                navigate('/login');
            }
        } catch (err) {
            if (!isMountedRef.current) return null;
            console.error("Network error fetching current user:", err);
            setError('Could not verify user session.');
            navigate('/login');
        }
        return null;
    }, [navigate]); // Dependency: navigate (stable)

    // --- Fetch Session Data (Session Info + Participants) ---
    // useCallback dependencies are stable: `code` (from URL), `navigate`
    const fetchData = useCallback(async (user) => {
        if (!user || !code || !isMountedRef.current) return; // Added mount check
        console.log("fetchData called for user:", user.username);

        let currentSessionData = null; // To store session data within this scope

        try {
            // Fetch session info
            const sessionRes = await fetch(`/api/sessions/${code}`, { credentials: 'include' });
             if (!isMountedRef.current) return;

            if (!sessionRes.ok) {
                const errText = await sessionRes.text(); // Get error text
                console.error("Error fetching session info:", sessionRes.status, errText);
                if (sessionRes.status === 404) {
                    setError(`Session "${code}" not found or ended.`);
                } else {
                    setError(`Error fetching session: ${sessionRes.status}`);
                }
                // Stop polling on error
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setIsLoading(false); // Ensure loading stops on error
                return; // Stop fetching
            }
            currentSessionData = await sessionRes.json(); // Store fetched data
            console.log("Session data fetched:", currentSessionData);
             if (!isMountedRef.current) return;
            setSessionInfo(currentSessionData); // Update state

            // --- If session started, no need for participants, stop polling ---
            if (currentSessionData.started) {
                console.log("Session already started, stopping poll.");
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // Let the main component render QuizSimulator based on state update
                return; // Exit fetchData
            }

            // --- Session not started, fetch participants ---
            const participantsRes = await fetch(`/api/sessions/${code}/participants`, { credentials: 'include' });
            if (!isMountedRef.current) return;

            if (!participantsRes.ok) {
                console.error("Error fetching participants:", participantsRes.status);
                // Handle participant fetch error (e.g., show partial data?)
                 // Avoid overwriting a more critical session error
                if (!error) setError("Could not update participant list.");
            } else {
                const participantsData = await participantsRes.json();
                console.log("Participants fetched:", participantsData.length);
                 if (!isMountedRef.current) return;
                setParticipants(participantsData);

                // Update join status/team based on fresh participant data
                const currentUserParticipant = participantsData.find(p => p.user_id === user.id);
                if (currentUserParticipant) {
                    setIsJoined(true);
                    setSelectedTeam(currentUserParticipant.team_number ? String(currentUserParticipant.team_number) : '');
                } else {
                    setIsJoined(false);
                    setSelectedTeam('');
                }
                setError(''); // Clear previous non-critical errors if fetches succeed
            }

        } catch (err) {
             if (!isMountedRef.current) return;
            console.error("Error inside fetchData:", err);
            if (!error) setError('Failed to fetch session data.');
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } finally {
            // --- Only set loading to false on the *initial* fetch ---
            // We know it's initial if `isLoading` is currently true
             // This check should only happen once after the first successful or failed fetch attempt
             // This logic is moved to the initial useEffect hook for clarity.
        }
    }, [code, navigate, error]); // Added 'error' dependency back cautiously, monitor if it causes loops

    // --- Effect for Initial Load ---
    useEffect(() => {
        isMountedRef.current = true;
        console.log("QuizSession Mount/Code Change - Initial Load Effect");
        setIsLoading(true); // Start loading indicator
        setError(''); // Clear errors on mount/code change

        let didCancel = false; // Flag for cleanup

        const initialize = async () => {
            const user = await fetchCurrentUser();
            if (user && !didCancel) {
                await fetchData(user); // Perform initial fetch
                 // Stop loading indicator *after* the first fetch attempt completes
                if (isMountedRef.current && !didCancel) {
                    setIsLoading(false);
                }
            } else if (!didCancel) {
                // If user fetch failed or component unmounted during fetch
                 if (isMountedRef.current) {
                    setIsLoading(false); // Stop loading if user fetch failed but component still mounted
                 }
            }
        };

        initialize();

        // Cleanup function
        return () => {
            console.log("QuizSession Unmount Cleanup - Initial Load Effect");
            isMountedRef.current = false;
            didCancel = true;
            // Clear interval if it was somehow started early
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
        // Dependencies: fetchCurrentUser (stable), fetchData (stable)
        // `code` change triggers remount via React Router, restarting this effect.
    }, [fetchCurrentUser, fetchData]); // Removed code, router handles remount

    // --- Effect for Managing Polling ---
    useEffect(() => {
        console.log("Polling Effect Check:", { isLoading, hasCurrentUser: !!currentUser, hasSessionInfo: !!sessionInfo, isStarted: sessionInfo?.started });

        // Clear previous interval unconditionally before deciding to set a new one
        if (pollIntervalRef.current) {
            console.log("Clearing existing interval...");
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        // Conditions to START polling:
        // 1. Initial loading is finished (`!isLoading`)
        // 2. We have the current user (`currentUser` is not null)
        // 3. We have session info (`sessionInfo` is not null)
        // 4. The session is NOT started (`!sessionInfo.started`)
        if (!isLoading && currentUser && sessionInfo && !sessionInfo.started) {
            console.log("Starting polling...");
            pollIntervalRef.current = setInterval(() => {
                console.log("Polling...");
                // No need to check mount status here, interval cleared on unmount
                fetchData(currentUser); // Pass current user
            }, 5000); // Poll every 5 seconds
        } else {
            console.log("Conditions not met for polling OR session started. Polling stopped/not started.");
        }

        // Cleanup: Clear interval if dependencies change or component unmounts
        return () => {
            if (pollIntervalRef.current) {
                console.log("Clearing poll interval in Polling Effect cleanup.");
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null; // Explicitly nullify
            }
        };
        // Dependencies: Only re-evaluate when these specific values change.
        // `sessionInfo?.started` is key. `fetchData` is stable due to useCallback.
    }, [isLoading, currentUser, sessionInfo?.started, fetchData]);


    // --- Event Handlers (Join, Start, Copy) ---

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        if (!sessionInfo || !currentUser || isJoining) return;
        setJoinError('');
        setIsJoining(true);

        let teamNumberToSend = null;
        if (sessionInfo.is_team_mode) {
            if (!selectedTeam) {
                setJoinError(`Please select a team (1-${sessionInfo.num_teams}).`);
                setIsJoining(false);
                return;
            }
            teamNumberToSend = parseInt(selectedTeam, 10);
            if (isNaN(teamNumberToSend) || teamNumberToSend < 1 || teamNumberToSend > sessionInfo.num_teams) {
                 setJoinError(`Invalid team number. Choose 1-${sessionInfo.num_teams}.`);
                 setIsJoining(false);
                 return;
            }
        }

        try {
            const response = await fetch(`/api/sessions/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_number: teamNumberToSend }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Join/Switch result:', result.message);
                setIsJoined(true);
                // Manually trigger data refresh instead of waiting for poll
                await fetchData(currentUser);
            } else {
                setJoinError(result.error || 'Failed to join/switch team.');
            }
        } catch (err) {
            console.error("Network error joining/switching team:", err);
            setJoinError('A network error occurred.');
        } finally {
             if (isMountedRef.current) setIsJoining(false);
        }
    };

    const handleStartQuiz = async () => {
        // Ensure we have sessionInfo and currentUser before proceeding
        if (!sessionInfo || !currentUser || isStarting || currentUser.id !== sessionInfo.host_id) {
            console.warn("Start quiz conditions not met:", { hasSession: !!sessionInfo, hasUser: !!currentUser, isStarting, isHost: currentUser?.id === sessionInfo?.host_id });
            return;
        }
        setStartError('');
        setIsStarting(true); // Keep showing "Starting..."

        try {
            // --- Step 1: Tell the backend to start the session ---
            const response = await fetch(`/api/sessions/${code}/start`, {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (response.ok) {
                console.log('Backend start successful:', result.message);

                // --- Step 2: Stop regular polling ---
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    console.log("Polling stopped.");
                }

                // --- Step 3: Immediately fetch the final session state ---
                // This ensures we have started=true AND the quiz_id before transitioning.
                console.log("Immediately fetching updated session data after start...");
                // We pass 'currentUser' which should still be loaded from the initial fetch.
                // If there's a chance currentUser could be null here, more robust error handling is needed.
                if (currentUser && isMountedRef.current) {
                    // Call fetchData, which will update sessionInfo state and trigger the re-render
                    await fetchData(currentUser);
                    console.log("Immediate fetch completed. State should be updated.");
                    // At this point, the component should re-render.
                    // The check `if (sessionInfo.started)` should become true,
                    // and it should render QuizSimulator with the correct quiz_id from the fetched data.
                } else {
                     // This case indicates a problem with the component's state (user missing or unmounted)
                    console.error("Cannot perform immediate fetch: currentUser missing or component unmounted.");
                    setStartError("Failed to update session state after starting. Please refresh.");
                    if (isMountedRef.current) setIsStarting(false); // Allow retry? Or navigate away?
                }

            } else {
                // --- Handle backend start failure ---
                console.error("Backend failed to start session:", result.error);
                setStartError(result.error || 'Failed to start quiz on the server.');
                 // Re-enable the button if starting failed
                 if (isMountedRef.current) setIsStarting(false);
            }
        } catch (err) {
            // --- Handle network or other errors during start/fetch ---
            console.error("Error during start quiz process:", err);
            setStartError('A network error occurred while trying to start.');
             // Re-enable button on error
             if (isMountedRef.current) setIsStarting(false);
        }
        // Note: We don't explicitly set isStarting back to false on success,
        // because the component should transition to QuizSimulator, effectively unmounting this view.
        // If the immediate fetch fails, we set it back to false above.
    };

    const copyCodeToClipboard = async () => {
        if (!sessionInfo?.code) {
            setCopySuccess('No Code'); // Should ideally not happen if button is rendered
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2500);
            return;
        }

        // Check for navigator.clipboard support first
        if (!navigator.clipboard) {
            console.error('Clipboard API not available in this browser or context.');
            setCopySuccess('No API'); // Indicates browser doesn't support it or context is insecure
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000);
            // Consider alerting the user or providing manual copy instructions here
            // e.g., alert("Copying to clipboard is not supported or allowed in this browser/context. Please copy the code manually.");
            return;
        }

        try {
            await navigator.clipboard.writeText(sessionInfo.code);
            setCopySuccess('Copied!');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2000); // Shorter success message
        } catch (err) {
            console.error('Failed to copy code to clipboard: ', err);
            let errorMsg = 'Error!'; // Default error message

            if (err.name === 'NotAllowedError') {
                errorMsg = 'Blocked'; // More specific for permission/focus issues
                // This error can occur if:
                // 1. The document is not focused.
                // 2. The "clipboard-write" permission is denied by the user.
                // 3. The document is not in a secure context (HTTPS or localhost).
                console.warn("Clipboard write was not allowed. Possible reasons: document not focused, permission denied, or not a secure context (HTTPS/localhost).");
                // You could provide more specific instructions to the user here.
                // e.g., alert("Could not copy. Please ensure the browser tab is active and you've allowed clipboard permissions. This feature requires a secure connection (HTTPS).");
            } else if (err.name === 'SecurityError') {
                 errorMsg = 'Security'; // For other security-related restrictions
            }
            // Other potential errors: 'DataError', 'UnknownError'

            setCopySuccess(errorMsg);
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000); // Keep error messages a bit longer
        }
    };

    // --- Render Logic ---

    // 1. Initial Loading State
    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Session...</p>
            </div>
        );
    }

    // 2. Error State (Session not found, fetch errors)
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
                <div className="text-center mt-3">
                    <button className="btn btn-secondary" onClick={() => navigate('/home')}>
                        <i className="bi bi-house-door me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // 3. Session Info missing after load (should be rare)
    if (!sessionInfo) {
         return <div className="container mt-5"><div className="alert alert-warning text-center">Could not load session information. Please refresh or go back home.</div> <div className="text-center mt-3"><button className="btn btn-secondary" onClick={() => navigate('/home')}><i className="bi bi-house-door me-1"></i> Back to Home</button></div></div>;
    }

    // 4. Session Started -> Render Simulator
    if (sessionInfo.started) {
        const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;
        console.log("Rendering QuizSimulator, isHost:", isCurrentUserHost);
        return <QuizSimulator quizId={sessionInfo.quiz_id} sessionCode={code} isHost={isCurrentUserHost} />;
    }

    // 5. Render Lobby View
    const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;

    const renderTeamSelection = () => {
        if (isCurrentUserHost || !sessionInfo.is_team_mode) return null;
        const teamOptions = Array.from({ length: sessionInfo.num_teams }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>Team {i + 1}</option>
        ));
        return (
            <div className="mb-3">
                <label htmlFor="teamSelect" className="form-label fw-bold">Select Your Team:</label>
                <select id="teamSelect" className="form-select form-select-lg" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} disabled={isJoining} >
                    <option value="" disabled>-- Choose a Team --</option>
                    {teamOptions}
                </select>
            </div>
        );
    };

    // --- Lobby JSX ---
    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    {/* Session Header Card */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <h4 className="mb-0">Quiz Session Lobby</h4>
                            <div className="d-flex align-items-center bg-primary p-2 rounded">
                                <span className="me-2 text-white-50">Code:</span>
                                <strong className="bg-light text-primary px-2 py-1 rounded me-2 user-select-all font-monospace" style={{ fontSize: '1.1rem' }} >
                                    {sessionInfo.code}
                                </strong>
                                <button className={`btn btn-sm ${copySuccess === 'Copied!' ? 'btn-success' : (copySuccess === 'Error' ? 'btn-danger' : 'btn-outline-light')}`} onClick={copyCodeToClipboard} title="Copy session code" disabled={!!copySuccess} style={{ width: '80px' }} >
                                    {copySuccess ? copySuccess : <><i className="bi bi-clipboard me-1"></i> Copy</>}
                                </button>
                            </div>
                        </div>
                        <div className="card-body text-center">
                            <h5 className="card-title mb-1">Quiz: <span className="text-primary">{sessionInfo.quiz_name || 'Loading...'}</span></h5>
                            <p className="card-text mb-3">Hosted by: <strong>{sessionInfo.host_username || '...'}</strong></p>
                            <p className="text-muted fst-italic">Waiting for the host to start the quiz...</p>
                            {sessionInfo.is_team_mode && <p>Playing in <strong>{sessionInfo.num_teams} teams</strong> mode.</p>}

                            {/* Join/Switch Team Section (Participants only) */}
                            {!isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    {renderTeamSelection()}
                                    <button className="btn btn-success btn-lg" onClick={handleJoinTeam} disabled={isJoining || (sessionInfo.is_team_mode && !selectedTeam)} >
                                        {isJoining ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...</> : ( isJoined ? (sessionInfo.is_team_mode ? 'Switch Team' : 'Rejoin Session') : (sessionInfo.is_team_mode ? 'Join Selected Team' : 'Join Session') )}
                                    </button>
                                    {joinError && <div className="alert alert-warning mt-3 p-2">{joinError}</div>}
                                </div>
                            )}

                            {/* Start Quiz Button (Host only) */}
                            {isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    <button className="btn btn-warning btn-lg px-5" onClick={handleStartQuiz} disabled={isStarting || participants.length === 0} >
                                        {isStarting ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Starting...</> : 'Start Quiz!' }
                                    </button>
                                    {participants.length === 0 && !isStarting && <p className="text-muted mt-2 small">Waiting for participants to join...</p>}
                                    {startError && <div className="alert alert-danger mt-3 p-2">{startError}</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participants List Card */}
                    <div className="card shadow-sm">
                         <div className="card-header bg-light">
                            <h5 className="mb-0">Participants ({participants.length})</h5>
                        </div>
                        <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {participants.length === 0 ? (
                                <li className="list-group-item text-muted text-center fst-italic">No one has joined yet...</li>
                            ) : (
                                participants
                                    .sort((a, b) => {
                                        if (a.user_id === sessionInfo.host_id) return -1;
                                        if (b.user_id === sessionInfo.host_id) return 1;
                                        return a.username.localeCompare(b.username);
                                    })
                                    .map((p) => (
                                        <li key={p.user_id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <img src={`/avatars/avatar${p.avatar || 1}.png`} alt="" width="35" height="35" className="rounded-circle me-2 shadow-sm" />
                                                <span className={`fw-medium ${p.user_id === currentUser?.id ? 'text-primary' : ''}`}>
                                                    {p.username}
                                                    {p.user_id === sessionInfo.host_id && <span className="badge bg-dark text-white rounded-pill ms-2 small">Host</span>}
                                                    {p.user_id === currentUser?.id && !isCurrentUserHost && <span className="text-muted ms-1 small">(You)</span>}
                                                </span>
                                            </div>
                                            {sessionInfo.is_team_mode && p.team_number && (
                                                <span className={`badge bg-info-subtle text-info-emphasis rounded-pill fs-6`}>Team {p.team_number}</span>
                                            )}
                                        </li>
                                    ))
                            )}
                        </ul>
                    </div>
                    {/* Back to Home Button */}
                     <div className="text-center mt-4">
                         <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>
                             <i className="bi bi-house-door me-1"></i> Back to Home
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizSession;