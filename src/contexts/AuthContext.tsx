import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt?: string;
};

type MeResponse = { user: AuthUser | null };

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUpWithEmail: (params: { displayName: string; email: string; password: string }) => Promise<{ verificationToken?: string }>;
  signInWithEmail: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { user: u } = await api<MeResponse>('/auth/me', { method: 'GET' });
      setUser(u);
      if (u) {
        try {
          await api('/auth/session-check', { method: 'GET' });
        } catch {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const signUpWithEmail = async (params: { displayName: string; email: string; password: string }) => {
    const displayName = params.displayName.trim();
    const email = params.email.trim().toLowerCase();
    const password = params.password;
    if (!displayName) throw new Error('Please enter your name.');
    if (!email) throw new Error('Please enter your email.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');

    const res = await api<{ verificationToken?: string; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password }),
    });

    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await refreshMe();
    return { verificationToken: res.verificationToken };
  };

  const signInWithEmail = async (params: { email: string; password: string }) => {
    const email = params.email.trim().toLowerCase();
    const password = params.password;
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await refreshMe();
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    await api('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim() }),
    });
    await refreshMe();
  };

  const requestPasswordReset = async (email: string) => {
    const res = await api<{ resetToken?: string; message?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    return { resetToken: res.resetToken };
  };

  const resetPassword = async (token: string, newPassword: string) => {
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
    await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim(), newPassword }),
    });
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signUpWithEmail,
      signInWithEmail,
      logout,
      refreshMe,
      verifyEmail,
      requestPasswordReset,
      resetPassword,
    }),
    [user, loading, refreshMe]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
