import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Initialize the theme before React renders.
const savedTheme = localStorage.getItem("unibuddy-theme");
const initialTheme = savedTheme === "light" ? "light" : "dark";

document.documentElement.classList.toggle(
  "theme-light",
  initialTheme === "light"
);

document.documentElement.classList.toggle(
  "theme-dark",
  initialTheme === "dark"
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
