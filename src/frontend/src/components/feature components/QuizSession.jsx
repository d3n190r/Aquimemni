// src/frontend/src/components/feature components/QuizSession.jsx
/**
 * Quiz session component for managing quiz participation.
 * 
 * This component handles the quiz session lobby where participants can join, select teams,
 * and wait for the host to start the quiz. It provides real-time updates through polling,
 * participant management, team selection, and session invitations. When the session starts,
 * it transitions to the QuizSimulator component.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import QuizSimulator from './QuizSimulator';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Select from 'react-select'; // Voor de team selectie

/**
 * QuizSession component for managing quiz participation.
 * 
 * Handles the session lobby interface, including joining/leaving sessions, team selection,
 * participant list management, and session invitations. For hosts, it provides controls
 * to invite participants and start the quiz. Uses polling to keep session data updated.
 * 
 * @returns {JSX.Element} The rendered quiz session interface
 */
function QuizSession() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [sessionInfo, setSessionInfo] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinError, setJoinError] = useState('');
    const [startError, setStartError] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // --- Invite State ---
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitableUsers, setInvitableUsers] = useState([]);
    const [isLoadingInvitableUsers, setIsLoadingInvitableUsers] = useState(false);
    const [inviteSearchTerm, setInviteSearchTerm] = useState('');
    const [invitedUserIds, setInvitedUserIds] = useState(new Set());
    const [inviteError, setInviteError] = useState('');
    const [isSendingInvite, setIsSendingInvite] = useState(null);
    // --- End Invite State ---

    const pollIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    /**
     * Fetches the current user's profile information.
     * 
     * Retrieves the user's profile data from the API and updates the currentUser state.
     * Redirects to the login page if the user is not authenticated.
     * 
     * @returns {Promise<Object|null>} The user data object if successful, null otherwise
     */
    const fetchCurrentUser = useCallback(async () => {
        if (!isMountedRef.current) return null;
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (!isMountedRef.current) return null;
            if (response.ok) {
                const userData = await response.json();
                if (isMountedRef.current) setCurrentUser(userData); // Set currentUser here
                return userData;
            } else {
                if (isMountedRef.current) navigate('/login');
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError('Could not verify user session. Please try logging in again.');
                navigate('/login');
            }
        }
        return null;
    }, [navigate]);

    /**
     * Fetches session data and participant information.
     * 
     * Retrieves the current session details and participant list from the API.
     * Updates various state variables based on the fetched data, including session info,
     * participants list, and the user's join status and team selection.
     * 
     * @param {Object} userForFetch - The current user object to use for the fetch operation
     * @returns {Promise<void>} A promise that resolves when the data fetch completes
     */
    const fetchData = useCallback(async (userForFetch) => {
        if (!userForFetch || !code || !isMountedRef.current) return;

        try {
            const sessionRes = await fetch(`/api/sessions/${code}`, { credentials: 'include' });
            if (!isMountedRef.current) return;

            if (!sessionRes.ok) {
                const errText = await sessionRes.text();
                const specificError = sessionRes.status === 404 ? `Session "${code}" not found or has ended.` : `Error fetching session details (Status: ${sessionRes.status}).`;
                setError(prevError => prevError !== specificError ? specificError : prevError);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                return;
            }

            const currentSessionData = await sessionRes.json();
            if (!isMountedRef.current) return;
            setSessionInfo(prev => JSON.stringify(prev) !== JSON.stringify(currentSessionData) ? currentSessionData : prev);

            if (currentSessionData.started) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                return;
            }

            const participantsRes = await fetch(`/api/sessions/${code}/participants`, { credentials: 'include' });
            if (!isMountedRef.current) return;

            if (participantsRes.ok) {
                const participantsData = await participantsRes.json();
                if (isMountedRef.current) {
                    setParticipants(prev => JSON.stringify(prev) !== JSON.stringify(participantsData) ? participantsData : prev);

                    const currentUserParticipant = participantsData.find(p => p.user_id === userForFetch.id);
                    const newIsJoinedServer = !!currentUserParticipant;

                    setIsJoined(prevIsJoined => prevIsJoined !== newIsJoinedServer ? newIsJoinedServer : prevIsJoined);

                    if (newIsJoinedServer && currentUserParticipant) {
                        const serverTeam = currentUserParticipant.team_number ? String(currentUserParticipant.team_number) : '';
                        // Only update selectedTeam from server if it's different
                        // This avoids overwriting a local selection if the user hasn't clicked "Join" yet
                        // but ensures it syncs if the server confirms their team.
                        setSelectedTeam(prevSelectedTeam => {
                            if (prevSelectedTeam !== serverTeam) return serverTeam;
                            return prevSelectedTeam;
                        });

                    }
                    // If !newIsJoinedServer, local selectedTeam (from dropdown interaction) is preserved.

                    // Clear non-fatal errors only if current error is not the "not found" one
                    setError(prevError => (prevError && prevError !== `Session "${code}" not found or has ended.`) ? '' : prevError);
                }
            } else {
                setError(prevError => {
                    const newErr = "Could not update participant list.";
                    return prevError !== newErr ? newErr : prevError;
                });
            }
        } catch (err) {
            setError(prevError => {
                const newErr = 'Failed to fetch session data. Please refresh.';
                return prevError !== newErr ? newErr : prevError;
            });
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    }, [code]); // Only 'code' as a dependency for fetchData's stability.

    // Effect for initialization and when 'code' changes
    useEffect(() => {
        isMountedRef.current = true;
        setIsLoading(true);
        // Reset states when 'code' changes or on initial mount
        setError('');
        setSessionInfo(null);
        setParticipants([]);
        setSelectedTeam('');
        setIsJoined(false);
        setInvitedUserIds(new Set());
        setCurrentUser(null); // Reset current user too, it will be fetched again

        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        const initialize = async () => {
            const user = await fetchCurrentUser(); // Fetches and sets currentUser state
            if (user && code && isMountedRef.current) { // Check code again after user is fetched
                await fetchData(user); // Pass the fetched user to fetchData
            }
            if (isMountedRef.current) setIsLoading(false);
        };

        if (code) {
            initialize();
        } else {
            if (isMountedRef.current) {
                setError("No session code provided in URL.");
                setIsLoading(false);
            }
        }

        return () => {
            isMountedRef.current = false;
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [code, fetchCurrentUser, fetchData]); // fetchData is stable, fetchCurrentUser is stable

    // Effect for polling, depends on currentUser being set
    useEffect(() => {
        if (pollIntervalRef.current) { // Clear previous interval if any
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        // Start polling only if: not loading, currentUser is available, sessionInfo is available, and session has not started
        if (!isLoading && currentUser && sessionInfo && !sessionInfo.started && isMountedRef.current) {
            pollIntervalRef.current = setInterval(() => {
                if (isMountedRef.current && currentUser) { // Ensure currentUser is still valid inside interval
                    fetchData(currentUser); // Call stable fetchData with current user
                } else {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                }
            }, 5000);
        }

        return () => { // Cleanup on unmount or when dependencies change
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [isLoading, currentUser, sessionInfo, fetchData]); // Dependencies for controlling the poll


    /**
     * Handles the action of joining a team or session.
     * 
     * Sends a request to the API to join the session with the selected team number.
     * Validates team selection for team mode sessions and handles error states.
     * Updates the UI to reflect the join status after a successful join.
     * 
     * @param {Event} e - The form submission event
     * @returns {Promise<void>} A promise that resolves when the join operation completes
     */
    const handleJoinTeam = async (e) => {
        e.preventDefault();
        if (!sessionInfo || !currentUser || isJoining || !isMountedRef.current) return;
        setJoinError(''); setIsJoining(true);
        let teamNumberToSend = null;
        if (sessionInfo.is_team_mode) {
            if (!selectedTeam) {
                setJoinError(`Please select a team (1-${sessionInfo.num_teams}).`);
                if (isMountedRef.current) setIsJoining(false); return;
            }
            teamNumberToSend = parseInt(selectedTeam, 10);
            if (isNaN(teamNumberToSend) || teamNumberToSend < 1 || teamNumberToSend > sessionInfo.num_teams) {
                 setJoinError(`Invalid team number. Choose 1-${sessionInfo.num_teams}.`);
                 if (isMountedRef.current) setIsJoining(false); return;
            }
        }
        try {
            const response = await fetch(`/api/sessions/${code}/join`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_number: teamNumberToSend }), credentials: 'include'
            });
            if (!isMountedRef.current) return;
            const result = await response.json();
            if (response.ok) {
                // After successful join, immediately fetch data to update UI with server confirmation
                if (isMountedRef.current && currentUser) await fetchData(currentUser);
                 setIsJoined(true); // Optimistically set, will be confirmed by fetchData
            } else {
                if (isMountedRef.current) setJoinError(result.error || 'Failed to join/switch team.');
            }
        } catch (err) {
            if (isMountedRef.current) setJoinError('A network error occurred.');
        } finally {
            if (isMountedRef.current) setIsJoining(false);
        }
    };

    /**
     * Handles the action of starting the quiz session.
     * 
     * Sends a request to the API to start the session. Only available to the host.
     * On success, stops polling and updates the session info to trigger the transition
     * to the QuizSimulator component.
     * 
     * @returns {Promise<void>} A promise that resolves when the start operation completes
     */
    const handleStartQuiz = async () => {
        if (!sessionInfo || !currentUser || isStarting || currentUser.id !== sessionInfo.host_id || !isMountedRef.current) return;
        setStartError(''); setIsStarting(true);
        try {
            const response = await fetch(`/api/sessions/${code}/start`, { method: 'POST', credentials: 'include' });
            if (!isMountedRef.current) return;
            const result = await response.json();
            if (response.ok) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                // After successful start, fetch data to update sessionInfo.started
                if (isMountedRef.current && currentUser) await fetchData(currentUser);
            } else {
                if (isMountedRef.current) { setStartError(result.error || 'Failed to start quiz.'); setIsStarting(false); }
            }
        } catch (err) {
            if (isMountedRef.current) { setStartError('A network error occurred.'); setIsStarting(false); }
        }
        // No finally setIsStarting(false) here; if successful, component will switch to QuizSimulator
    };

    /**
     * Copies the session code to the clipboard.
     * 
     * Uses the Clipboard API to copy the session code for sharing.
     * Provides feedback to the user about the success or failure of the operation.
     * 
     * @returns {Promise<void>} A promise that resolves when the copy operation completes
     */
    const copyCodeToClipboard = useCallback(async () => {
        if (!sessionInfo?.code) { setCopySuccess('No Code'); setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2500); return; }
        if (!navigator.clipboard) { setCopySuccess('No API'); setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000); return; }
        try { await navigator.clipboard.writeText(sessionInfo.code); setCopySuccess('Copied!'); setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 2000); }
        catch (err) { let msg = 'Error!'; if (err.name === 'NotAllowedError') msg = 'Blocked'; setCopySuccess(msg); setTimeout(() => { if (isMountedRef.current) setCopySuccess(''); }, 3000); }
    }, [sessionInfo?.code]);

    // --- Invite Functions ---
    /**
     * Opens the invite modal and loads invitable users.
     * 
     * Fetches the list of users who can be invited to the session from the API.
     * Updates the invitableUsers state with the fetched data and displays the invite modal.
     * 
     * @returns {Promise<void>} A promise that resolves when the modal is opened and data is loaded
     */
    const openInviteModal = async () => {
        if (!isMountedRef.current) return;
        setShowInviteModal(true); setIsLoadingInvitableUsers(true); setInviteError(''); setInviteSearchTerm('');
        try {
            const response = await fetch(`/api/users/invitable?session_code=${code}`, {credentials: 'include'});
            if (!isMountedRef.current) return;
            if(response.ok) {
                const data = await response.json();
                if (isMountedRef.current) setInvitableUsers(data);
            } else {
                 const errData = await response.json().catch(() => ({}));
                 if (isMountedRef.current) { setInviteError(errData.error || "Failed to load users"); setInvitableUsers([]); }
            }
        } catch (err) {
            if (isMountedRef.current) { setInviteError("Network error loading users"); setInvitableUsers([]); }
        } finally {
            if (isMountedRef.current) setIsLoadingInvitableUsers(false);
        }
    };

    /**
     * Sends an invitation to a user to join the session.
     * 
     * Sends a request to the API to invite the specified user to the session.
     * Updates the invitedUserIds state to reflect the invitation status in the UI.
     * 
     * @param {number} recipientId - The ID of the user to invite
     * @returns {Promise<void>} A promise that resolves when the invite operation completes
     */
    const handleSendInvite = async (recipientId) => {
        if (!isMountedRef.current) return;
        setIsSendingInvite(recipientId); setInviteError('');
        try {
            const response = await fetch(`/api/sessions/${code}/invite`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient_id: recipientId }), credentials: 'include'
            });
            if (!isMountedRef.current) return;
            const result = await response.json();
            if (response.ok || response.status === 200) { // Backend kan 200 teruggeven voor "already sent"
                if (isMountedRef.current) {
                    setInvitedUserIds(prev => new Set(prev).add(recipientId));
                }
            } else {
                if (isMountedRef.current) setInviteError(result.error || "Failed to send invite");
            }
        } catch(err) {
             if (isMountedRef.current) setInviteError('Network error sending invite.');
        } finally {
             if (isMountedRef.current) setIsSendingInvite(null);
        }
    };

    const filteredInvitableUsers = invitableUsers.filter(user =>
        user.username.toLowerCase().includes(inviteSearchTerm.toLowerCase())
    );
    // --- End Invite Functions ---


    if (isLoading) {
        return (<div className="container mt-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status"></div><p className="mt-2 fs-5">Loading Session...</p></div>);
    }
    if (error) {
        return (<div className="container mt-5"><div className="alert alert-danger text-center"><h4 className="alert-heading">Error</h4><p>{error}</p></div><div className="text-center mt-3"><button className="btn btn-primary" onClick={() => navigate('/home')}><i className="bi bi-house-door me-1"></i> Back to Home</button></div></div>);
    }
    if (!sessionInfo || !currentUser) { // Added !currentUser check
         return (<div className="container mt-5"><div className="alert alert-warning text-center">Could not load session info or user data.</div><div className="text-center mt-3"><button className="btn btn-secondary" onClick={() => navigate('/home')}><i className="bi bi-house-door me-1"></i> Back to Home</button></div></div>);
    }
    if (sessionInfo.started) {
        return <QuizSimulator quizId={sessionInfo.quiz_id} sessionCode={code} />;
    }

    const isCurrentUserHost = currentUser?.id === sessionInfo.host_id;
    /**
     * Renders the team selection dropdown for team mode sessions.
     * 
     * Creates a dropdown menu with options for each team in the session.
     * Only displayed for non-host users in team mode sessions.
     * 
     * @returns {JSX.Element|null} The team selection dropdown or null if not applicable
     */
    const renderTeamSelection = () => {
        if (!sessionInfo.is_team_mode || isCurrentUserHost) return null;
        const teamOptions = Array.from({ length: sessionInfo.num_teams }, (_, i) => ({ value: String(i + 1), label: `Team ${i + 1}` }));
        return (
            <div className="mb-3"><label htmlFor="teamSelect" className="form-label fw-bold">Select Your Team:</label>
                 <Select id="teamSelect" options={teamOptions} value={teamOptions.find(opt => opt.value === selectedTeam) || null}
                    onChange={(selectedOption) => setSelectedTeam(selectedOption ? selectedOption.value : '')}
                    placeholder="-- Choose a Team --" isDisabled={isJoining}
                    styles={{ control: (p) => ({ ...p, minHeight: '45px' }), menu: (p) => ({ ...p, zIndex: 5 })}}/>
            </div>);
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                                <h4 className="mb-0">Quiz Session Lobby</h4>
                                <div className="d-flex align-items-center">
                                    <span className="me-2 text-white-75">Code:</span>
                                    <strong className="bg-light text-primary px-3 py-1 rounded-pill me-2 user-select-all font-monospace shadow-sm" style={{ fontSize: '1.1rem', letterSpacing: '1px' }} title="Session Code">{sessionInfo.code}</strong>
                                    <button className={`btn btn-sm ${copySuccess === 'Copied!' ? 'btn-light text-success' : (copySuccess ? 'btn-danger' : 'btn-outline-light')}`} onClick={copyCodeToClipboard} title={copySuccess || 'Copy session code'} disabled={!!copySuccess} style={{ minWidth: '85px', textAlign: 'center', fontWeight: '500' }} aria-label="Copy code">
                                        {copySuccess ? copySuccess : <><i className="bi bi-clipboard me-1"></i> Copy</>}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body text-center p-4">
                                <h4 className="card-title mb-2 fs-4"><span className="text-primary fw-bold">{sessionInfo.quiz_name || 'Loading...'}</span></h4>
                                {sessionInfo.quiz_maker_username && sessionInfo.quiz_maker_username !== "Unknown Maker" && (
                                    <p className="card-text text-muted small mb-1" style={{fontSize: '0.9rem'}}>Quiz by: <Link to={`/profile/view/${sessionInfo.quiz_maker_id}`} className="fw-medium text-decoration-none text-info-emphasis">
                                        {sessionInfo.quiz_maker_avatar && <img src={`/avatars/avatar${sessionInfo.quiz_maker_avatar || 1}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>}{sessionInfo.quiz_maker_username}</Link></p>)}
                                <p className="card-text mb-3 fs-6">Hosted by: <Link to={`/profile/view/${sessionInfo.host_id}`} className="fw-bold text-decoration-none text-success-emphasis">
                                     <img src={`/avatars/avatar${sessionInfo.host_avatar || 1}.png`} alt="" width="20" height="20" className="rounded-circle me-1 align-middle"/>{sessionInfo.host_username || '...'}</Link></p>
                                <hr className="my-3" />
                                <p className="text-muted fst-italic mb-2">Waiting for host to start...</p>
                                {sessionInfo.is_team_mode && <p className="mb-3"><span className="badge bg-info-subtle text-info-emphasis fs-6 py-2 px-3 rounded-pill">Playing in <strong>{sessionInfo.num_teams} teams</strong> mode</span></p>}
                                {!isCurrentUserHost && (
                                    <div className="mt-4 border-top pt-3">{renderTeamSelection()}
                                        <button className="btn btn-success btn-lg w-100 py-2 fs-5 shadow-sm" onClick={handleJoinTeam} disabled={isJoining || (sessionInfo.is_team_mode && !selectedTeam)} >
                                            {isJoining ? <><span className="spinner-border spinner-border-sm me-2"></span> Processing...</> : ( isJoined ? (sessionInfo.is_team_mode ? 'Switch Team' : 'Rejoin') : (sessionInfo.is_team_mode ? 'Join Team' : 'Join Session') )}</button>
                                        {joinError && <div className="alert alert-warning mt-3 p-2 small">{joinError}</div>}</div>)}
                                {isCurrentUserHost && (
                                    <div className="mt-4 border-top pt-3 d-grid gap-2">
                                         <button className="btn btn-outline-primary btn-lg" onClick={openInviteModal} disabled={isStarting}><i className="bi bi-person-plus-fill me-2"></i> Invite Participants</button>
                                        <button className="btn btn-warning btn-lg" onClick={handleStartQuiz} disabled={isStarting || participants.length === 0} style={{color: '#212529'}} title={participants.length === 0 ? "Waiting for participants" : "Start quiz"}>
                                            {isStarting ? <><span className="spinner-border spinner-border-sm me-2"></span> Starting...</> : 'Start Quiz!' }</button>
                                        {participants.length === 0 && !isStarting && <p className="text-danger mt-1 small fst-italic">Waiting for participants.</p>}
                                        {startError && <div className="alert alert-danger mt-3 p-2 small">{startError}</div>}</div>)}
                            </div>
                        </div>
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-header bg-light-subtle p-3"><h5 className="mb-0 fw-medium">Participants ({participants.length})</h5></div>
                            <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {participants.length === 0 ? (<li className="list-group-item text-muted text-center fst-italic py-3">No one has joined yet...</li>) : (
                                    participants.sort((a,b) => a.user_id === sessionInfo.host_id ? -1 : b.user_id === sessionInfo.host_id ? 1 : a.username.localeCompare(b.username))
                                    .map((p) => (
                                        <li key={p.user_id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                            <div className="d-flex align-items-center">
                                                <img src={`/avatars/avatar${p.avatar || 1}.png`} alt={p.username} width="35" height="35" className="rounded-circle me-2 shadow-sm border"/>
                                                <span className={`fw-medium ${p.user_id === currentUser?.id ? 'text-primary' : ''}`}>{p.username}
                                                    {p.user_id === sessionInfo.host_id && <span className="badge bg-dark-subtle text-dark-emphasis rounded-pill ms-2 small py-1 px-2">Host</span>}
                                                    {p.user_id === currentUser?.id && !isCurrentUserHost && <span className="text-muted ms-1 small">(You)</span>}</span></div>
                                            {sessionInfo.is_team_mode && p.team_number && (<span className="badge bg-info-subtle text-info-emphasis rounded-pill fs-6 py-1 px-2">Team {p.team_number}</span>)}</li>)))}</ul>
                        </div>
                        <div className="text-center mt-4 mb-3"><button className="btn btn-outline-secondary" onClick={() => navigate('/home')}><i className="bi bi-house-door-fill me-1"></i> Back to Home</button></div>
                    </div>
                </div>
            </div>

            {showInviteModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header"><h5 className="modal-title">Invite Participants</h5><button type="button" className="btn-close" onClick={() => setShowInviteModal(false)} aria-label="Close"></button></div>
                            <div className="modal-body">
                                {inviteError && <div className="alert alert-danger p-2 small">{inviteError}</div>}
                                <div className="mb-3"><input type="text" className="form-control" placeholder="Search users to invite..." value={inviteSearchTerm} onChange={(e) => setInviteSearchTerm(e.target.value)}/></div>
                                {isLoadingInvitableUsers ? (<div className="text-center"><span className="spinner-border spinner-border-sm"></span> Loading users...</div>
                                ) : filteredInvitableUsers.length === 0 ? (<p className="text-muted text-center">No users found {inviteSearchTerm ? 'matching search' : 'to invite (or they are already in session/invited)'}.</p>
                                ) : (<ul className="list-group list-group-flush" style={{maxHeight: '250px', overflowY: 'auto'}}>
                                        {filteredInvitableUsers.map(user => (
                                            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                                                <div className="d-flex align-items-center">
                                                    <img src={`/avatars/avatar${user.avatar || 1}.png`} alt={user.username} width="40" height="40" className="rounded-circle me-2"/><span>{user.username}</span></div>
                                                <button className={`btn btn-sm ${invitedUserIds.has(user.id) ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleSendInvite(user.id)} disabled={isSendingInvite === user.id || invitedUserIds.has(user.id)} style={{ minWidth: '80px' }}>
                                                    {isSendingInvite === user.id ? (<span className="spinner-border spinner-border-sm"></span>) : invitedUserIds.has(user.id) ? 'Invited' : 'Invite'}</button></li>))}</ul>)}
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Close</button></div>
                        </div></div></div>)}
            {showInviteModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
}
export default QuizSession;
