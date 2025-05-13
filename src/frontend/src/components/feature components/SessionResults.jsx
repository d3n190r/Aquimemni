// src/frontend/src/components/feature components/SessionResults.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useSearchParams is niet meer direct nodig hier

const SessionResults = () => {
  const { sessionCode } = useParams(); // Haal sessionCode direct uit de URL parameters
  const [results, setResults] = useState([]);
  const [teamResults, setTeamResults] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionCode) {
      setError('Session code missing from URL.');
      setLoading(false);
      return;
    }

    const fetchSessionData = async () => {
        setLoading(true); setError('');
        try {
             const sessionRes = await fetch(`/api/sessions/${sessionCode}`, { credentials: 'include' });
             if (!sessionRes.ok) {
                const errData = await sessionRes.json().catch(()=>({}));
                throw new Error(errData.error || 'Could not load session information');
             }
             const sessionData = await sessionRes.json();
             setSessionInfo(sessionData);

             const resultsRes = await fetch(`/api/sessions/${sessionCode}/results`, { credentials: 'include' });
             if (!resultsRes.ok) {
                const errData = await resultsRes.json().catch(()=>({}));
                throw new Error(errData.error || 'Could not load session results');
            }
             const resultsData = await resultsRes.json();
             setResults(resultsData);

            if (sessionData.is_team_mode && sessionData.num_teams > 1) {
                 calculateTeamScores(resultsData, sessionData.num_teams);
            }
        } catch (err) {
            console.error('Failed to fetch session data:', err);
            setError(err.message || 'Failed to load session data.');
        } finally {
            setLoading(false);
        }
    };
    fetchSessionData();
  }, [sessionCode]); // Dependency is alleen sessionCode

  const calculateTeamScores = (participantResults, numTeams) => {
        const teams = {};
        for (let i = 1; i <= numTeams; i++) {
            teams[i] = { totalScore: 0, memberCount: 0, members: [] };
        }
        participantResults.forEach(p => {
            if (p.team_number && teams[p.team_number]) {
                teams[p.team_number].totalScore += p.score || 0;
                teams[p.team_number].memberCount++;
                teams[p.team_number].members.push(p.username);
            }
        });
        const teamArray = Object.entries(teams).map(([teamNum, data]) => ({
            team: teamNum,
            totalScore: data.totalScore,
            averageScore: data.memberCount > 0 ? (data.totalScore / data.memberCount).toFixed(2) : 0,
            memberCount: data.memberCount
        })).sort((a, b) => b.totalScore - a.totalScore);
        setTeamResults(teamArray);
    };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <div className="text-center">
            <button className="btn btn-secondary" onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container quiz-results mt-5">
      <div className="result-header p-4 bg-primary text-white rounded-3 text-center mb-5">
        <h2 className="mb-3">🏆 Session Results 🏆</h2>
        <p className="fs-5">
          {sessionInfo?.quiz_name || 'Quiz'} Results (Code: {sessionCode})
        </p>
      </div>

      {teamResults && teamResults.length > 0 && ( 
        <>
            <h3 className="mt-5 mb-3 text-center text-primary">Team Standings</h3>
             <div className="row justify-content-center g-3">
                {teamResults.map((team, index) => (
                 <div key={team.team} className="col-md-4 col-lg-3">
                    <div className={`card text-center shadow-sm h-100 ${index === 0 ? 'border-warning border-2' : 'border-light'}`}>
                        <div className={`card-header ${index === 0 ? 'bg-warning text-dark' : 'bg-info-subtle text-info-emphasis'}`}>
                            <strong>Team {team.team}</strong> {index === 0 && '🥇'}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            <p className="display-6 fw-bold mb-1">{team.totalScore.toFixed(0)}</p>
                            <p className="text-muted mb-0">Total Points</p>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
            <hr className="my-5" />
        </>
      )}

      <h3 className="mb-4 text-center">Individual Scores</h3>
      {results.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {results.map((player, index) => (
              <div className="col" key={player.user_id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex align-items-center p-3">
                    <span className={`badge me-3 fs-5 ${index === 0 ? 'bg-warning text-dark' : (index === 1 ? 'bg-secondary' : (index === 2 ? 'bg-dark text-white' : 'bg-light text-dark'))}`}>
                        #{index + 1}
                    </span>
                    <img
                        src={`/avatars/avatar${player.avatar || 1}.png`}
                        alt={player.username}
                        className="rounded-circle me-3 shadow-sm"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{player.username} {index === 0 && !teamResults && '👑'}</h6> 
                        {player.team_number && sessionInfo?.is_team_mode && <small className="text-muted">Team {player.team_number}</small>}
                    </div>
                    <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{player.score} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      ) : (
          <p className="text-center text-muted fst-italic">No participants submitted scores for this session, or results are still being tallied.</p>
      )}
      
      <div className="mt-5 text-center d-flex justify-content-center gap-3">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/home')}>
          <i className="bi bi-house-door me-2"></i>Back to Home
        </button>
      </div>
    </div>
  );
};

export default SessionResults;