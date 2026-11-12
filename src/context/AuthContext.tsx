import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserData } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionNotice: string | null;
  clearNotice: () => void;
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => void;
  refreshUser: () => Promise<UserData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tedx_auth_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const clearNotice = useCallback(() => {
    setSessionNotice(null);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<UserData | null> => {
    const savedToken = localStorage.getItem('tedx_auth_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      return null;
    }

    try {
      const res = await api.getMe();
      if (res?.user) {
        setUser(res.user);
        setToken(savedToken);
        return res.user;
      }
      return null;
    } catch {
      // El interceptor en api.ts ya limpia el token si es 401
      setUser(null);
      setToken(null);
      return null;
    }
  }, []);

  // Inicialización de la sesión
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (err) {
        console.error('Error al inicializar sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  // Escuchar eventos de sesión expirada emitidos por el interceptor de api.ts
  useEffect(() => {
    const handleExpired = (e: Event) => {
      const customEvent = e as CustomEvent<{ error: string }>;
      setToken(null);
      setUser(null);
      setSessionNotice(customEvent.detail?.error || 'Tu sesión ha expirado. Por favor ingresa nuevamente.');
    };

    window.addEventListener('tedx_auth_expired', handleExpired);
    return () => {
      window.removeEventListener('tedx_auth_expired', handleExpired);
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserData> => {
    setIsLoading(true);
    setSessionNotice(null);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        sessionNotice,
        clearNotice,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
};

