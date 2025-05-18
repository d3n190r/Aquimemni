// frontend/src/components/feature components/QuizMaker.jsx
/**
 * Quiz maker component for creating and editing quizzes.
 * 
 * This component provides a form interface for users to create new quizzes or edit existing ones.
 * It supports multiple question types (text input, multiple choice, and slider), allows for
 * configuration of question options, and handles form validation and submission to the backend.
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * QuizMaker component for creating and editing quizzes.
 * 
 * Manages the state for quiz data, handles form validation, and communicates with the backend
 * to save quiz information. Supports different question types and provides a user-friendly
 * interface for quiz creation and editing.
 * 
 * @returns {JSX.Element} The rendered quiz maker form
 */
function QuizMaker() {
  const { state } = useLocation();
  const [quizData, setQuizData] = useState({
    id: null,
    name: '',
    questions: []
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission status
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

  /**
   * Creates the initial state for a new question based on its type.
   * 
   * Generates the appropriate default values and structure for each question type
   * (multiple choice, slider, or text input) to ensure the form fields are properly initialized.
   * 
   * @param {string} type - The type of question to create ('multiple_choice', 'slider', or 'text_input')
   * @returns {Object} An object with the initial state for the specified question type
   */
  const getInitialQuestionState = (type) => {
    const base = { type, text: '' };
    switch(type) {
      case 'multiple_choice':
        return { ...base, options: [{ text: '', isCorrect: false }] };
      case 'slider':
        // Ensure default correct_value is null or within initial range if needed
        return { ...base, min: 0, max: 10, step: 1, correct_value: null };
      case 'text_input':
        return { ...base, max_length: 255, correct_answer: '' };
      default:
        return base;
    }
  };

  /**
   * Adds a new question of the specified type to the quiz.
   * 
   * Creates a new question with default values based on the question type
   * and adds it to the quiz's questions array.
   * 
   * @param {string} type - The type of question to add ('multiple_choice', 'slider', or 'text_input')
   */
  const addQuestion = (type) => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, getInitialQuestionState(type)]
    }));
  };

  /**
   * Handles changing the type of an existing question.
   * 
   * Replaces the current question with a new question of the specified type,
   * resetting all type-specific fields while maintaining the question's position.
   * 
   * @param {number} qIndex - The index of the question to change
   * @param {string} newType - The new question type to set
   */
  const handleQuestionTypeChange = (qIndex, newType) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Replace the question state with the initial state for the new type, keeping the index
      updatedQuestions[qIndex] = getInitialQuestionState(newType);
      return { ...prev, questions: updatedQuestions };
    });
  };

  /**
   * Validates a single question for completeness and correctness.
   * 
   * Performs type-specific validation on the question, checking for required fields,
   * valid ranges, and other constraints based on the question type.
   * 
   * @param {Object} question - The question object to validate
   * @param {number} index - The index of the question in the quiz
   * @returns {Array} An array of error messages, empty if the question is valid
   */
  const validateQuestion = (question, index) => {
    const errors = [];
    const questionNumber = index + 1;

    if (!question.text.trim()) {
      errors.push(`Question ${questionNumber}: Question text is required`);
    }

    switch (question.type) {
      case 'text_input':
        if (!question.correct_answer?.trim()) {
          errors.push(`Question ${questionNumber}: Correct answer is required`);
        }
        if (!question.max_length || question.max_length < 1 || question.max_length > 500) {
          errors.push(`Question ${questionNumber}: Invalid max length (must be 1-500)`);
        }
        break;

      case 'slider':
        const min = Number(question.min);
        const max = Number(question.max);
        const step = Number(question.step);
        const correctValue = question.correct_value !== null ? Number(question.correct_value) : null;

        if (isNaN(min) || isNaN(max) || isNaN(step)) {
             errors.push(`Question ${questionNumber}: Min, Max, and Step must be numbers`);
        } else {
            if (min >= max) {
              errors.push(`Question ${questionNumber}: Min value (${min}) must be less than Max value (${max})`);
            }
            if (step < 1 || step > (max - min)) {
              errors.push(`Question ${questionNumber}: Step size (${step}) must be at least 1 and no larger than the range (${max - min})`);
            }
            if (correctValue === null || isNaN(correctValue)) {
                errors.push(`Question ${questionNumber}: Correct value is required and must be a number`);
            } else if (correctValue < min || correctValue > max) {
              errors.push(`Question ${questionNumber}: Correct value (${correctValue}) must be between Min (${min}) and Max (${max})`);
            } else if ((correctValue - min) % step !== 0) {
                errors.push(`Question ${questionNumber}: Correct value (${correctValue}) must be reachable with the step size (${step}) starting from Min (${min})`);
            }
        }
        break;

      case 'multiple_choice':
        if (!question.options || question.options.length < 2) {
          errors.push(`Question ${questionNumber}: Minimum 2 options are required`);
        } else {
            if (!question.options.some(opt => opt.isCorrect)) {
              errors.push(`Question ${questionNumber}: At least one correct option must be selected`);
            }
            question.options.forEach((opt, optIndex) => {
              if (!opt.text.trim()) {
                errors.push(`Question ${questionNumber}, Option ${optIndex + 1}: Option text cannot be empty`);
              }
            });
        }
        break;

      default:
        errors.push(`Question ${questionNumber}: Unknown or unsupported question type`);
    }

    return errors;
  };

  /**
   * Handles the form submission for creating or updating a quiz.
   * 
   * Validates the entire form, prepares the data for the API, sends the request,
   * and handles success or error responses. Prevents multiple submissions and
   * provides feedback to the user throughout the process.
   * 
   * @param {Event} e - The form submission event
   * @returns {Promise<void>} A promise that resolves when the submission process completes
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Prevent clicks if already submitting
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring click.");
      return;
    }

    // 2. Start submission process
    setIsSubmitting(true);
    setFeedback('');

    // --- Validation ---
    if (!quizData.name || !quizData.name.trim()) {
      setFeedback('Please provide a quiz name.');
      setIsSubmitting(false); // Reset on validation failure
      return;
    }
     if (quizData.questions.length === 0) {
      setFeedback('Please add at least one question to the quiz.');
      setIsSubmitting(false); // Reset on validation failure
      return;
    }


    const validationErrors = quizData.questions
      .map((q, index) => validateQuestion(q, index))
      .flat(); // Flatten array of arrays into a single array

    if (validationErrors.length > 0) {
      // Format errors nicely for feedback
      setFeedback(`Please fix the following errors:\n- ${validationErrors.join('\n- ')}`);
      setIsSubmitting(false); // Reset on validation failure
      return;
    }

    // --- Prepare Data for API ---
    const apiData = {
      name: quizData.name.trim(),
      questions: quizData.questions.map(q => {
        const baseQuestion = {
          type: q.type,
          text: q.text.trim(),
        };
        switch (q.type) {
          case 'multiple_choice':
            return {
              ...baseQuestion,
              options: q.options.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect // In backend: is_correct
              }))
            };
          case 'slider':
            return {
              ...baseQuestion,
              min: Number(q.min),
              max: Number(q.max),
              step: Number(q.step),
              correct_value: Number(q.correct_value)
            };
          case 'text_input':
            return {
              ...baseQuestion,
              max_length: Number(q.max_length),
              correct_answer: q.correct_answer.trim()
            };
          default:
            // Should not happen due to validation, but good practice
            console.error("Trying to submit unknown question type:", q.type);
            return null;
        }
      }).filter(q => q !== null), // Filter out any potential nulls
    };


    // --- API Call ---
    const endpoint = quizData.id ? `/api/quizzes/${quizData.id}` : '/api/quiz';
    const method = quizData.id ? 'PUT' : 'POST';

    try {
      console.log(`Sending ${method} request to ${endpoint} with data:`, apiData);
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(apiData),
      });

      const responseBody = await response.json(); // Read body once

      if (!response.ok) {
          // Log detailed error info
          console.error(`API Error: ${response.status} ${response.statusText}`, responseBody);
          // Throw error with message from backend if available, otherwise generic message
          throw new Error(responseBody.error || `Operation failed with status ${response.status}`);
      }

      // --- Success ---
      console.log("API call successful:", responseBody);
      setFeedback(quizData.id ? 'Quiz updated successfully!' : `Success! Quiz created with ID: ${responseBody.quiz_id}`);
      // Keep isSubmitting = true here! Button remains disabled.
      setTimeout(() => {
        console.log("Navigating to /my-quizzes...");
        navigate('/my-quizzes');
        // No need to set isSubmitting to false, component will unmount.
      }, 2000); // 2-second delay before navigating

    } catch (err) {
      // --- Error Handling (Fetch errors, JSON parsing errors, or errors thrown above) ---
      console.error("Error during submission process:", err);
      // Display the error message from the caught error object
      setFeedback(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false); // Reset *only* on error so user can retry
    }
    // No finally block resetting isSubmitting needed for the success case
  };


  /**
   * Updates a specific field of a question.
   * 
   * Modifies a single field in a question while preserving the rest of the question's data.
   * Handles special cases for numeric fields.
   * 
   * @param {number} qIndex - The index of the question to update
   * @param {string} field - The name of the field to update
   * @param {any} value - The new value for the field
   */
  const updateQuestion = (qIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Handle number inputs specifically if needed
      if (field === 'min' || field === 'max' || field === 'step' || field === 'max_length' || field === 'correct_value') {
          // Allow empty string for temporary state, but validation will catch it
          // Or parse immediately: const numValue = value === '' ? '' : parseInt(value, 10);
          updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
      } else {
          updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  /**
   * Updates a specific field of an option within a multiple choice question.
   * 
   * Modifies a single field in an option while preserving the rest of the option's data
   * and the structure of the parent question.
   * 
   * @param {number} qIndex - The index of the question containing the option
   * @param {number} oIndex - The index of the option to update
   * @param {string} field - The name of the field to update
   * @param {any} value - The new value for the field
   */
  const updateOption = (qIndex, oIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[oIndex] = { ...updatedOptions[oIndex], [field]: value };
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  /**
   * Adds a new option to a multiple choice question.
   * 
   * Creates a new option with default values and adds it to the specified
   * multiple choice question's options array.
   * 
   * @param {number} qIndex - The index of the question to add the option to
   */
  const addOption = (qIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      // Ensure options array exists
      if (!updatedQuestions[qIndex].options) {
          updatedQuestions[qIndex].options = [];
      }
      updatedQuestions[qIndex].options = [
        ...updatedQuestions[qIndex].options,
        { text: '', isCorrect: false } // New option defaults
      ];
      return { ...prev, questions: updatedQuestions };
    });
  };

  /**
   * Deletes an option from a multiple choice question.
   * 
   * Removes the specified option from the question's options array.
   * 
   * @param {number} qIndex - The index of the question containing the option
   * @param {number} oIndex - The index of the option to delete
   */
  const deleteOption = (qIndex, oIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
      return { ...prev, questions: updatedQuestions };
    });
  };

  /**
   * Deletes a question from the quiz.
   * 
   * Removes the specified question from the quiz's questions array.
   * 
   * @param {number} qIndex - The index of the question to delete
   */
  const deleteQuestion = (qIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  // --- Render Component ---
  return (
    <div className="container mt-4">
      {/* Navigation Links */}
      <div className="d-flex gap-2 align-items-center mb-4"> {/* Increased gap */}
        <Link to="/home" className="btn btn-sm btn-outline-secondary"> {/* Smaller button */}
          ← Back to Home
        </Link>
        <Link to="/my-quizzes" className="btn btn-sm btn-outline-secondary"> {/* Smaller button */}
          ← Back to My Quizzes
        </Link>
      </div>

      {/* Title */}
      <h2>{quizData.id ? 'Edit Quiz' : 'Create New Quiz'}</h2>

      {/* Feedback Area */}
      {/* Use pre-wrap to preserve line breaks in validation errors */}
      {feedback && (
        <div
          className={`alert ${feedback.includes('Success') || feedback.includes('updated successfully') ? 'alert-success' : 'alert-danger'}`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {feedback}
        </div>
      )}

      {/* Quiz Name Input */}
      <div className="mb-3">
        <label htmlFor="quizName" className="form-label">Quiz Name</label>
        <input
          type="text"
          id="quizName"
          className="form-control"
          value={quizData.name}
          onChange={(e) => setQuizData(prev => ({ ...prev, name: e.target.value }))}
          required
          maxLength={100} // Add a reasonable max length
          disabled={isSubmitting} // Disable input while submitting
        />
      </div>

      {/* Questions List */}
      {quizData.questions.map((q, qIndex) => (
        <div key={qIndex} className="card mb-3 shadow-sm"> {/* Added subtle shadow */}
          <div className="card-header d-flex justify-content-between align-items-center bg-light"> {/* Light background */}
            <span className="fw-bold">Question {qIndex + 1}</span> {/* Bold question number */}
            <button
              type="button" // Important for forms
              className="btn btn-danger btn-sm"
              onClick={() => deleteQuestion(qIndex)}
              disabled={isSubmitting} // Disable delete button during submit
              aria-label={`Delete Question ${qIndex + 1}`}
            >
              Delete Question
            </button>
          </div>
          <div className="card-body">
            {/* Question Type Selector */}
            <div className="mb-3">
              <label htmlFor={`qtype-${qIndex}`} className="form-label">Question Type</label>
              <select
                id={`qtype-${qIndex}`}
                className="form-select"
                value={q.type}
                onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                disabled={isSubmitting} // Disable type change during submit
              >
                <option value="text_input">Text Input</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="slider">Slider</option>
              </select>
            </div>

            {/* Question Text Input */}
            <div className="mb-3">
             <label htmlFor={`qtext-${qIndex}`} className="form-label">Question Text</label>
             <textarea
                id={`qtext-${qIndex}`}
                className="form-control"
                placeholder="Enter the question here..."
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                required
                rows={3} // Slightly larger text area
                disabled={isSubmitting} // Disable text editing during submit
              />
            </div>


            {/* --- Type-Specific Fields --- */}

            {/* Text Input Fields */}
            {q.type === 'text_input' && (
              <>
                <div className="mb-3">
                  <label htmlFor={`qmaxlen-${qIndex}`} className="form-label">Max Answer Length</label>
                  <input
                    id={`qmaxlen-${qIndex}`}
                    type="number"
                    className="form-control"
                    value={q.max_length}
                    onChange={(e) => updateQuestion(qIndex, 'max_length', e.target.value)}
                    min="1"
                    max="500" // Match validation
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor={`qcorrectans-${qIndex}`} className="form-label">Correct Answer</label>
                  <input
                    id={`qcorrectans-${qIndex}`}
                    type="text"
                    className="form-control"
                    placeholder="The exact correct answer"
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                    required
                    maxLength={q.max_length || 500} // Dynamically set max length based on field above
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {/* Slider Fields */}
            {q.type === 'slider' && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-3 col-sm-6"> {/* Responsive columns */}
                    <label htmlFor={`qmin-${qIndex}`} className="form-label">Min Value</label>
                    <input
                      id={`qmin-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.min}
                      onChange={(e) => updateQuestion(qIndex, 'min', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <label htmlFor={`qmax-${qIndex}`} className="form-label">Max Value</label>
                    <input
                      id={`qmax-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.max}
                      onChange={(e) => updateQuestion(qIndex, 'max', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <label htmlFor={`qstep-${qIndex}`} className="form-label">Step Size</label>
                    <input
                      id={`qstep-${qIndex}`}
                      type="number"
                      className="form-control"
                      value={q.step}
                      onChange={(e) => updateQuestion(qIndex, 'step', e.target.value)}
                      min="1" // Basic validation on input
                      disabled={isSubmitting}
                    />
                  </div>
                   <div className="col-md-3 col-sm-6">
                     <label htmlFor={`qcorrectval-${qIndex}`} className="form-label">Correct Value</label>
                     <input
                       id={`qcorrectval-${qIndex}`}
                       type="number"
                       className="form-control"
                       // Use controlled component approach, handle null/empty string
                       value={q.correct_value === null ? '' : q.correct_value}
                       onChange={(e) =>
                         updateQuestion(qIndex, 'correct_value', e.target.value === '' ? null : e.target.value)
                       }
                       step={q.step || 1} // Use step value for browser increments/decrements
                       min={q.min || 0}   // Use min/max for browser validation hints
                       max={q.max || 10}
                       required
                       disabled={isSubmitting}
                     />
                  </div>
                </div>
              </>
            )}

            {/* Multiple Choice Fields */}
            {q.type === 'multiple_choice' && (
              <div className="mb-1"> {/* Reduced margin */}
                <label className="form-label d-block mb-2">Options (Select correct answer(s))</label> {/* Clearer label */}
                {q.options?.map((option, oIndex) => ( // Added safe navigation ?.
                  <div key={oIndex} className="input-group mb-2">
                    {/* Option Text Input */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                      required
                      disabled={isSubmitting} // Disable option text editing
                      aria-label={`Option ${oIndex + 1} text`}
                    />
                    {/* Correct Answer Checkbox */}
                    <div className="input-group-text">
                      <input
                        className="form-check-input mt-0" // Bootstrap class for alignment
                        type="checkbox"
                        id={`q-${qIndex}-opt-${oIndex}-correct`}
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                        disabled={isSubmitting} // Disable checkbox
                        aria-labelledby={`q-${qIndex}-opt-${oIndex}-label`} // Link checkbox to label for accessibility
                      />
                       <label htmlFor={`q-${qIndex}-opt-${oIndex}-correct`} id={`q-${qIndex}-opt-${oIndex}-label`} className="ms-2 visually-hidden">Correct</label> {/* Hidden label for screen readers */}
                    </div>
                    {/* Delete Option Button */}
                    <button
                      type="button" // Important for forms
                      className="btn btn-outline-danger"
                      onClick={() => deleteOption(qIndex, oIndex)}
                      // Disable if submitting OR if it's the last option (or less than 2)
                      disabled={isSubmitting || q.options.length <= 1}
                      aria-label={`Delete Option ${oIndex + 1}`}
                    >
                      × {/* Use HTML entity for multiplication sign '×' */}
                    </button>
                  </div>
                ))}
                {/* Add Option Button and Counter */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button
                    type="button" // Important for forms
                    className="btn btn-sm btn-outline-primary" // Changed style slightly
                    onClick={() => addOption(qIndex)}
                    disabled={isSubmitting} // Disable add option button
                  >
                    Add Option <span aria-hidden="true">+</span>
                  </button>
                  <small className="text-muted">{q.options?.length || 0} option(s)</small>
                </div>
              </div>
            )}
          </div> {/* End card-body */}
        </div> /* End card */
      ))}

      {/* Add Question Buttons */}
      <div className="mb-4 mt-4 border-top pt-3"> {/* Added separator */}
        <h5>Add New Question</h5>
        <button
          type="button" // Important for forms
          className="btn btn-success me-2 mb-2" // Success style
          onClick={() => addQuestion('text_input')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Text Question
        </button>
        <button
          type="button" // Important for forms
          className="btn btn-success me-2 mb-2"
          onClick={() => addQuestion('multiple_choice')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Multiple Choice
        </button>
        <button
          type="button" // Important for forms
          className="btn btn-success mb-2"
          onClick={() => addQuestion('slider')}
          disabled={isSubmitting} // Disable add question buttons
        >
          Add Slider Question
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-3">
        <button
          type="submit"
          className="btn btn-primary btn-lg" // Larger submit button
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable button when submitting
        >
          {isSubmitting
              ? (quizData.id ? 'Saving Changes...' : 'Creating Quiz...') // Provide feedback during submission
              : (quizData.id ? 'Save Changes' : 'Create Quiz')
          }
          {isSubmitting && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>} {/* Add spinner */}
        </button>
      </div>

    </div> /* End container */
  );
}

export default QuizMaker;
