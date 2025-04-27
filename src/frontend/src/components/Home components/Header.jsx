import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('users'); // 'users' of 'quizzes'
  const [userData, setUserData] = useState({
    username: 'Loading...',
    avatar: 1
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUserData({
            username: data.username,
            avatar: data.avatar || 1
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      onLogout?.();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const endpoint = searchType === 'users' 
        ? `/api/users/search?q=${encodeURIComponent(searchQuery)}`
        : `/api/quizzes/search?q=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(endpoint, { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-between align-items-center">
        <form onSubmit={handleSearch} className="d-flex position-relative" style={{ width: '60%' }}>
          <div className="input-group">
            <select 
              className="form-select flex-grow-0 w-auto" 
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchResults([]);
              }}
            >
              <option value="users">Users</option>
              <option value="quizzes">Quizzes</option>
            </select>
            
            <input
              type="search"
              className="form-control"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSearchResults([]);
              }}
            />
            
            <button className="btn btn-outline-primary" type="submit">
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow overflow-hidden">
              {searchResults.map(result => (
                searchType === 'users' ? (
                  <div
                    key={result.id}
                    className="p-2 d-flex align-items-center hover-bg-light cursor-pointer gap-2"
                    onClick={() => {
                      navigate(`/profile/${result.id}`);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    <img
                      src={`/avatars/avatar${result.avatar || 1}.png`}
                      alt={result.username}
                      style={{ 
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                    <div className="d-flex flex-column overflow-hidden">
                      <span className="fw-medium text-truncate">{result.username}</span>
                      {result.is_following && (
                        <small className="text-muted">Following</small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={result.id}
                    className="p-2 d-flex align-items-center hover-bg-light cursor-pointer gap-2"
                    onClick={() => {
                      navigate(`/quiz/${result.id}`);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    <div className="position-relative">
                      <img
                        src={`/avatars/avatar${result.creator_avatar || 1}.png`}
                        alt={result.creator}
                        style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    </div>
                    <div className="d-flex flex-column overflow-hidden">
                      <span className="fw-medium text-truncate">{result.name}</span>
                      <small className="text-muted text-truncate">
                        by {result.creator}
                      </small>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </form>

        <div className="dropdown">
          <button
            className="btn btn-link d-flex align-items-center text-decoration-none p-0"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={`/avatars/avatar${userData.avatar}.png`}
              alt="Profile"
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '0.5rem'
              }}
            />
            <span className="d-none d-md-inline">{userData.username}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                onClick={() => navigate('/profile')}
              >
                <i className="bi bi-person me-2"></i>Profile
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => navigate('/settings')}
              >
                <i className="bi bi-gear me-2"></i>Settings
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item"
                onClick={handleLogout}
                style={{color:"red"}}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;