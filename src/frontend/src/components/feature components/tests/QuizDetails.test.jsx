// src/frontend/src/components/feature components/tests/QuizDetails.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuizDetails from '../QuizDetails';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

describe('QuizDetails Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders quiz details and action buttons', async () => {
    const mockQuizData = {
      id: 1,
      name: 'Amazing Quiz',
      creator: 'QuizMaster',
      creator_avatar: 1,
      creator_id: 10,
      created_at: new Date().toISOString(),
      questions_count: 5,
      questions: [ {id:1, text:"Q1", type:"multiple_choice"} ], // Minimal question data
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuizData,
    });

    render(
      <MemoryRouter initialEntries={['/quiz/1']}>
        <Routes>
          <Route path="/quiz/:quizId" element={<QuizDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Amazing Quiz')).toBeInTheDocument();
    });
    expect(screen.getByText('QuizMaster')).toBeInTheDocument(); // Creator's name
    expect(screen.getByText(/This quiz features 5 questions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simulate Quiz Solo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Host Live Session/i })).toBeInTheDocument();
  });

  test('disables host button if quiz has no questions', async () => {
    const mockQuizDataNoQuestions = {
      id: 2,
      name: 'Empty Quiz',
      creator: 'QuizNoob',
      creator_avatar: 2,
      creator_id: 11,
      created_at: new Date().toISOString(),
      questions_count: 0,
      questions: [],
    };
     fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuizDataNoQuestions,
    });

    render(
      <MemoryRouter initialEntries={['/quiz/2']}>
        <Routes>
          <Route path="/quiz/:quizId" element={<QuizDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Empty Quiz')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Host Live Session/i })).toBeDisabled();
    expect(screen.getByText(/This quiz currently has no questions/i)).toBeInTheDocument();
  });
});