// frontend/src/components/feature components/MyQuizzes.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('/api/quizzes', {
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to fetch quizzes');
          return;
        }
        const data = await response.json();
        setQuizzes(data);
        return data;
      } catch (err) {
        setError('A network error occurred while loading quizzes');
        console.error(err);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Deletion failed');
      }
    } catch (err) {
      setError('Network error during deletion');
      console.error(err);
    }
  };

  const handleCreateSession = async (quizId, teamMode = false) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quiz_id: quizId, team_mode: teamMode })
      });
  
      const data = await response.json();
      if (response.ok) {
        navigate(`/session/${data.code}`);
      } else {
        alert(data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Failed to create session', err);
      alert('Network error');
    }
  };

  const toggleQuizDetails = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const countQuestionTypes = (questions) => {
    const counts = { text: 0, multiple: 0, slider: 0 };
    questions.forEach(q => {
      if (q.type === 'text_input') counts.text++;
      if (q.type === 'multiple_choice') counts.multiple++;
      if (q.type === 'slider') counts.slider++;
    });
    return counts;
  };

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <Link to="/home" className="btn btn-outline-secondary mb-4">
        ← Back to Home
      </Link>
      <h2>My Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>You haven't created any quizzes yet.</p>
      ) : (
        <div className="accordion">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{quiz.name}</h5>
                  <small className="text-muted">
                    Created on {formatDate(quiz.created_at)}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/quiz/edit/${quiz.id}`, { state: { quiz } })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(quiz.id)}
                    title="Delete quiz"
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-link p-0"
                    onClick={() => toggleQuizDetails(quiz.id)}
                    aria-label="Show/hide details"
                  >
                    {expandedQuizId === quiz.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {expandedQuizId === quiz.id && (
                <div className="card-body">
                  <div className="mb-4 d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/simulate/${quiz.id}`, { state: { quiz } })}
                    >
                      Simulate this quiz
                    </button>
                    <button 
                    className="btn btn-primary"
                    onClick={() => handleCreateSession(quiz.id,false)}
                    >
                      Create Solo Session
                    </button>
                    <button 
                    className="btn btn-primary"
                    onClick={() => handleCreateSession(quiz.id,true)}
                    >
                      Create Team Session
                    </button>
                  </div>
                  <div className="mb-3">
                    <h6>Overview:</h6>
                    <ul className="list-unstyled">
                      <li>Total questions: {quiz.questions.length}</li>
                      <li>Total answers: {
                        quiz.questions.reduce((acc, q) => acc + (q.answers?.length || 0), 0)
                      }</li>
                      <li>Question types: {Object.entries(countQuestionTypes(quiz.questions))
                        .map(([type, count]) => `${count} ${type}`)
                        .join(', ')}
                      </li>
                    </ul>
                  </div>

                  <h6>Questions:</h6>
                  {quiz.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="mb-3 p-2 border rounded">
                      <div className="d-flex justify-content-between">
                        <strong>Question {qIndex + 1}</strong>
                        <span className="badge bg-secondary">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mb-1">{question.text}</p>

                      {question.type === 'text_input' && (
                        <div>
                          <small className="text-muted">
                            Max length: {question.max_length}
                          </small>
                          <br />
                          <small className="text-muted">
                            Correct answer: {question.correct_answer}
                          </small>
                        </div>
                      )}

                      {question.type === 'slider' && (
                        <div>
                          <small className="text-muted">
                            Range: {question.min}-{question.max} (step: {question.step})
                          </small>
                          <br />
                          <small className="text-muted">
                            Correct value: {question.correct_value}
                          </small>
                        </div>
                      )}

                      {question.type === 'multiple_choice' && (
                        <div className="mt-2">
                          <small>Options:</small>
                          <ul className="list-unstyled">
                            {question.options?.map((option, oIndex) => (
                              <li key={oIndex} className="ms-2">
                                {option.text}
                                {option.is_correct &&
                                  <span className="ms-2 text-success">✓</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyQuizzes;