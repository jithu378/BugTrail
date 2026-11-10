import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api.auth
      .me(controller.signal)
      .then((payload) => {
        if (active) setUser(payload.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('bugtrail:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bugtrail:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const payload = await api.auth.login(credentials);
    setUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (details) => {
    const payload = await api.auth.register(details);
    setUser(payload.user);
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
