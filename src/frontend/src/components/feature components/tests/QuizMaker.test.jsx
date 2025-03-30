import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizMaker from '../QuizMaker';
import '@testing-library/jest-dom';

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ quiz_id: 1 }),
  })
);

describe('QuizMaker Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders empty quiz form', () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Nieuwe Quiz Maken')).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz Naam')).toBeInTheDocument();
  });

  test('adds and removes questions', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    // Add multiple choice question
    fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    expect(screen.getByText('Vraag 1')).toBeInTheDocument();

    // Delete question
    fireEvent.click(screen.getByText('Vraag Verwijderen'));
    expect(screen.queryByText('Vraag 1')).not.toBeInTheDocument();
  });

  test('validates form submission', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Quiz Aanmaken'));
    expect(await screen.findByText('Geef een quiz-naam op a.u.b.')).toBeInTheDocument();
  });

  test('handles question type switching', async () => {
    render(
      <MemoryRouter>
        <QuizMaker />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    const select = screen.getByRole('combobox');
    
    // Switch to text input
    fireEvent.change(select, { target: { value: 'text_input' }});
    expect(screen.getByLabelText('Correct Antwoord')).toBeInTheDocument();

    // Switch to slider
    fireEvent.change(select, { target: { value: 'slider' }});
    expect(screen.getByLabelText('Correcte Waarde')).toBeInTheDocument();
  });

//   test('submits valid quiz', async () => {
//     render(
//       <MemoryRouter>
//         <QuizMaker />
//       </MemoryRouter>
//     );

//     fireEvent.change(screen.getByLabelText('Quiz Naam'), { 
//       target: { value: 'Test Quiz' } 
//     });
    
//     fireEvent.click(screen.getByText('Meerkeuzevraag Toevoegen'));
    
//     Fill question data
//     fireEvent.change(screen.getAllByRole('textbox')[0], {
//       target: { value: 'Sample question' }
//     });
    
//     Fill option data
//     fireEvent.change(screen.getAllByRole('textbox')[1], {
//       target: { value: 'Option 1' }
//     });
    
//     fireEvent.click(screen.getByRole('checkbox'));
//     fireEvent.click(screen.getByText('Quiz Aanmaken'));

//     await waitFor(() => {
//       expect(fetch).toHaveBeenCalledTimes(1);
//       expect(screen.getByText('Succes! Quiz ID: 1')).toBeInTheDocument();
//     });
//   });
});