import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Quiz from '../feature components/Quiz';
// src/components/tests/Quiz.test.js
import '@testing-library/jest-dom'; // Changed from extend-expect

// Mock fetch voor je API-calls naar /api/home en de trivia API
global.fetch = jest.fn();

describe('Quiz component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading if questions array is empty', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true }}>
        <Quiz onLogout={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading questions.../i)).toBeInTheDocument();
  });

  test('starts quiz when clicking "Start Quiz"', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            category: 'Science: Computers',
            type: 'multiple',
            question: 'Which is a JavaScript framework?',
            correct_answer: 'React',
            incorrect_answers: ['C', 'Rust', 'Python']
          }]
        })
      })
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true }}>
        <Quiz onLogout={jest.fn()} />
      </MemoryRouter>
    );

    // Wait for button to appear
    const startBtn = await screen.findByRole('button', { name: /start quiz/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText(/which is a javascript framework/i)).toBeInTheDocument();
  });

});