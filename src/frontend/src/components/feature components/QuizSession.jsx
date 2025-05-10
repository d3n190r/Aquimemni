// src/frontend/src/components/feature components/QuizSession.jsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import QuizSimulator from './QuizSimulator';
import 'bootstrap-icons/font/bootstrap-icons.css';

function QuizSession() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [sessionInfo, setSessionInfo] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Belangrijk om te weten wie de host is in de UI
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinError, setJoinError] = useState('');
    const [startError, setStartError] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const pollIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    const fetchCurrentUser = useCallback(async () => {
        console.log("Fetching current user...");
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (!isMountedRef.current) return null;

            if (response.ok) {
                const userData = await response.json();
                console.log("Current user fetched:", userData.username);
                setCurrentUser(userData); // Sla de huidige gebruiker op in state
                return userData;
            } else {
                console.error("Failed to fetch profile, status:", response.status);
                navigate('/login');
            }
        } catch (err) {
            if (!isMountedRef.current) return null;
            console.error("Network error fetching current user:", err);
            setError('Could not verify user session. Please try logging in again.');
            navigate('/login');
        }
        return null;
    }, [navigate]);

    const fetchData = useCallback(async (user) => {
        if (!user || !code || !isMountedRef.current) {
             console.log("fetchData prerequisites not met:", {user, code, isMounted: isMountedRef.current});
             return;
        }
        console.log("fetchData called for user:", user.username, "session code:", code);

        try {
            const sessionRes = await fetch(`/api/sessions/${code}`, { credentials: 'include' });
             if (!isMountedRef.current) return;

            if (!sessionRes.ok) {
                const errText = await sessionRes.text();
                console.error("Error fetching session info:", sessionRes.status, errText);
                if (sessionRes.status === 404) {
                    setError(`Session "${code}" not found or has ended.`);
                } else {
                    setError(`Error fetching session details (Status: ${sessionRes.status}).`);
                }
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // setIsLoading(false) wordt afgehandeld in de useEffect initialize
                return;
            }
            const currentSessionData = await sessionRes.json();
            console.log("Session data fetched:", currentSessionData);
             if (!isMountedRef.current) return;
            setSessionInfo(currentSessionData);

            if (currentSessionData.started) {
                console.log("Session already started, stopping poll.");
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                return;
            }

            const participantsRes = await fetch(`/api/sessions/${code}/participants`, { credentials: 'include' });
            if (!isMountedRef.current) return;

            if (!participantsRes.ok) {
                console.error("Error fetching participants:", participantsRes.status);
                if (!error && isMountedRef.current) setError("Could not update participant list.");
            } else {
                const participantsData = await participantsRes.json();
                console.log("Participants fetched:", participantsData.length);
                 if (!isMountedRef.current) return;
                setParticipants(participantsData);

                const currentUserParticipant = participantsData.find(p => p.user_id === user.id);
                if (currentUserParticipant) {
                    setIsJoined(true);
                    setSelectedTeam(currentUserParticipant.team_number ? String(currentUserParticipant.team_number) : '');
                } else {
                    setIsJoined(false);
                    setSelectedTeam('');
                }
                 if (isMountedRef.current && error !== `Session "${code}" not found or has ended.`) setError('');
            }

        } catch (err) {
             if (!isMountedRef.current) return;
            console.error("Error inside fetchData:", err);
            if (!error && isMountedRef.current) setError('Failed to fetch session data. Please refresh.');
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    }, [code, navigate, error]); // Let op: 'error' in dependencies kan loops veroorzaken als niet goed beheerd.

    useEffect(() => {
        isMountedRef.current = true;
        console.log("QuizSession Mount/Code Change - Initial Load Effect. Code:", code);
        setIsLoading(true);
        setError('');
        setSessionInfo(null);
        setParticipants([]);

        let didCancel = false;

        const initialize = async () => {
            const user = await fetchCurrentUser(); // Haal eerst de ingelogde gebruiker op
            if (user && !didCancel) {
                await fetchData(user);
            }
            if (isMountedRef.current && !didCancel) {
                 setIsLoading(false);
            }
        };

        if (code) {
            initialize();
        } else {
            setError("No session code provided in URL.");
            setIsLoading(false);
        }

        return () => {
            console.log("QuizSession Unmount Cleanup - Initial Load Effect");
            isMountedRef.current = false;
            didCancel = true;
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [code, fetchCurrentUser, fetchData]);

    useEffect(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (!isLoading && currentUser && sessionInfo && !sessionInfo.started && isMountedRef.current) {
            console.log("Starting polling for session:", sessionInfo.code);
            pollIntervalRef.current = setInterval(() => {
                console.log("Polling...");
                if (isMountedRef.current) {
                    fetchData(currentUser);
                } else {
                    if(pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                }
            }, 5000);
        } else {
            console.log("Conditions not met for polling OR session started. Polling stopped/not started.");
        }
        return () => {
            if (pollIntervalRef.current) {
                console.log("Clearing poll interval in Polling Effect cleanup.");
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [isLoading, currentUser, sessionInfo, fetchData]);


    const handleJoinTeam = async (e) => {
        e.preventDefault();
        if (!sessionInfo || !currentUser || isJoining) return;
        setJoinError('');
        setIsJoining(true);
        let teamNumberToSend = null;
        if (sessionInfo.is_team_mode) {
            if (!selectedTeam) {
                setJoinError(`Please select a team (1-${sessionInfo.num_teams}).`);
                setIsJoining(false); return;
            }
            teamNumberToSend = parseInt(selectedTeam, 10);
            if (isNaN(teamNumberToSend) || teamNumberToSend < 1 || teamNumberToSend > sessionInfo.num_teams) {
                 setJoinError(`Invalid team number. Choose 1-${sessionInfo.num_teams}.`);
                 setIsJoining(false); return;
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
                setIsJoined(true);
                if(isMountedRef.current) await fetchData(currentUser);
            } else {
                setJoinError(result.error || 'Failed to join/switch team.');
            }
        } catch (err) {
            setJoinError('A network error occurred.');
        } finally {
             if (isMountedRef.current) setIsJoining(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!sessionInfo || !currentUser || isStarting || currentUser.id !== sessionInfo.host_id) return;
        setStartError('');
        setIsStarting(true);
        try {
            const response = await fetch(`/api/sessions/${code}/start`, { method: 'POST', credentials: 'include' });
            const result = await response.json();
            if (response.ok) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // Na het starten, fetchData opnieuw om sessionInfo.started bij te werken
                if (currentUser && isMountedRef.current) await fetchData(currentUser);
            } else {
                setStartError(result.error || 'Failed to start quiz on the server.');
                if (isMountedRef.current) setIsStarting(false);
            }
        } catch (err) {
            setStartError('A network error occurred while trying to start.');
            if (isMountedRef.current) setIsStarting(false);
        }
        // setIsStarting(false) wordt afgehandeld door de re-render naar QuizSimulator of bij error
    };

    const copyCodeToClipboard = async () => {
        if (!sessionInfo?.code) {
            setCopySuccess('No Code');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2500);
            return;
        }
        if (!navigator.clipboard) {
            setCopySuccess('No API');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000);
            return;
        }
        try {
            await navigator.clipboard.writeText(sessionInfo.code);
            setCopySuccess('Copied!');
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2000);
        } catch (err) {
            let errorMsg = 'Error!';
            if (err.name === 'NotAllowedError') errorMsg = 'Blocked';
            else if (err.name === 'SecurityError') errorMsg = 'Security';
            setCopySuccess(errorMsg);
            setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000);
        }
    };


    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 fs-5">Loading Session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                </div>
                <div className="text-center mt-3">
                    <button className="btn btn-primary" onClick={() => navigate('/home')}>
                        <i className="bi bi-house-door me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!sessionInfo) { // Fallback voor als sessionInfo nog null is na laden
         return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center">Could not load session information. Please refresh or go back home.</div>
                <div className="text-center mt-3">
                    <button className="btn btn-secondary" onClick={() => navigate('/home')}>
                        <i className="bi bi-house-door me-1"></i> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Als de sessie gestart is, render QuizSimulator
    if (sessionInfo.started) {
        const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;
        return <QuizSimulator quizId={sessionInfo.quiz_id} sessionCode={code} isHost={isCurrentUserHost} />;
    }

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

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                            <h4 className="mb-0">Quiz Session Lobby</h4>
                            <div className="d-flex align-items-center">
                                <span className="me-2 text-white-75">Code:</span>
                                <strong
                                    className="bg-light text-primary px-3 py-1 rounded-pill me-2 user-select-all font-monospace shadow-sm"
                                    style={{ fontSize: '1.1rem', letterSpacing: '1px' }}
                                >
                                    {sessionInfo.code}
                                </strong>
                                <button
                                    className={`btn btn-sm ${
                                        copySuccess === 'Copied!' ? 'btn-light text-success' :
                                        (copySuccess && copySuccess !== '') ? 'btn-danger' : 
                                        'btn-outline-light'
                                    }`}
                                    onClick={copyCodeToClipboard}
                                    title={
                                        copySuccess === 'Copied!' ? 'Code copied to clipboard!' :
                                        (copySuccess === 'No API') ? 'Clipboard API not available.' :
                                        (copySuccess === 'Blocked') ? 'Copying blocked by browser.' :
                                        (copySuccess && copySuccess !== '') ? `Copy failed: ${copySuccess}` :
                                        'Copy session code'
                                    }
                                    disabled={!!copySuccess}
                                    style={{ minWidth: '85px', textAlign: 'center', fontWeight: '500' }}
                                >
                                    {copySuccess ? copySuccess : <><i className="bi bi-clipboard me-1"></i> Copy</>}
                                </button>
                            </div>
                        </div>
                        <div className="card-body text-center p-4">
                            {/* AANGEPAST BLOK VOOR QUIZ INFO */}
                            <h4 className="card-title mb-2 fs-4">
                                <span className="text-primary fw-bold">{sessionInfo.quiz_name || 'Loading Quiz...'}</span>
                            </h4>
                            {sessionInfo.quiz_maker_username && sessionInfo.quiz_maker_username !== "Unknown Maker" && (
                                <p className="card-text text-muted small mb-1" style={{fontSize: '0.9rem'}}>
                                    Quiz created by:{' '}
                                    <Link to={`/profile/view/${sessionInfo.quiz_maker_id}`} className="fw-medium text-decoration-none text-info-emphasis">
                                        {sessionInfo.quiz_maker_avatar && <img src={`/avatars/avatar${sessionInfo.quiz_maker_avatar || 1}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>}
                                        {sessionInfo.quiz_maker_username}
                                    </Link>
                                </p>
                            )}
                            <p className="card-text mb-3 fs-6">
                                Session hosted by:{' '}
                                <Link to={`/profile/view/${sessionInfo.host_id}`} className="fw-bold text-decoration-none text-success-emphasis">
                                    {/* Toon avatar van de host (currentUser is de ingelogde user, sessionInfo.host is de host van de sessie) */}
                                    {/* Als je de avatar van de host specifiek wilt, moet die ook via sessionInfo komen, of currentUser checken als die de host is. */}
                                    <img src={`/avatars/avatar${ isCurrentUserHost ? currentUser?.avatar : (sessionInfo.host_avatar || 1)}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>
                                    {sessionInfo.host_username || '...'}
                                </Link>
                            </p>
                            {/* EINDE AANGEPAST BLOK */}

                            <hr className="my-3" />

                            <p className="text-muted fst-italic mb-2">Waiting for the host to start the quiz...</p>
                            {sessionInfo.is_team_mode && <p className="mb-3"><span className="badge bg-info-subtle text-info-emphasis fs-6 py-2 px-3 rounded-pill">Playing in <strong>{sessionInfo.num_teams} teams</strong> mode</span></p>}

                            {!isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    {renderTeamSelection()}
                                    <button className="btn btn-success btn-lg w-100 py-2 fs-5 shadow-sm" onClick={handleJoinTeam} disabled={isJoining || (sessionInfo.is_team_mode && !selectedTeam)} >
                                        {isJoining ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</> : ( isJoined ? (sessionInfo.is_team_mode ? 'Switch Team' : 'Rejoin Session') : (sessionInfo.is_team_mode ? 'Join Selected Team' : 'Join Session') )}
                                    </button>
                                    {joinError && <div className="alert alert-warning mt-3 p-2 small">{joinError}</div>}
                                </div>
                            )}

                            {isCurrentUserHost && (
                                <div className="mt-4 border-top pt-3">
                                    <button
                                        className="btn btn-warning btn-lg w-75 py-2 fs-5 shadow-sm mx-auto d-block"
                                        onClick={handleStartQuiz}
                                        disabled={isStarting || participants.length === 0}
                                        style={{color: '#212529'}}
                                    >
                                        {isStarting ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Starting Quiz...</> : 'Start Quiz!' }
                                    </button>
                                    {participants.length === 0 && !isStarting && <p className="text-danger mt-2 small fst-italic">Waiting for participants to join before starting.</p>}
                                    {startError && <div className="alert alert-danger mt-3 p-2 small">{startError}</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4">
                         <div className="card-header bg-light-subtle p-3">
                            <h5 className="mb-0 fw-medium">Participants ({participants.length})</h5>
                        </div>
                        <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {participants.length === 0 ? (
                                <li className="list-group-item text-muted text-center fst-italic py-3">No one has joined yet... Be the first!</li>
                            ) : (
                                participants
                                    .sort((a, b) => {
                                        if (a.user_id === sessionInfo.host_id) return -1;
                                        if (b.user_id === sessionInfo.host_id) return 1;
                                        return a.username.localeCompare(b.username);
                                    })
                                    .map((p) => (
                                        <li key={p.user_id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <img src={`/avatars/avatar${p.avatar || 1}.png`} alt={p.username} width="35" height="35" className="rounded-circle me-2 shadow-sm border border-light"/>
                                                <span className={`fw-medium ${p.user_id === currentUser?.id ? 'text-primary' : ''}`}>
                                                    {p.username}
                                                    {p.user_id === sessionInfo.host_id && <span className="badge bg-dark-subtle text-dark-emphasis rounded-pill ms-2 small py-1 px-2">Host</span>}
                                                    {p.user_id === currentUser?.id && !isCurrentUserHost && <span className="text-muted ms-1 small">(You)</span>}
                                                </span>
                                            </div>
                                            {sessionInfo.is_team_mode && p.team_number && (
                                                <span className={`badge bg-info-subtle text-info-emphasis rounded-pill fs-6 py-1 px-2`}>Team {p.team_number}</span>
                                            )}
                                        </li>
                                    ))
                            )}
                        </ul>
                    </div>
                     <div className="text-center mt-4 mb-3">
                         <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>
                             <i className="bi bi-house-door-fill me-1"></i> Back to Home
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizSession;