import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyQuizzes from '../MyQuizzes';
import '@testing-library/jest-dom';

const mockQuizzes = [
  {
    id: 1,
    name: 'Programming Quiz',
    created_at: '2023-01-01',
    questions: []
  }
];

describe('MyQuizzes Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });
  });

  test('loads and displays quizzes', async () => {
    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Programming Quiz')).toBeInTheDocument();
    });
  });

//   test('handles quiz deletion', async () => {
//     global.fetch.mockResolvedValueOnce({ ok: true });
    
//     render(
//       <MemoryRouter>
//         <MyQuizzes />
//       </MemoryRouter>
//     );

//     await screen.findByText(('Programming Quiz'));
//     fireEvent.click(screen.getAllByText('Verwijderen')[0]);
    
//     await waitFor(() => {
//       expect(fetch).toHaveBeenCalledWith('/api/quizzes/1', {
//         method: 'DELETE',
//         credentials: 'include'
//       });
//     });
//   });

  test('shows empty state', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Je hebt nog geen quiz gemaakt.')).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({error: "Error"}),
    });
    
    render(
      <MemoryRouter>
        <MyQuizzes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Error')).toBeInTheDocument();
  });
});