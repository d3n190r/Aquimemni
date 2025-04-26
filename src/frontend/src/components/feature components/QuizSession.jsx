import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuizSession = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [teamChoice, setTeamChoice] = useState('');
  const isHost = currentUserId === session?.host_id;

  useEffect(() => {
    fetchSession();
    fetchParticipants();
    fetchCurrentUser();

    const interval = setInterval(() => {
      fetchSession();
      fetchParticipants();
    }, 3000); // refresh every 3 sec

    return () => clearInterval(interval);
  }, []);

  const fetchSession = async () => {
    const res = await fetch(`/api/sessions/${code}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setSession(data);

      if (data.started) {
        navigate(`/simulate/${data.quiz_id}?session=${code}&isHost=${isHost}`);
      } else if (data.team_mode && !hasJoinedAlready()) {
        setShowTeamPicker(true);
      }
    }
  };

  const fetchParticipants = async () => {
    const res = await fetch(`/api/sessions/${code}/participants`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setParticipants(data);
    }
  };

  const fetchCurrentUser = async () => {
    const res = await fetch('/api/profile', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setCurrentUserId(data.id);
    }
  };

  const hasJoinedAlready = () => {
    return participants.some(p => p.id === currentUserId);
  };

  const handleStart = async () => {
    const res = await fetch(`/api/sessions/${code}/start`, {
      method: 'POST',
      credentials: 'include'
    });
    if (res.ok) {
      fetchSession();
    }
  };

  const handleCopyInvite = () => {
    const inviteLink = `${code}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        alert('Invite link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link', err);
        alert('Failed to copy link.');
      });
  };

  const handleJoinTeam = async (team) => {
    try {
      const res = await fetch(`/api/sessions/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ team })
      });
      if (res.ok) {
        setShowTeamPicker(false);
        fetchParticipants();
      } else {
        alert('Failed to join session.');
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to join team', err);
      alert('Network error');
      navigate('/home');
    }
  };


  return (
    <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Quiz Lobby (Code: <code>{code}</code>)</h2>
            <button
                className="btn btn-outline-secondary"
                onClick={() => handleCopyInvite()}
                style={{ height: '40px' }}
            >
                📋 Copy Invite Link
            </button>
        </div>
      {showTeamPicker && (
        <div className="alert alert-primary text-center">
          <h4>Pick Your Team</h4>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button className="btn btn-outline-primary" onClick={() => handleJoinTeam('A')}>
              Join Team A
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleJoinTeam('B')}>
              Join Team B
            </button>
          </div>
        </div>
      )}

      <h4>Participants ({participants.length}):</h4>
      <ul className="list-group mb-4">
        {participants.map(p => (
          <li key={p.id} className="list-group-item d-flex align-items-center">
            {p.username}
            {p.team && <span className="ms-auto badge bg-secondary">Team {p.team}</span>}
          </li>
        ))}
      </ul>

      {isHost && (
        <button className="btn btn-primary" onClick={handleStart}>
          Start Quiz
        </button>
      )}

      {!isHost && (
        <div className="alert alert-info">Waiting for host to start the quiz...</div>
      )}
    </div>
  );
};

export default QuizSession;
