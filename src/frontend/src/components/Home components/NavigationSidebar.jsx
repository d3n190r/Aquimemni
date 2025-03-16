// frontend/src/components/NavigationSidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavigationSidebar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-light vh-100 shadow-sm fixed-start" style={{ width: '250px', marginTop: '70px', zIndex: 1500 }}>
      <div className="p-3">
        <h5 className="text-muted mb-3">Navigation</h5>
        <ul className="nav nav-pills flex-column">
          <li className="nav-item">
            <NavLink 
              to="/quiz-maker" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-plus-square me-2"></i>
              Quiz Maker
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-person me-2"></i>
              Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/followers" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-people me-2"></i>
              Followers
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavigationSidebar;