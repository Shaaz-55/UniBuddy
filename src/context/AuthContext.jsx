import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_JUNIOR, DEMO_SENIOR } from '../data/network';
import { readStorage, writeStorage } from '../lib/storage';

// Prototype authentication only. Passwords are never persisted or transmitted.
const STORAGE_KEY = 'unibuddy_user';
const ACCOUNTS_KEY = 'unibuddy_accounts_v1';
const AuthContext = createContext(null);
function normalizeProfile(profile) {
  if (typeof profile?.email !== 'string' || typeof profile?.name !== 'string' || !profile.email || !profile.name) return null;
  const email = profile.email.trim().toLowerCase();
  const demo = [DEMO_JUNIOR, DEMO_SENIOR].find(item => item.email === email);
  return {
    ...profile,
    email,
    id: profile.id || demo?.id || `student:${email}`,
    role: profile.role === 'senior' ? 'senior' : 'junior'
  };
}
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(() => normalizeProfile(readStorage(STORAGE_KEY, null)));
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login'
  });
  useEffect(() => {
    if (user) {
      writeStorage(STORAGE_KEY, user);
      const stored = readStorage(ACCOUNTS_KEY, []);
      const accounts = Array.isArray(stored) ? stored : [];
      writeStorage(ACCOUNTS_KEY, [...accounts.filter(account => account.id !== user.id), user]);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {/* Session still works in memory. */}
    }
  }, [user]);
  const openLoginModal = useCallback(() => setAuthModal({
    isOpen: true,
    mode: 'login'
  }), []);
  const openRegisterModal = useCallback(() => setAuthModal({
    isOpen: true,
    mode: 'register'
  }), []);
  const openSeniorModal = useCallback(() => setAuthModal({
    isOpen: true,
    mode: 'senior'
  }), []);
  const closeAuthModal = useCallback(() => setAuthModal(prev => ({
    ...prev,
    isOpen: false
  })), []);
  const register = useCallback(profileData => {
    const newUser = normalizeProfile({
      ...profileData,
      name: profileData.name.trim(),
      college: profileData.college.trim(),
      available: true
    });
    const stored = readStorage(ACCOUNTS_KEY, []);
    if ([...(Array.isArray(stored) ? stored : []), DEMO_JUNIOR, DEMO_SENIOR].some(account => account.email === newUser.email)) {
      return {
        success: false,
        error: 'A pass already exists for this email. Please log in.'
      };
    }
    setUser(newUser);
    closeAuthModal();
    return {
      success: true,
      user: newUser
    };
  }, [closeAuthModal]);
  const login = useCallback(email => {
    const stored = readStorage(ACCOUNTS_KEY, []);
    const profile = [...(Array.isArray(stored) ? stored : []), DEMO_JUNIOR, DEMO_SENIOR].find(account => account.email === (email || '').trim().toLowerCase());
    if (!profile) return {
      success: false,
      error: 'No pass found for this email. Register first or try a demo account.'
    };
    const nextUser = normalizeProfile(profile);
    setUser(nextUser);
    closeAuthModal();
    return {
      success: true,
      user: nextUser
    };
  }, [closeAuthModal]);
  const loginAsDemo = useCallback((role = 'junior') => {
    const profile = role === 'senior' ? DEMO_SENIOR : DEMO_JUNIOR;
    return login(profile.email).user;
  }, [login]);
  const updateProfile = useCallback(changes => {
    setUser(current => current ? {
      ...current,
      ...changes,
      id: current.id,
      email: current.email,
      role: current.role
    } : null);
  }, []);
  const logout = useCallback(() => setUser(null), []);
  return <AuthContext.Provider value={{
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
    updateProfile,
    logout
  }}>
    {children}
  </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
