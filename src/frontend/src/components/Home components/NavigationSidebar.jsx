// frontend/src/components/NavigationSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.css';

/**
 * NavigationSidebar Component
 *
 * Deze component rendert een zijbalk met navigatielinks naar de belangrijkste pagina's van de applicatie.
 * De links omvatten: Home, Quiz Maker, MyQuizzes, Profile en Followers.
 */
const NavigationSidebar = () => {
  return (
    <nav
      className="bg-light vh-100 shadow-sm fixed-start"
      style={{ width: '250px', marginTop: '70px', zIndex: 1500 }}
    >
      <div className="p-3">
        <h5 className="text-muted mb-3">Navigation</h5>
        <ul className="nav nav-pills flex-column">
          <li className="nav-item">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-house me-2"></i>
              Home
            </NavLink>
          </li>
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
              to="/my-quizzes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-card-list me-2"></i>
              MyQuizzes
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
