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

  // Fixed question type initialization
  const getInitialQuestionState = (type) => {
    const base = { type, text: '' };
    switch(type) {
      case 'multiple_choice':
        return { ...base, options: [{ text: '', isCorrect: false }] };
      case 'slider':
        return { ...base, min: 0, max: 10, step: 1, correct_value: null };
      case 'text_input':
        return { ...base, max_length: 255, correct_answer: '' };
      default:
        return base;
    }
  };

  const addQuestion = (type) => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, getInitialQuestionState(type)]
    }));
  };

  // Fixed question type change handler
  const handleQuestionTypeChange = (qIndex, newType) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex] = getInitialQuestionState(newType);
      return { ...prev, questions: updatedQuestions };
    });
  };

  const validateQuestion = (question, index) => {
    const errors = [];
    const questionNumber = index + 1;
  
    // Common validation for all question types
    if (!question.text.trim()) {
      errors.push(`Question ${questionNumber}: Question text is required`);
    }
  
    // Type-specific validation
    switch (question.type) {
      case 'text_input':
        if (!question.correct_answer?.trim()) {
          errors.push(`Question ${questionNumber}: Correct answer is required`);
        }
        if (!question.max_length || question.max_length < 1 || question.max_length > 500) {
          errors.push(`Question ${questionNumber}: Invalid max length (1-500)`);
        }
        break;
  
      case 'slider':
        if (question.min >= question.max) {
          errors.push(`Question ${questionNumber}: Min must be less than max`);
        }
        if (question.step < 1 || question.step > (question.max - question.min)) {
          errors.push(`Question ${questionNumber}: Invalid step size`);
        }
        if (typeof question.correct_value !== 'number' || 
            question.correct_value < question.min || 
            question.correct_value > question.max) {
          errors.push(`Question ${questionNumber}: Correct value must be between min and max`);
        }
        break;
  
      case 'multiple_choice':
        if (question.options.length < 2) {
          errors.push(`Question ${questionNumber}: Minimum 2 options required`);
        }
        if (!question.options.some(opt => opt.isCorrect)) {
          errors.push(`Question ${questionNumber}: At least 1 correct option required`);
        }
        question.options.forEach((opt, optIndex) => {
          if (!opt.text.trim()) {
            errors.push(`Question ${questionNumber}: Option ${optIndex + 1} text is required`);
          }
        });
        break;
  
      default:
        errors.push(`Question ${questionNumber}: Unknown question type`);
    }
  
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    
    if (!quizData.name) {
      setFeedback('Please provide a quiz name');
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

      setFeedback(quizData.id ? 'Quiz updated successfully!' : `Success! Quiz ID: ${data.quiz_id}`);
      setTimeout(() => navigate('/my-quizzes'), 2000);
      
    } catch (err) {
      setFeedback(err.message || 'An error occurred');
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
      return { ...prev, questions: updated };
    });
  };

  const addOption = (qIndex) => {
    setQuizData(prev => {
      const updated = JSON.parse(JSON.stringify([...prev.questions]));
      updated[qIndex].options = [
        ...updated[qIndex].options,
        { text: '', isCorrect: false }
      ];
      return {...prev, questions: updated};
    });
  };

  const deleteOption = (qIndex, oIndex) => {
    setQuizData(prev => {
      const updated = JSON.parse(JSON.stringify([...prev.questions]));
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
        <Link to="/home" className="btn btn-outline-secondary mb-4">
          ← Back to Home
        </Link>
        <Link to="/my-quizzes" className="btn btn-outline-secondary mb-4">
          ← Back to Quizzes
        </Link>
      </div>
      <h2>{quizData.id ? 'Edit Quiz' : 'Create New Quiz'}</h2>
      {feedback && <div className={`alert ${feedback.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>{feedback}</div>}

      <div className="mb-3">
        <label className="form-label">Quiz Name</label>
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
              onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
            >
              <option value="text_input">Text Input</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="slider">Slider</option>
            </select>

            <textarea
              className="form-control mb-3"
              placeholder="Question text"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
              required
            />

            {q.type === 'text_input' && (
              <>
                <div className="mb-3">
                  <label>Max Length</label>
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
                  <label>Correct Answer</label>
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
                    <label>Min Value</label>
                    <input
                      type="number"
                      className="form-control"
                      value={q.min}
                      onChange={(e) => updateQuestion(qIndex, 'min', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col">
                    <label>Max Value</label>
                    <input
                      type="number"
                      className="form-control"
                      value={q.max}
                      onChange={(e) => updateQuestion(qIndex, 'max', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col">
                    <label>Step Size</label>
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
                  <label>Correct Value</label>
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
                      placeholder="Option text"
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
                    Add Option (+)
                  </button>
                  <small className="text-muted">{q.options.length} option(s)</small>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="mb-3">
        <button type="button" className="btn btn-secondary me-2" onClick={() => addQuestion('text_input')}>
          Add Text Question
        </button>
        <button type="button" className="btn btn-secondary me-2" onClick={() => addQuestion('multiple_choice')}>
          Add Multiple Choice Question
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => addQuestion('slider')}>
          Add Slider Question
        </button>
      </div>

      <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
        {quizData.id ? 'Save Changes' : 'Create Quiz'}
      </button>
    </div>
  );
}

export default QuizMaker;