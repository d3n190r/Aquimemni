// frontend/src/index.js
/**
 * Entry point for the React application.
 * 
 * This file initializes the React application, sets up routing with BrowserRouter,
 * and renders the main App component. It also imports necessary CSS and JavaScript
 * dependencies like Bootstrap.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS importeren
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';  

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
