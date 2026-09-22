import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { clearAccessToken, getAccessToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    let active = true;

    async function bootstrap() {
      try {
        if (!getAccessToken()) {
          await authApi.refresh();
        }
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        clearAccessToken();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors during logout; local state is cleared regardless
    }
    clearSession();
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    await authApi.refresh();
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshSession,
      updateUser,
    }),
    [user, isLoading, login, logout, refreshSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
