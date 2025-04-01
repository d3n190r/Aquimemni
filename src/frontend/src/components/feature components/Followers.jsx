import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Followers() {
  const [activeTab, setActiveTab] = useState('followers');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await fetchFollowers();
      await fetchFollowing();
    };
    fetchData();
  }, []);

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/followers', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
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
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchPerformed(false);
    const trimmedTerm = searchTerm.trim();
    setLastSearchTerm(trimmedTerm);

    if (!trimmedTerm) {
      setSearchResults([]);
      setSearchPerformed(true);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(trimmedTerm)}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchPerformed(true);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSearchResults(prev => 
          prev.map(u => 
            u.id === userId ? {...u, is_following: true} : u
          )
        );
        await fetchFollowing();
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
        setSearchResults(prev => 
          prev.map(u => 
            u.id === userId ? {...u, is_following: false} : u
          )
        );
        await fetchFollowing();
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
        await fetchFollowers();
      }
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2 className="mb-4">Follower Management</h2>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Search Results</h5>
                <ul className="list-group">
                  {searchResults.map(user => (
                    <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={`/avatars/avatar${user.avatar || 1}.png`}
                          alt="User avatar"
                          className="rounded-circle me-3"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <span className="fw-bold">{user.username}</span>
                      </div>
                      {user.is_following ? (
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
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : searchPerformed && (
            <div className="alert alert-info mb-4">
              {lastSearchTerm ? 
                `No users found matching "${lastSearchTerm}"` : 
                "Please enter a search term"}
            </div>
          )}

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                Your Followers ({followers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                Following ({following.length})
              </button>
            </li>
          </ul>

          {/* Followers List */}
          {activeTab === 'followers' && (
            <div className="card">
              <div className="card-body">
                {followers.length === 0 ? (
                  <p className="text-muted">No followers yet. Start sharing your quizzes to get followers!</p>
                ) : (
                  <ul className="list-group">
                    {followers.map(user => (
                      <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <img
                            src={`/avatars/avatar${user.avatar || 1}.png`}
                            alt="User avatar"
                            className="rounded-circle me-3"
                            style={{ width: '40px', height: '40px' }}
                          />
                          <span className="fw-bold">{user.username}</span>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveFollower(user.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Following List */}
          {activeTab === 'following' && (
            <div className="card">
              <div className="card-body">
                {following.length === 0 ? (
                  <p className="text-muted">You're not following anyone yet. Search for users to follow!</p>
                ) : (
                  <ul className="list-group">
                    {following.map(user => (
                      <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <img
                            src={`/avatars/avatar${user.avatar || 1}.png`}
                            alt="User avatar"
                            className="rounded-circle me-3"
                            style={{ width: '40px', height: '40px' }}
                          />
                          <span className="fw-bold">{user.username}</span>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          Unfollow
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Followers;