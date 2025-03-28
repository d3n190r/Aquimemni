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
          setError(data.error || 'Kon quizzes niet ophalen');
          return;
        }
        const data = await response.json();
        setQuizzes(data);
        return data;
      } catch (err) {
        setError('Er trad een netwerkfout op bij het laden van quizzes');
        console.error(err);
      }
    };

    fetchQuizzes();
  }, []);

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

  // Toggle button for showing/hiding quiz details
  const renderToggleButton = (quizId) => (
    <button
      className="btn btn-link"
      onClick={() => setExpandedQuizId(prev => prev === quizId ? null : quizId)}
    >
      {expandedQuizId === quizId ? '▲' : '▼'}
    </button>
  );

  // Count question types (text_input, multiple_choice, slider)
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
        <p>Je hebt nog geen quiz gemaakt.</p>
      ) : (
        <div className="accordion">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{quiz.name}</h5>
                  <small className="text-muted">
                    Aangemaakt op {formatDate(quiz.created_at)}
                  </small>
                </div>
                {renderToggleButton(quiz.id)}
              </div>

              {expandedQuizId === quiz.id && (
                <div className="card-body">
                  <div className="mb-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/simulate/${quiz.id}`, { state: { quiz } })}
                    >
                      Simulate This Quiz
                    </button>
                  </div>
                  <div className="mb-3">
                    <h6>Overzicht:</h6>
                    <ul className="list-unstyled">
                      <li>Totaal vragen: {quiz.questions.length}</li>
                      <li>Totaal antwoorden: {
                        quiz.questions.reduce((acc, q) => acc + (q.answers?.length || 0), 0)
                      }</li>
                      <li>Vraagtypes: {Object.entries(countQuestionTypes(quiz.questions))
                        .map(([type, count]) => `${count} ${type}`)
                        .join(', ')}
                      </li>
                    </ul>
                  </div>

                  <h6>Vragen:</h6>
                  {quiz.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="mb-3 p-2 border rounded">
                      <div className="d-flex justify-content-between">
                        <strong>Vraag {qIndex + 1}</strong>
                        <span className="badge bg-secondary">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mb-1">{question.text}</p>

                      {question.type === 'text_input' && (
                        <div>
                          <small className="text-muted">
                            Max. lengte: {question.max_length}
                          </small>
                          <br />
                          <small className="text-muted">
                            Correct Answer: {question.correct_answer}
                          </small>
                        </div>
                      )}

                      {question.type === 'slider' && (
                        <div>
                          <small className="text-muted">
                            Bereik: {question.min}-{question.max} (stap: {question.step})
                          </small>
                          <br />
                          <small className="text-muted">
                            Correct Value: {question.correct_value}
                          </small>
                        </div>
                      )}

                      {question.type === 'multiple_choice' && (
                        <div className="mt-2">
                          <small>Opties:</small>
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