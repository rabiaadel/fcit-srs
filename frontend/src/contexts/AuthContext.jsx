import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async (silent = false) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authAPI.logout(refreshToken).catch(() => {});
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setProfile(null);
      if (!silent) toast.success('Logged out');
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { accessToken, refreshToken, user: u, profile: p } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(u);
    setProfile(p);
    return { user: u, profile: p };
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
