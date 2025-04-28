// src/frontend/src/components/Home components/Header.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ username: 'Loading...', avatar: 1 });

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUserData({ username: data.username, avatar: data.avatar || 1 }))
      .catch(() => {/* niet ingelogd? */});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    onLogout?.();
    navigate('/login');
  };

  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/quizzes/search?q=${encodeURIComponent(searchQuery)}`, {
      credentials: 'include'
    });
    if (res.ok) setSearchResults(await res.json());
  };

  const goToQuiz = id => {
    navigate(`/quiz/${id}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-between align-items-center">
        <form onSubmit={handleSearch} className="position-relative" style={{ width: '60%' }}>
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Search quizzes…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSearchResults([]);
              }}
            />
            <button className="btn btn-outline-primary" type="submit">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow overflow-hidden">
              {searchResults.map(item => (
                <div
                  key={item.id}
                  className="search-result-item d-flex align-items-center gap-2"
                  onClick={() => goToQuiz(item.id)}
                >
                  <img
                    src={`/avatars/avatar${item.creator_avatar || 1}.png`}
                    alt={item.creator}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-medium">{item.name}</div>
                    <small className="text-muted">by {item.creator}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="dropdown">
          <button
            className="btn btn-link d-flex align-items-center p-0"
            data-bs-toggle="dropdown"
          >
            <img
              src={`/avatars/avatar${userData.avatar}.png`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: '40px', height: '40px', marginRight: '.5rem' }}
            />
            <span className="d-none d-md-inline">{userData.username}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" onClick={() => navigate('/profile')}>Profile</button></li>
            <li><button className="dropdown-item" onClick={() => navigate('/settings')}>Settings</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
