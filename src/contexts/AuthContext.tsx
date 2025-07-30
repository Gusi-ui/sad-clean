'use client';

import type { User } from '@supabase/supabase-js';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

interface AuthError {
  message: string;
}

interface UserData {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: 'admin' | 'worker';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; redirectTo?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: UserData
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  getUserRole: () => Promise<'admin' | 'worker' | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // eslint-disable-next-line no-void
    void getInitialSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserRole = async (): Promise<'admin' | 'worker' | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('auth_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error getting user role:', error);
        return null;
      }

      return data?.role as 'admin' | 'worker' | null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting user role:', error);
      return null;
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; redirectTo?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error as AuthError | null };
    }

    // Obtener el rol del usuario para determinar la redirección
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (currentUser) {
      const role = await getUserRole();
      const redirectTo = role === 'admin' ? '/dashboard' : '/worker-dashboard';
      return { error: null, redirectTo };
    }

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: UserData
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { error: error as AuthError | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error as AuthError | null };
  };

  const value = {
    loading,
    resetPassword,
    signIn,
    signOut,
    signUp,
    user,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
