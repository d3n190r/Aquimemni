// frontend/src/components/feature components/MyQuizzes.jsx
import React, { useEffect, useState } from 'react';

/**
 * MyQuizzes Component
 *
 * Deze component haalt de lijst van quizzes op die behoren tot de ingelogde gebruiker
 * en geeft deze weer. Als er een fout optreedt of er geen quizzes beschikbaar zijn,
 * wordt er een passende melding getoond.
 */
function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]); // State voor de opgehaalde quizzes
  const [error, setError] = useState(''); // State voor foutmeldingen

  useEffect(() => {
    /**
     * fetchQuizzes haalt de quizzes op door een API call naar de backend.
     * Bij een succesvolle response worden de data opgeslagen, anders wordt een foutmelding ingesteld.
     */
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
      } catch (err) {
        setError('Er trad een netwerkfout op bij het laden van quizzes');
        console.error(err);
      }
    };

    fetchQuizzes();
  }, []); // Lege dependency array: voer dit alleen bij mount uit

  // Als er een fout is, wordt deze getoond
  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  // Render de lijst van quizzes of een bericht als er geen quizzes zijn
  return (
    <div className="container mt-4">
      <h2>My Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>Je hebt nog geen quiz gemaakt.</p>
      ) : (
        <ul className="list-group">
          {quizzes.map(quiz => (
            <li key={quiz.id} className="list-group-item">
              {quiz.name} - aangemaakt op {new Date(quiz.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyQuizzes;
