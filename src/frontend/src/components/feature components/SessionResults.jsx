import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const SessionResults = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionCode}/results`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Session results:', data);
          setResults(data);
        }
      } catch (err) {
        console.error('Failed to fetch session results', err);
      }
    };

    if (sessionCode) {
      fetchResults();
    }
  }, [sessionCode]);

  const calculateTeamScores = () => {
    const teams = {};

    for (const p of results) {
      if (!p.team) continue;
      if (!teams[p.team]) {
        teams[p.team] = { totalScore: 0, count: 0 };
      }
      teams[p.team].totalScore += p.score;
      teams[p.team].count += 1;
    }

    const averages = Object.entries(teams).map(([team, { totalScore, count }]) => ({
      team,
      average: (totalScore / count).toFixed(2)
    }));

    return averages;
  };

  const teamScores = calculateTeamScores();

  return (
    <div className="container quiz-results mt-5">
      <div className="result-header p-4 bg-primary text-white rounded-3 text-center mb-5">
        <h2 className="mb-3">🏆 Session Complete! 🏆</h2>
        <p className="fs-5">See how everyone performed!</p>
      </div>

      <div className="row row-cols-1 row-cols-md-2 g-4">
      {results.sort((a, b) => b.score - a.score).map((player, index) => (
        <div className="col" key={index}>
            <div className={`card h-100 shadow-sm ${player.team ? 'border-primary' : 'border-success'}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                    <strong>{player.username}</strong>
                    {index === 0 && <span className="ms-2">🥇</span>}
                    </div>
                    <span className="badge bg-success">{player.score} pts</span>
                </div>
                <div className="card-body text-center">
                    {player.team ? (
                    <span className="badge bg-primary fs-6">Team {player.team}</span>
                    ) : (
                    <span className="badge bg-secondary fs-6">Individual</span>
                    )}
                </div>
            </div>
        </div>
        ))}
      </div>

      {teamScores.length > 0 && (
        <>
          <h3 className="mt-5 mb-3 text-center text-primary">Team Scores</h3>
          <div className="row justify-content-center">
            {teamScores.map((team, idx) => (
              <div key={idx} className="col-md-3 mb-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Team {team.team}</h5>
                    <p className="card-text display-6">{team.average} avg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 text-center">
        <button className="btn btn-outline-primary btn-lg me-3" onClick={() => navigate(`/simulate/${quizId}?session=${sessionCode}&showResults=true`)}>
          ← Back to My Results
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SessionResults;
