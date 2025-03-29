// frontend/src/components/feature components/QuizMaker.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function QuizMaker() {
  const { state } = useLocation();
  const [quizData, setQuizData] = useState({
    id: null,
    name: '',
    questions: []
  });
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  // Load existing quiz data when editing
  useEffect(() => {
    if (state?.quiz) {
      setQuizData({
        id: state.quiz.id,
        name: state.quiz.name,
        questions: state.quiz.questions.map(q => ({
          ...q,
          options: q.options?.map(opt => ({
            text: opt.text,
            isCorrect: opt.is_correct
          })) || []
        }))
      });
    }
  }, [state]);

  const addQuestion = (type) => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type,
          text: '',
          ...(type === 'multiple_choice' && { options: [{ text: '', isCorrect: false }] }),
          ...(type === 'slider' && { min: 0, max: 10, step: 1, correct_value: null }),
          ...(type === 'text_input' && { max_length: 255, correct_answer: '' }),
        },
      ]
    }));
  };

  const validateQuestion = (question, index) => {
    const errors = [];
    const questionNumber = index + 1;
  
    // Common validation for all question types
    if (!question.text.trim()) {
      errors.push(`Vraag ${questionNumber}: Vraagtekst is verplicht`);
    }
  
    // Type-specific validation
    switch (question.type) {
      case 'text_input':
        if (!question.correct_answer?.trim()) {
          errors.push(`Vraag ${questionNumber}: Correct antwoord is verplicht`);
        }
        if (!question.max_length || question.max_length < 1 || question.max_length > 500) {
          errors.push(`Vraag ${questionNumber}: Ongeldige maximale lengte (1-500)`);
        }
        break;
  
      case 'slider':
        if (question.min >= question.max) {
          errors.push(`Vraag ${questionNumber}: Minimum moet kleiner zijn dan maximum`);
        }
        if (question.step < 1 || question.step > (question.max - question.min)) {
          errors.push(`Vraag ${questionNumber}: Ongeldige stapgrootte`);
        }
        if (typeof question.correct_value !== 'number' || 
            question.correct_value < question.min || 
            question.correct_value > question.max) {
          errors.push(`Vraag ${questionNumber}: Correcte waarde moet tussen min en max liggen`);
        }
        break;
  
      case 'multiple_choice':
        if (question.options.length < 2) {
          errors.push(`Vraag ${questionNumber}: Minimaal 2 opties vereist`);
        }
        if (!question.options.some(opt => opt.isCorrect)) {
          errors.push(`Vraag ${questionNumber}: Minstens 1 correcte optie vereist`);
        }
        question.options.forEach((opt, optIndex) => {
          if (!opt.text.trim()) {
            errors.push(`Vraag ${questionNumber}: Optie ${optIndex + 1} tekst is verplicht`);
          }
        });
        break;
  
      default:
        errors.push(`Vraag ${questionNumber}: Onbekend vraagtype`);
    }
  
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    
    if (!quizData.name) {
      setFeedback('Geef een quiz-naam op a.u.b.');
      return;
    }

    // Validate all questions
    const validationErrors = quizData.questions
    .map((q, index) => validateQuestion(q, index))
    .flat();

    if (validationErrors.length > 0) {
      setFeedback(validationErrors.join('\n'));
      return;
    }

    const endpoint = quizData.id ? `/api/quizzes/${quizData.id}` : '/api/quiz';
    const method = quizData.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: quizData.name,
          questions: quizData.questions.map(q => ({
            type: q.type,
            text: q.text,
            ...(q.type === 'multiple_choice' && { 
              options: q.options.map(opt => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              })) 
            }),
            ...(q.type === 'slider' && { 
              min: q.min,
              max: q.max,
              step: q.step,
              correct_value: q.correct_value 
            }),
            ...(q.type === 'text_input' && { 
              max_length: q.max_length,
              correct_answer: q.correct_answer 
            }),
          }))
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed');

      setFeedback(quizData.id ? 'Quiz succesvol bijgewerkt!' : `Succes! Quiz ID: ${data.quiz_id}`);
      setTimeout(() => navigate('/quizzes'), 2000);
      
    } catch (err) {
      setFeedback(err.message || 'Er is een fout opgetreden');
      console.error(err);
    }
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuizData(prev => {
      const updated = [...prev.questions];
      updated[qIndex][field] = value;
      return { ...prev, questions: updated };
    });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    setQuizData(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options[oIndex][field] = value;
      return {questions: updated };
    });
  };

  const addOption = (qIndex) => {
    setQuizData(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options.push({ text: '', isCorrect: false });
      return { ...prev, questions: updated };
    });
  };

  const deleteOption = (qIndex, oIndex) => {
    setQuizData(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      return { ...prev, questions: updated };
    });
  };

  const deleteQuestion = (qIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex gap-1 align-items-center mb-4">
      <Link to="/quizzes" className="btn btn-outline-secondary mb-4">
        ← Terug naar Quizzes
      </Link>
      <Link to="/home" className="btn btn-outline-secondary mb-4">
        ← Terug naar Home
      </Link>
      </div>
      <h2>{quizData.id ? 'Quiz Bewerken' : 'Nieuwe Quiz Maken'}</h2>
      {feedback && <div className={`alert ${feedback.includes('succes') ? 'alert-success' : 'alert-danger'}`}>{feedback}</div>}

      <div className="mb-3">
        <label className="form-label">Quiz Naam</label>
        <input
          type="text"
          className="form-control"
          value={quizData.name}
          onChange={(e) => setQuizData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      {quizData.questions.map((q, qIndex) => (
        <div key={qIndex} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Vraag {qIndex + 1}</span>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => deleteQuestion(qIndex)}
            >
              Vraag Verwijderen
            </button>
          </div>
          <div className="card-body">
            <select
              className="form-select mb-3"
              value={q.type}
              onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
            >
              <option value="text_input">Tekst Invoer</option>
              <option value="multiple_choice">Meerkeuze</option>
              <option value="slider">Slider</option>
            </select>

            <textarea
              className="form-control mb-3"
              placeholder="Vraagtekst"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
              required
            />

            {q.type === 'text_input' && (
              <>
                <div className="mb-3">
                  <label>Maximale lengte</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.max_length}
                    onChange={(e) => updateQuestion(qIndex, 'max_length', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Correct Antwoord</label>
                  <input
                    type="text"
                    className="form-control"
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {q.type === 'slider' && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col">
                    <label>Minimum Waarde</label>
                    <input
                      type="number"
                      className="form-control"
                      value={q.min}
                      onChange={(e) => updateQuestion(qIndex, 'min', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col">
                    <label>Maximum Waarde</label>
                    <input
                      type="number"
                      className="form-control"
                      value={q.max}
                      onChange={(e) => updateQuestion(qIndex, 'max', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col">
                    <label>Stapgrootte</label>
                    <input
                      type="number"
                      className="form-control"
                      value={q.step}
                      onChange={(e) => updateQuestion(qIndex, 'step', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label>Correcte Waarde</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.correct_value || ''}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'correct_value', parseInt(e.target.value))
                    }
                    required
                  />
                </div>
              </>
            )}

            {q.type === 'multiple_choice' && (
              <div className="mb-3">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optie tekst"
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                      required
                    />
                    <div className="input-group-text">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
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
                  <button className="btn btn-sm btn-secondary" onClick={() => addOption(qIndex)}>
                    Optie Toevoegen
                  </button>
                  <small className="text-muted">{q.options.length} optie(s)</small>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="mb-3">
        <button type="button" className="btn btn-secondary me-2" onClick={() => addQuestion('text_input')}>
          Tekstvraag Toevoegen
        </button>
        <button type="button" className="btn btn-secondary me-2" onClick={() => addQuestion('multiple_choice')}>
          Meerkeuzevraag Toevoegen
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => addQuestion('slider')}>
          Slidervraag Toevoegen
        </button>
      </div>

      <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
        {quizData.id ? 'Wijzigingen Opslaan' : 'Quiz Aanmaken'}
      </button>
    </div>
  );
}

export default QuizMaker;