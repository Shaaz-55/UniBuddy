import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { COLLEGES } from '../data/colleges';
import Modal from './Modal';
import './AuthModals.css';

const INTEREST_OPTIONS = [
  'DSA',
  'Web Dev',
  'UI/UX',
  'Machine Learning',
  'Competitive Programming',
  'Cloud & DevOps',
  'Cybersecurity',
  'Placements',
  'Product Management',
];

const YEAR_OPTIONS = ['1st yr', '2nd yr', '3rd yr', '4th yr'];

export default function AuthModals() {
  const {
    authModal,
    closeAuthModal,
    openLoginModal,
    openRegisterModal,
    openSeniorModal,
    register,
    login,
    loginAsDemo,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regCollegeQuery, setRegCollegeQuery] = useState('');
  const [regCollegeDropdownOpen, setRegCollegeDropdownOpen] = useState(false);
  const [regYear, setRegYear] = useState('1st yr');
  const [regInterests, setRegInterests] = useState(['DSA', 'Web Dev']);
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const [regTouched, setRegTouched] = useState({});

  const isSenior = authModal.mode === 'senior';
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    setRegYear(authModal.mode === 'senior' ? '3rd yr' : '1st yr');
    setRegErrors({});
    setRegTouched({});
    setRegisterError('');
  }, [authModal.mode]);

  const collegeComboRef = useRef(null);

  // Filter colleges for searchable combobox
  const filteredColleges = useMemo(() => {
    const q = regCollegeQuery.trim().toLowerCase();
    if (!q) return COLLEGES.slice(0, 8);
    return COLLEGES.filter((c) => c.name.toLowerCase().includes(q));
  }, [regCollegeQuery]);

  // Close college combobox on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (collegeComboRef.current && !collegeComboRef.current.contains(e.target)) {
        setRegCollegeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Demo Login Handler
  const handleDemoSignIn = (role = 'junior') => {
    loginAsDemo(role);
    showToast('Pass ready hai! Welcome to UniBuddy 🎉');
    navigate(role === 'senior' ? '/senior' : '/mentors');
  };

  // Login Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!loginEmail.trim()) {
      setLoginError('Please enter your college email.');
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    const result = login(loginEmail);
    if (result.success) {
      showToast('Welcome back to UniBuddy! 🙌');
      navigate(result.user.role === 'senior' ? '/senior' : '/mentors');
    } else {
      setLoginError(result.error);
    }
  };

  // Register Validation Logic
  const validateRegisterField = (field, value) => {
    let err = '';
    if (field === 'name') {
      if (!value.trim()) err = 'Full name is required.';
      else if (value.trim().length < 2) err = 'Please enter your full name.';
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) err = 'College email is required.';
      else if (!emailRegex.test(value.trim())) err = 'Please enter a valid email address.';
    } else if (field === 'college') {
      if (!value.trim()) err = 'College name is required.';
    } else if (field === 'password') {
      if (!value) err = 'Password is required.';
      else if (value.length < 6) err = 'Password must be at least 6 characters.';
    } else if (field === 'interests') {
      if (!value || value.length === 0) err = 'Select at least 1 interest.';
    }
    return err;
  };

  // Register Submit Handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      name: validateRegisterField('name', regName),
      email: validateRegisterField('email', regEmail),
      college: validateRegisterField('college', regCollege),
      password: validateRegisterField('password', regPassword),
      interests: validateRegisterField('interests', regInterests),
    };

    setRegErrors(newErrors);
    setRegTouched({
      name: true,
      email: true,
      college: true,
      password: true,
      interests: true,
    });

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    const result = register({
      name: regName,
      email: regEmail,
      college: regCollege,
      year: regYear,
      interests: regInterests,
      role: isSenior ? 'senior' : 'junior',
    });

    if (!result.success) {
      setRegisterError(result.error);
      return;
    }

    showToast('Pass ready hai! Welcome to UniBuddy 🎉');
    navigate(isSenior ? '/senior' : '/mentors');
  };

  const toggleInterest = (interest) => {
    setRegInterests((prev) => {
      const updated = prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
      if (regTouched.interests) {
        setRegErrors((errs) => ({
          ...errs,
          interests: validateRegisterField('interests', updated),
        }));
      }
      return updated;
    });
  };

  return (
    <>
      {/* 1. LOGIN MODAL */}
      <Modal
        isOpen={authModal.isOpen && authModal.mode === 'login'}
        onClose={closeAuthModal}
        title="Log in to UniBuddy"
        subtitle="Access your campus mentors, map, and stories."
      >
        <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
          {loginError && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} strokeWidth={2} />
              <span>{loginError}</span>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="login-email">College Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="rahul@iitb.ac.in"
              value={loginEmail}
              onChange={(e) => {
                setLoginEmail(e.target.value);
                setLoginError('');
              }}
              className="auth-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                type={loginShowPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError('');
                }}
                className="auth-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setLoginShowPassword((p) => !p)}
                aria-label={loginShowPassword ? 'Hide password' : 'Show password'}
              >
                {loginShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">
            Log in to my pass
          </button>

          <div className="auth-footer-links">
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => handleDemoSignIn('junior')}
            >
              <Sparkles size={15} />
              <span>Try the demo account (Rahul Verma, IIT Bombay)</span>
            </button>

            <button type="button" className="demo-account-btn" onClick={() => handleDemoSignIn('senior')}>
              <Sparkles size={15} />
              <span>Try the senior demo (Aarav Mehta, IIT Bombay)</span>
            </button>

            <p className="auth-switch-text">
              Don&apos;t have a pass yet?{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={openRegisterModal}
              >
                Get your junior pass
              </button>
            </p>
          </div>
        </form>
      </Modal>

      {/* 2. REGISTER JUNIOR MODAL */}
      <Modal
        isOpen={authModal.isOpen && ['register', 'senior'].includes(authModal.mode)}
        onClose={closeAuthModal}
        title={isSenior ? 'Get your senior pass' : 'Get your junior pass'}
        subtitle={isSenior ? 'Apna experience share karo. Help someone find their way.' : 'Do minute mein ho jayega.'}
        maxWidth="560px"
      >
        <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
          {registerError && <div className="auth-error-banner" role="alert"><AlertCircle size={16} />{registerError}</div>}
          {/* Full Name */}
          <div className="form-field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Rahul Verma"
              value={regName}
              onChange={(e) => {
                setRegName(e.target.value);
                if (regTouched.name) {
                  setRegErrors((errs) => ({
                    ...errs,
                    name: validateRegisterField('name', e.target.value),
                  }));
                }
              }}
              onBlur={() => {
                setRegTouched((t) => ({ ...t, name: true }));
                setRegErrors((errs) => ({
                  ...errs,
                  name: validateRegisterField('name', regName),
                }));
              }}
              className={`auth-input ${regTouched.name && regErrors.name ? 'has-error' : ''}`}
              required
            />
            {regTouched.name && regErrors.name && (
              <span className="field-error-text">
                <AlertCircle size={13} /> {regErrors.name}
              </span>
            )}
          </div>

          {/* College Email */}
          <div className="form-field">
            <label htmlFor="reg-email">College Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="your.name@college.edu or .ac.in"
              value={regEmail}
              onChange={(e) => {
                setRegEmail(e.target.value);
                if (regTouched.email) {
                  setRegErrors((errs) => ({
                    ...errs,
                    email: validateRegisterField('email', e.target.value),
                  }));
                }
              }}
              onBlur={() => {
                setRegTouched((t) => ({ ...t, email: true }));
                setRegErrors((errs) => ({
                  ...errs,
                  email: validateRegisterField('email', regEmail),
                }));
              }}
              className={`auth-input ${regTouched.email && regErrors.email ? 'has-error' : ''}`}
              required
            />
            {regTouched.email && regErrors.email && (
              <span className="field-error-text">
                <AlertCircle size={13} /> {regErrors.email}
              </span>
            )}
          </div>

          {/* Searchable College Combobox (No geocoding call here) */}
          <div className="form-field" ref={collegeComboRef}>
            <label htmlFor="reg-college">College</label>
            <div className="college-combobox-wrap">
              <input
                id="reg-college"
                type="text"
                placeholder="Search or type your college..."
                value={regCollegeQuery || regCollege}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegCollegeQuery(val);
                  setRegCollege(val);
                  setRegCollegeDropdownOpen(true);
                  if (regTouched.college) {
                    setRegErrors((errs) => ({
                      ...errs,
                      college: validateRegisterField('college', val),
                    }));
                  }
                }}
                onFocus={() => setRegCollegeDropdownOpen(true)}
                onBlur={() => {
                  setRegTouched((t) => ({ ...t, college: true }));
                  setRegErrors((errs) => ({
                    ...errs,
                    college: validateRegisterField('college', regCollege),
                  }));
                }}
                className={`auth-input ${regTouched.college && regErrors.college ? 'has-error' : ''}`}
                autoComplete="off"
                required
              />
              {regCollegeDropdownOpen && filteredColleges.length > 0 && (
                <ul className="college-suggestions-list" role="listbox">
                  {filteredColleges.map((col) => (
                    <li
                      key={col.name}
                      role="option"
                      aria-selected={regCollege === col.name}
                      className={`college-option ${regCollege === col.name ? 'selected' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setRegCollege(col.name);
                        setRegCollegeQuery(col.name);
                        setRegCollegeDropdownOpen(false);
                        setRegErrors((errs) => ({ ...errs, college: '' }));
                      }}
                    >
                      <span>{col.name}</span>
                      {regCollege === col.name && <Check size={14} className="check-icon" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {regTouched.college && regErrors.college && (
              <span className="field-error-text">
                <AlertCircle size={13} /> {regErrors.college}
              </span>
            )}
          </div>

          {/* Year of Study Pill Toggle Group */}
          <div className="form-field">
            <span className="field-label-text">Year of Study</span>
            <div className="year-pill-group" role="radiogroup" aria-label="Year of Study">
              {YEAR_OPTIONS.map((year) => (
                <button
                  type="button"
                  key={year}
                  role="radio"
                  aria-checked={regYear === year}
                  className={`year-pill-btn ${regYear === year ? 'active' : ''}`}
                  onClick={() => setRegYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Interests Multi-Select Chips */}
          <div className="form-field">
            <span className="field-label-text">{isSenior ? 'Skills you can mentor in (select at least 1)' : 'Interests (select at least 1)'}</span>
            <div className="interests-chip-grid">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = regInterests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    className={`interest-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check size={13} className="chip-check" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
            {regTouched.interests && regErrors.interests && (
              <span className="field-error-text">
                <AlertCircle size={13} /> {regErrors.interests}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="reg-password">Password (min 6 characters)</label>
            <div className="password-input-wrap">
              <input
                id="reg-password"
                type={regShowPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (regTouched.password) {
                    setRegErrors((errs) => ({
                      ...errs,
                      password: validateRegisterField('password', e.target.value),
                    }));
                  }
                }}
                onBlur={() => {
                  setRegTouched((t) => ({ ...t, password: true }));
                  setRegErrors((errs) => ({
                    ...errs,
                    password: validateRegisterField('password', regPassword),
                  }));
                }}
                className={`auth-input ${regTouched.password && regErrors.password ? 'has-error' : ''}`}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setRegShowPassword((p) => !p)}
                aria-label={regShowPassword ? 'Hide password' : 'Show password'}
              >
                {regShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {regTouched.password && regErrors.password && (
              <span className="field-error-text">
                <AlertCircle size={13} /> {regErrors.password}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">
            {isSenior ? 'Create my senior pass' : 'Create my pass'}
          </button>

          <div className="auth-footer-links">
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => handleDemoSignIn(isSenior ? 'senior' : 'junior')}
            >
              <Sparkles size={15} />
              <span>{isSenior ? 'Try the senior demo (Aarav Mehta, IIT Bombay)' : 'Try the demo account (Rahul Verma, IIT Bombay)'}</span>
            </button>

            <p className="auth-switch-text">
              Already have a pass?{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={openLoginModal}
              >
                Log in
              </button>
            </p>
            <p className="auth-switch-text">
              {isSenior ? 'Looking for guidance? ' : 'Want to mentor juniors? '}
              <button type="button" className="auth-switch-btn" onClick={isSenior ? openRegisterModal : openSeniorModal}>
                {isSenior ? 'Register as a junior' : 'Register as a senior'}
              </button>
            </p>
          </div>
        </form>
      </Modal>

    </>
  );
}
