import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('impacthub_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('impacthub_token');
    if (!token) {
      setUser(null);
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.me();
      if (res.success) {
        setUser(res.user);
        setOrganization(res.organization);
        localStorage.setItem('impacthub_user', JSON.stringify(res.user));
      } else {
        setUser(null);
        setOrganization(null);
        localStorage.removeItem('impacthub_token');
        localStorage.removeItem('impacthub_user');
      }
    } catch {
      setUser(null);
      setOrganization(null);
      localStorage.removeItem('impacthub_token');
      localStorage.removeItem('impacthub_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('impacthub_token', res.token);
      localStorage.setItem('impacthub_user', JSON.stringify(res.user));
      setUser(res.user);
      setOrganization(res.organization || null);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success && res.token) {
      localStorage.setItem('impacthub_token', res.token);
      localStorage.setItem('impacthub_user', JSON.stringify(res.user));
      setUser(res.user);
      setOrganization(res.organization || null);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('impacthub_token');
    localStorage.removeItem('impacthub_user');
    setUser(null);
    setOrganization(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('impacthub_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        login,
        register,
        logout,
        updateUser,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
