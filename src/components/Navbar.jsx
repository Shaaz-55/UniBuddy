import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from './Logo';
import './Navbar.css';


export default function Navbar() {
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme state: load the user's saved preference
const [theme, setTheme] = useState(() => {
  const savedTheme = localStorage.getItem('unibuddy-theme');
  return savedTheme === 'light' ? 'light' : 'dark';
});

// Apply the selected theme and save the preference
useEffect(() => {
  const root = document.documentElement;

  root.classList.toggle('theme-light', theme === 'light');
  root.classList.toggle('theme-dark', theme === 'dark');

  localStorage.setItem('unibuddy-theme', theme);
}, [theme]);

// Switch between light and dark modes
const toggleTheme = () => {
  setTheme((currentTheme) =>
    currentTheme === 'dark' ? 'light' : 'dark'
  );
};

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    showToast('Phir milenge! 👋');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-anchor">
      <nav className="navbar-pill wrap" aria-label="Main navigation">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/mentors' : '/'} className="navbar-brand">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        {!isAuthenticated ? (
          <div className="navbar-links hide-mobile">
            <button
              type="button"
              className="nav-anchor-btn"
              onClick={() => scrollToSection('problem')}
            >
              The Problem
            </button>
            <button
              type="button"
              className="nav-anchor-btn"
              onClick={() => scrollToSection('how-it-works')}
            >
              How it works
            </button>
            <button
              type="button"
              className="nav-anchor-btn"
              onClick={() => scrollToSection('features')}
            >
              Everything in one app
            </button>
            <button
              type="button"
              className="nav-anchor-btn"
              onClick={() => scrollToSection('safety')}
            >
              Safety
            </button>
          </div>
        ) : (
          <div className="navbar-tabs hide-mobile" role="tablist">
            <NavLink
              to="/mentors"
              className={({ isActive }) =>
                `navbar-tab-item ${isActive ? 'active' : ''}`
              }
            >
              Mentors
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `navbar-tab-item ${isActive ? 'active' : ''}`
              }
            >
              Map
            </NavLink>
            <NavLink
              to="/stories"
              className={({ isActive }) =>
                `navbar-tab-item ${isActive ? 'active' : ''}`
              }
            >
              Stories
            </NavLink>
          </div>
        )}

        {/* Right Action Cluster */}
        <div className="navbar-actions">

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>

          {!isAuthenticated ? (
            <div className="navbar-auth-btns">
              <button
                type="button"
                className="btn-ghost"
                onClick={openLoginModal}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={openRegisterModal}
              >
                Get your pass
              </button>
            </div>
          ) : (
            <div className="user-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-avatar-trigger"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label={`User profile menu for ${user?.name}`}
              >
                <div className="user-avatar-mark" aria-hidden="true">
                  {getInitials(user?.name)}
                </div>
                <div className="user-info-text hide-mobile">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-college">{user?.college}</span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown-menu" role="menu">
                  <div className="user-dropdown-profile">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-college">{user?.college}</p>
                    <p className="dropdown-user-year">{user?.year} · Junior</p>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
