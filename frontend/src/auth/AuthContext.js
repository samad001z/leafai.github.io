import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, authStorage } from '../services/api';

const AUTH_USER_STORAGE_KEY = 'leafai_auth_user';

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredUser = (user) => {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

const clearStoredUser = () => {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authStorage.getToken());
  const [user, setUser] = useState(() => readStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const currentToken = authStorage.getToken();
      if (!currentToken) {
        if (active) setIsBootstrapping(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (!active) return;
        setToken(currentToken);
        setUser(response?.user || null);
        if (response?.user) writeStoredUser(response.user);
      } catch {
        authStorage.clearToken();
        clearStoredUser();
        if (!active) return;
        setToken('');
        setUser(null);
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const requestOtp = async (phone) => {
    return authService.requestOtp(phone);
  };

  const verifyOtp = async ({ phone, otp, name }) => {
    const response = await authService.verifyOtp({ phone, otp, name });
    if (response?.token) {
      authStorage.setToken(response.token);
      setToken(response.token);
    }
    if (response?.user) {
      writeStoredUser(response.user);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    authStorage.clearToken();
    clearStoredUser();
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isBootstrapping,
    requestOtp,
    verifyOtp,
    logout,
  }), [token, user, isBootstrapping]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
