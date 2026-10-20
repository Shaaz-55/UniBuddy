import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * MOCK AUTHENTICATION CONTEXT
 * NOTE: This is a client-side mock placeholder using localStorage.
 * It will be replaced by a secure backend authentication service in production.
 * Passwords are never saved or stored.
 */

const STORAGE_KEY = 'unibuddy_user';

const DEMO_USER = {
  name: 'Rahul Verma',
  email: 'rahul@iitb.ac.in',
  college: 'IIT Bombay',
  year: '1st yr',
  interests: ['DSA', 'Web Dev'],
  role: 'junior',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login', // 'login' | 'register' | 'senior'
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in private browsing modes
    }
  }, [user]);

  const openLoginModal = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'login' });
  }, []);

  const openRegisterModal = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'register' });
  }, []);

  const openSeniorModal = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'senior' });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const register = useCallback((profileData) => {
    const newUser = {
      name: profileData.name.trim(),
      email: profileData.email.trim().toLowerCase(),
      college: profileData.college.trim(),
      year: profileData.year,
      interests: profileData.interests || [],
      role: 'junior',
    };
    setUser(newUser);
    closeAuthModal();
    return newUser;
  }, [closeAuthModal]);

  const login = useCallback((email) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.email.toLowerCase() === normalizedEmail) {
          setUser(parsed);
          closeAuthModal();
          return { success: true, user: parsed };
        }
      }
    } catch {
      // Fall through to error
    }

    // Check if demo user email is entered
    if (normalizedEmail === DEMO_USER.email.toLowerCase()) {
      setUser(DEMO_USER);
      closeAuthModal();
      return { success: true, user: DEMO_USER };
    }

    return {
      success: false,
      error: 'No pass found for this email. Register first or try the demo account.',
    };
  }, [closeAuthModal]);

  const loginAsDemo = useCallback(() => {
    setUser(DEMO_USER);
    closeAuthModal();
    return DEMO_USER;
  }, [closeAuthModal]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authModal,
        openLoginModal,
        openRegisterModal,
        openSeniorModal,
        closeAuthModal,
        register,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
