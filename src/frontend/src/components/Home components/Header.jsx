// frontend/src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic later
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" 
    style={{zIndex: 2000}}>
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

        <button 
          className="btn btn-link" 
          onClick={() => navigate('/profile')}
          title="Go to Profile"
        >
          <i className="bi bi-person-circle fs-3"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;