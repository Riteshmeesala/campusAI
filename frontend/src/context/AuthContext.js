import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

const TOKEN_KEY   = 'campusiq_token';
const USER_KEY    = 'campusiq_user';
const SESSION_KEY = 'campusiq_session_active'; // sessionStorage — clears on tab close/new tab

export const AuthProvider = ({ children }) => {
  const [user,         setUser]         = useState(null);
  const [token,        setToken]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [pendingEmail, setPendingEmail] = useState(null);

  // ── Session restore on mount ─────────────────────────────────────────────
  // sessionStorage.getItem(SESSION_KEY) is truthy ONLY if the user previously
  // logged in DURING THIS BROWSER SESSION (same tab, or tab was refreshed).
  // On a brand-new tab / first visit it will be null → force login page.
  useEffect(() => {
    const sessionActive = sessionStorage.getItem(SESSION_KEY);
    if (sessionActive) {
      // User refreshed the page → safely restore saved session
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser  = localStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    } else {
      // Fresh start / new tab → always show login page, clear any stale session
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  // ── Save session ─────────────────────────────────────────────────────────
  const saveSession = useCallback((tokenVal, userData) => {
    localStorage.setItem(TOKEN_KEY,   tokenVal);
    localStorage.setItem(USER_KEY,    JSON.stringify(userData));
    sessionStorage.setItem(SESSION_KEY, '1'); // mark session as active for this tab
    setToken(tokenVal);
    setUser(userData);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const response = await authAPI.login({ username, password });
    const data = response.data.data;
    if (data.twoFactorRequired) {
      setPendingEmail(username);
      return { twoFactorRequired: true };
    }
    const userData = {
      id:       data.userId,
      username: data.username,
      name:     data.name,
      email:    data.email,
      role:     data.role,
    };
    saveSession(data.accessToken, userData);
    return { success: true, role: data.role };
  }, [saveSession]);

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async (email, otp) => {
    const response = await authAPI.verifyOtp({ email, otp });
    const data = response.data.data;
    const userData = {
      id: data.userId, username: data.username,
      name: data.name, email: data.email, role: data.role,
    };
    saveSession(data.accessToken, userData);
    setPendingEmail(null);
    return { success: true, role: data.role };
  }, [saveSession]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
    setPendingEmail(null);
  }, []);

  const value = {
    user, token, loading, pendingEmail, setPendingEmail,
    login, logout, verifyOtp,
    isAuthenticated: !!user,
    isAdmin:   user?.role === 'ADMIN',
    isFaculty: user?.role === 'FACULTY',
    isStudent: user?.role === 'STUDENT',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;