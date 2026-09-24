import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthSession {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    localStorage.removeItem('gcv_auth_session');
    authApi.refresh()
      .then((next) => {
        if (active) setSession(next);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = window.setInterval(() => {
      authApi.refresh()
        .then(setSession)
        .catch(() => setSession(null));
    }, 10 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [session]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setSession(result);
    return result.user;
  };

  const signup: AuthContextType['signup'] = async (input) => {
    const result = await authApi.signup(input);
    setSession(result);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: !!session,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
