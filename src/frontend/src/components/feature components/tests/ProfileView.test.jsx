// src/frontend/src/components/feature components/tests/ProfileView.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfileView from '../ProfileView';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

describe('ProfileView Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders public profile information', async () => {
    const mockProfileData = {
      id: 2,
      username: 'publicUser',
      bio: 'Public bio content.',
      avatar: 2,
      registered_at: new Date().toISOString(),
      is_following: false,
      viewing_own_profile: false, // This implies the logged-in user is different
      quizzes: [],
      followers_count: 5,
      following_count: 10,
      banner_type: 'color',
      banner_value: '#0d6efd',
    };

    // Mock for /api/profile (logged-in user)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'currentUser' }), 
    });
    // Mock for /api/users/:userId/profile (public profile)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfileData,
    });

    render(
      <MemoryRouter initialEntries={['/profile/view/2']}>
        <Routes>
          <Route path="/profile/view/:userId" element={<ProfileView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('publicUser')).toBeInTheDocument();
    });
    expect(screen.getByText('Public bio content.')).toBeInTheDocument();
    expect(screen.getByText(/5 Followers/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Following/i)).toBeInTheDocument();
    // Check for follow button because viewing_own_profile is false and loggedInUserId is different
    expect(screen.getByRole('button', { name: /Follow/i })).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    // Make fetch promise never resolve for this test to show loading
    fetch.mockImplementation(() => new Promise(() => {})); 

    render(
      <MemoryRouter initialEntries={['/profile/view/3']}>
        <Routes>
          <Route path="/profile/view/:userId" element={<ProfileView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });
});