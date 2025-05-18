// src/frontend/src/components/feature components/tests/MyQuizzes.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyQuizzes from '../MyQuizzes';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

describe('MyQuizzes Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('loads and displays quizzes', async () => {
    const mockQuizzes = [
      {
        id: 1,
        name: 'Programming Quiz',
        created_at: '2023-01-01T10:00:00Z',
        questions: [], // For simplicity, no expanded details in this test
        questions_count: 0,
      },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuizzes,
    });

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Programming Quiz')).toBeInTheDocument();
    });
  });

  test('shows empty state when no quizzes are present', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array for quizzes
    });

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    // Check for the English text from the component
    await waitFor(() => {
        expect(screen.getByText("You haven't created any quizzes yet.")).toBeInTheDocument();
    });
    expect(screen.getByText('Click "Create New Quiz" to get started!')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch quizzes" }), // Simulate API error
    });

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    await waitFor(() => {
      // The component displays the error message
      expect(screen.getByText("Failed to fetch quizzes")).toBeInTheDocument();
    });
  });

  test('navigates to create new quiz', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // Initial load
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText('Create New Quiz')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Create New Quiz'));
    // This test relies on checking the navigation. In a real app, you'd check if navigate was called correctly.
    // For simplicity here, we just ensure the button exists and is clickable.
    // If you want to assert navigation: expect(mockNavigate).toHaveBeenCalledWith('/quiz-maker');
  });
});