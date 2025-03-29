import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-between align-items-center">
        <form onSubmit={handleSearch} className="d-flex" style={{ width: '60%' }}>
          <input
            type="search"
            className="form-control me-2"
            placeholder="Search quizzes or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-outline-primary" type="submit">
            Search
          </button>
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