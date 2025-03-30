import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizSimulator from '../QuizSimulator';
import '@testing-library/jest-dom';

jest.useFakeTimers();

const mockQuiz = {
  id: 1,
  name: 'Test Quiz',
  questions: [
    {
      type: 'multiple_choice',
      text: 'What is React?',
      options: [
        { text: 'Library', isCorrect: true },
        { text: 'Framework', isCorrect: false }
      ]
    }
  ]
};

describe('QuizSimulator Component', () => {
  test('starts and completes quiz', async () => {
    render(
      <MemoryRouter>
        <QuizSimulator quiz={mockQuiz} />
      </MemoryRouter>
    );
    
    // Answer question
    setTimeout(() => {
      fireEvent.click(screen.getByText('Library'));
      fireEvent.click(screen.getByText('Next Question →'));
    
      // Verify completion
      expect(screen.getByText('Quiz Completed!')).toBeInTheDocument();
      expect(screen.getByText('Score: 1/1')).toBeInTheDocument();
    }, 1000); 

  });

  test('handles navigation after completion', async () => {
    const navigate = jest.fn();
    
    render(
      <MemoryRouter>
        <QuizSimulator quiz={mockQuiz} navigate={navigate} />
      </MemoryRouter>
    );
    setTimeout(() => {
        fireEvent.click(screen.getByText('Library'));
        fireEvent.click(screen.getByText('Next Question →'));
        fireEvent.click(screen.getByText('Back to Quizzes'));
        expect(navigate).toHaveBeenCalledWith('/my-quizzes');
        }, 1000);
  });
});