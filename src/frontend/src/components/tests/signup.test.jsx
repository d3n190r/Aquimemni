import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Signup';
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom';

describe('Signup', () => {
    test("sign in button calls not with invalid input sign up handler", async () => {
        const mockSignUpHandler = jest.fn();
        render(
            <MemoryRouter>
                <Signup onSignup={mockSignUpHandler} />
            </MemoryRouter>
        );
        const signup_button = screen.getByRole('button', { name:/Make account/i });
        expect(signup_button).toBeInTheDocument();
        await signup_button.click();
        expect(mockSignUpHandler).not.toHaveBeenCalled();
    });

});