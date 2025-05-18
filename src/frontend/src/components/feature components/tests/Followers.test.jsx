// src/frontend/src/components/feature components/tests/Followers.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Followers from '../Followers';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

describe('Followers Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock for initial profile check (to prevent redirect)
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ id: 1, username: 'testuser' }) 
    });
    // Mocks for followers, following, allUsers (return empty arrays for simplicity)
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ([]) // followers
    });
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ([]) // following
    });
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ([]) // allUsers
    });
  });

  test('renders manage connections and search', async () => {
    render(
      <MemoryRouter>
        <Followers />
      </MemoryRouter>
    );

    // Wait for initial data fetching to complete
    await waitFor(() => {
      expect(screen.getByText('Manage Connections')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Search for users...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('renders tabs for Followers, Following, and Discover Users', async () => {
    render(
      <MemoryRouter>
        <Followers />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Followers/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Following/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discover Users/i })).toBeInTheDocument();
  });

  test('shows empty state for followers list initially', async () => {
    render(
      <MemoryRouter>
        <Followers />
      </MemoryRouter>
    );
    // Default tab is 'followers'
    await waitFor(() => {
      expect(screen.getByText('No followers yet.')).toBeInTheDocument();
    });
  });

  test('can switch to Following tab and shows empty state', async () => {
    render(
      <MemoryRouter>
        <Followers />
      </MemoryRouter>
    );

    await waitFor(() => { // Ensure initial render is done
      expect(screen.getByRole('button', { name: /Following/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Following/i }));

    await waitFor(() => {
      expect(screen.getByText('You are not following anyone yet.')).toBeInTheDocument();
    });
  });
});