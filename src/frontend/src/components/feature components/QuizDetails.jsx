import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Quiz not found');
        setQuiz(await res.json());
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const formatDate = iso => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const handleSimulate = () => navigate(`/simulate/${quizId}`);
  const handleCreateSession = async teamMode => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ quiz_id: quizId, team_mode: teamMode })
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || 'Unable to start session');
      else navigate(`/session/${data.code}`);
    } catch {
      alert('Network error');
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Back to Home button aligned right, outside the card */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>
      </div>

      <div className="card border rounded p-4">
        {/* Creator info */}
        <div className="d-flex align-items-center mb-3">
          <img
            src={`/avatars/avatar${quiz.creator_avatar || 1}.png`}
            alt={quiz.creator}
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '1rem' }}
          />
          <div>
            <h5 className="mb-1">{quiz.creator}</h5>
            <small className="text-muted">Created on {formatDate(quiz.created_at)}</small>
          </div>
        </div>

        <h2 className="mb-4">{quiz.name}</h2>

        <div className="mb-4">
          <button className="btn btn-primary me-2" onClick={handleSimulate}>Simulate Quiz</button>
          <button className="btn btn-primary me-2" onClick={() => handleCreateSession(false)}>Solo Session</button>
          <button className="btn btn-primary" onClick={() => handleCreateSession(true)}>Team Session</button>
        </div>

        <button className="btn btn-secondary mb-3" onClick={() => setShowQuestions(v => !v)}>
          {showQuestions ? 'Hide Questions' : 'Show Questions'}
        </button>

        {showQuestions && (
          <>
            <h5>Questions Overview:</h5>
            <ul className="list-group">
              {quiz.questions.map((q, idx) => (
                <li key={q.id} className="list-group-item">
                  <strong>Question {idx + 1}:</strong> {q.text}
                  <br />
                  <small className="text-muted">Type: {q.type.replace('_', ' ')}</small>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}