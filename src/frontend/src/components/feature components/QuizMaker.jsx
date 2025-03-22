import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function QuizMaker() {
  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState('');

  const addQuestion = (type) => {
    setQuestions([...questions, {
      type,
      text: '',
      ...(type === 'multiple_choice' && { options: [{ text: '', isCorrect: false }] }),
      ...(type === 'slider' && { min: 0, max: 10, step: 1 }),
      ...(type === 'text_input' && { max_length: 255 })
    }]);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex][field] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(updated);
  };

  const deleteOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const handleCreateQuiz = async () => {
    setFeedback('');
    if (!quizName) {
      setFeedback('Geef een quiz-naam op a.u.b.');
      return;
    }

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: quizName,
          questions: questions.map(q => ({
            type: q.type,
            text: q.text,
            ...(q.type === 'multiple_choice' && { options: q.options }),
            ...(q.type === 'slider' && { min: q.min, max: q.max, step: q.step }),
            ...(q.type === 'text_input' && { max_length: q.max_length })
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Quiz creation failed');
      
      setFeedback(`Succes! Quiz ID: ${data.quiz_id}`);
      setQuizName('');
      setQuestions([]);
    } catch (err) {
      setFeedback(err.message || 'Error creating quiz');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
        <Link to="/home" className="btn btn-outline-secondary mb-4">
          ← Back to Home
        </Link>
      <h2>Create New Quiz</h2>
      {feedback && <div className="alert alert-info">{feedback}</div>}

      <div className="mb-3">
        <label className="form-label">Quiz Name</label>
        <input
          type="text"
          className="form-control"
          value={quizName}
          onChange={e => setQuizName(e.target.value)}
        />
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Question {qIndex + 1}</span>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => deleteQuestion(qIndex)}
            >
              Delete Question
            </button>
          </div>
          <div className="card-body">
            <select
              className="form-select mb-3"
              value={q.type}
              onChange={e => updateQuestion(qIndex, 'type', e.target.value)}
            >
              <option value="text_input">Text Input</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="slider">Slider</option>
            </select>

            <textarea
              className="form-control mb-3"
              placeholder="Question Text"
              value={q.text}
              onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
            />

            {q.type === 'text_input' && (
              <div className="mb-3">
                <label>Max Length</label>
                <input
                  type="number"
                  className="form-control"
                  value={q.max_length}
                  onChange={e => updateQuestion(qIndex, 'max_length', parseInt(e.target.value))}
                />
              </div>
            )}

            {q.type === 'slider' && (
              <div className="row g-3 mb-3">
                <div className="col">
                  <label>Min Value</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.min}
                    onChange={e => updateQuestion(qIndex, 'min', parseInt(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Max Value</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.max}
                    onChange={e => updateQuestion(qIndex, 'max', parseInt(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Step</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.step}
                    onChange={e => updateQuestion(qIndex, 'step', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {q.type === 'multiple_choice' && (
              <div className="mb-3">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option Text"
                      value={option.text}
                      onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)}
                    />
                    <div className="input-group-text">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={e => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                      />
                      <span className="ms-2">Correct</span>
                    </div>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteOption(qIndex, oIndex)}
                      disabled={q.options.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => addOption(qIndex)}
                  >
                    Add Option
                  </button>
                  <small className="text-muted">
                    {q.options.length} option(s)
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="mb-3">
        <button className="btn btn-secondary me-2" onClick={() => addQuestion('text_input')}>
          Add Text Question
        </button>
        <button className="btn btn-secondary me-2" onClick={() => addQuestion('multiple_choice')}>
          Add Multiple Choice
        </button>
        <button className="btn btn-secondary" onClick={() => addQuestion('slider')}>
          Add Slider
        </button>
      </div>

      <button className="btn btn-primary" onClick={handleCreateQuiz}>
        Create Quiz
      </button>
    </div>
  );
}

export default QuizMaker;