// src/frontend/src/components/feature components/Followers.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function Followers() {
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' | 'following' | 'allUsers'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // voor de All Users-tab
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [_error, setError] = useState(''); // Renamed to avoid conflict
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndLists = async () => {
      try {
        const profileResponse = await fetch('/api/profile', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!profileResponse.ok) {
          navigate('/login');
          return;
        }
        // User is authenticated, proceed to fetch follower/following lists
        await fetchFollowers();
        await fetchFollowing();
        await fetchAllUsers();

      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load initial data. Please try refreshing.');
      }
    };
    fetchProfileAndLists();
  }, [navigate]); // Added navigate to dependency array

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/followers', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      } else {
        console.error('Failed to fetch followers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch('/api/following', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      } else {
        console.error('Failed to fetch following:', response.status);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users/all', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        console.error('Failed to fetch all users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchPerformed(false); // Reset before new search
    const trimmedTerm = searchTerm.trim();
    setLastSearchTerm(trimmedTerm); // Store the term that was searched

    if (!trimmedTerm) {
      setSearchResults([]);
      setSearchPerformed(true); // Mark as performed to show "enter a term"
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(trimmedTerm)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search API error:', response.status);
        setSearchResults([]); // Clear results on error
      }
    } catch (error) {
      console.error('Search network error:', error);
      setSearchResults([]);
    } finally {
      setSearchPerformed(true); // Mark as performed to show "no results" or results
    }
  };

  // Helper function to update user's follow status across all lists
  const updateUserFollowStatus = (userId, newFollowStatus) => {
    setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: newFollowStatus } : u));
    setFollowers(prev => prev.map(u => u.id === userId ? { ...u, is_following: newFollowStatus } : u));
    // For the 'following' list, if unfollowed, they might be removed. If followed, they might be added.
    // For 'allUsers', update their status.
    // It's often simpler to re-fetch the lists that are directly affected or rely on search results being primary.
    // For now, we'll re-fetch the main lists.
    fetchFollowing();
    fetchAllUsers();
    fetchFollowers(); // Re-fetch followers too in case 'is_following' for them changed (follow back)
  };


  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        updateUserFollowStatus(userId, true);
      } else {
        console.error('Failed to follow user:', response.status);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await fetch(`/api/unfollow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        updateUserFollowStatus(userId, false);
      } else {
        console.error('Failed to unfollow user:', response.status);
      }
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      const response = await fetch(`/api/followers/${followerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Re-fetch lists to update UI
        await fetchFollowers();
        // If removing a follower also affects 'allUsers' (e.g., 'is_following' from their perspective), fetch that too
        await fetchAllUsers();
      } else {
        console.error('Failed to remove follower:', response.status);
      }
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  // Helper to render a user item - used in multiple lists
  const renderUserItem = (user, actions) => (
    <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
      <Link to={`/profile/view/${user.id}`} className="text-decoration-none text-dark d-flex align-items-center">
        <img
          src={`/avatars/avatar${user.avatar || 1}.png`}
          alt={`${user.username}'s avatar`}
          className="rounded-circle me-3"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        />
        <span className="fw-bold">{user.username}</span>
      </Link>
      <div className="d-flex gap-2">
        {actions}
      </div>
    </li>
  );


  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-10 col-lg-8 offset-md-1 offset-lg-2"> {/* Centered content */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage Connections</h2>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/home')}
            >
              ← Back to Home
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg"> {/* Larger search bar */}
              <input
                type="text"
                className="form-control"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search me-1"></i> Search
              </button>
            </div>
          </form>

          {/* Search Results Display */}
          {searchPerformed && ( // Only show this block if a search has been performed
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Search Results for "{lastSearchTerm}"</h5>
              </div>
              <div className="card-body">
                {searchResults.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {searchResults.map(user => renderUserItem(user,
                      user.is_following ? (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFollow(user.id)}
                        >
                          Follow
                        </button>
                      )
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-center py-3">
                    {lastSearchTerm ? `No users found matching "${lastSearchTerm}".` : "Please enter a search term."}
                  </p>
                )}
              </div>
            </div>
          )}


          <ul className="nav nav-tabs nav-fill mb-4"> {/* nav-fill for equal width tabs */}
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                <i className="bi bi-people-fill me-1"></i> Followers ({followers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                <i className="bi bi-person-check-fill me-1"></i> Following ({following.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'allUsers' ? 'active' : ''}`}
                onClick={() => setActiveTab('allUsers')}
              >
                <i className="bi bi-globe me-1"></i> Discover Users ({allUsers.length})
              </button>
            </li>
          </ul>

          {/* Content for each tab */}
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === 'followers' && (
                followers.length === 0 ? (
                  <p className="text-muted text-center py-3">No followers yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {followers.map(user => renderUserItem(user,
                      <>
                        {!user.is_following && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleFollow(user.id)}
                          >
                            Follow Back
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveFollower(user.id)}
                        >
                          Remove
                        </button>
                      </>
                    ))}
                  </ul>
                )
              )}

              {activeTab === 'following' && (
                following.length === 0 ? (
                  <p className="text-muted text-center py-3">You are not following anyone yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {following.map(user => renderUserItem(user,
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        Unfollow
                      </button>
                    ))}
                  </ul>
                )
              )}

              {activeTab === 'allUsers' && (
                allUsers.length === 0 ? (
                  <p className="text-muted text-center py-3">No users to display.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {allUsers.map(user => renderUserItem(user,
                      user.is_following ? (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFollow(user.id)}
                        >
                          Follow
                        </button>
                      )
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Followers;