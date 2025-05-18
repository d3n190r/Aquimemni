// frontend/src/components/NavigationSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.css'; // Keep existing CSS imports if needed

/**
 * NavigationSidebar Component
 *
 * Renders a sidebar with navigation links.
 * Styling is passed inline from Home.js to ensure correct flexbox behavior.
 */
const NavigationSidebar = ({ style }) => { // Accept style prop from Home.js
  return (
    // Apply styles passed from parent for flex layout control
    // Removed fixed-start and margin-top, relying on flexbox in Home.js
    <nav
      className="shadow-sm" // Keep base Bootstrap classes
      style={style} // Apply dynamic styles (width, height, overflow)
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
          {/* Add other links as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationSidebar;