import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import '@testing-library/jest-dom';

describe('Login', () => {
    test("login in button calls not for invalid input sign up handler", async () => {
        const mockLogInHandler = jest.fn();
        render(
            <MemoryRouter>
                <Login onLogin={mockLogInHandler} />
            </MemoryRouter>
        );
        const login_button = screen.getByRole('button', { name:/Log in/i });
        expect(login_button).toBeInTheDocument();
        await login_button.click();
        expect(mockLogInHandler).not.toHaveBeenCalled();
    });

});


