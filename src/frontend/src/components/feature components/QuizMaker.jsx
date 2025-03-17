// frontend/src/components/feature components/QuizMaker.jsx
import React, { useState } from 'react';

/**
 * QuizMaker Component
 *
 * Deze component biedt een formulier om een nieuwe quiz aan te maken.
 * De gebruiker kan een quiznaam invoeren en door op de "Create Quiz" knop te klikken,
 * wordt een POST request verstuurd naar de backend om de quiz op te slaan.
 * Feedback over het resultaat wordt getoond.
 */
function QuizMaker() {
  const [quizName, setQuizName] = useState(''); // Houdt de ingevoerde quiznaam bij
  const [feedback, setFeedback] = useState(''); // Houdt feedback of foutmeldingen bij

  /**
   * handleCreateQuiz verwerkt het aanmaken van een nieuwe quiz.
   * Het controleert of een naam is ingevoerd, verstuurt de data naar de backend en verwerkt de response.
   */
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
        body: JSON.stringify({ name: quizName })
      });
      if (!response.ok) {
        const data = await response.json();
        setFeedback(data.error || 'Er trad een fout op bij het aanmaken van je quiz.');
      } else {
        const data = await response.json();
        setFeedback(`Succes! Quiz met ID ${data.quiz_id} is aangemaakt.`);
        setQuizName(''); // Reset het invoerveld
      }
    } catch (err) {
      setFeedback('Netwerkfout: kon de quiz niet aanmaken.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create a new Quiz</h2>
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

      <button className="btn btn-primary" onClick={handleCreateQuiz}>
        Create Quiz
      </button>
    </div>
  );
}

export default QuizMaker;
