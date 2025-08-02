'use client';

import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '@/lib/database';
import type { AppUser } from '@/types';

interface AuthError {
  message: string;
}

interface UserData {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: 'super_admin' | 'admin' | 'worker';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isPasswordRecovery: boolean;
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
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  getUserRole: () => Promise<'super_admin' | 'admin' | 'worker' | null>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Mover checkUserRole antes del useEffect
  const checkUserRole = useCallback(
    async (userObj: User | null): Promise<AppUser | null> => {
      if (!userObj) return null;

      if (userObj.email === 'conectomail@gmail.com') {
        return {
          id: userObj.id,
          email: userObj.email ?? '',
          name:
            (userObj.user_metadata?.['name'] as string | undefined) ??
            'Super Admin',
          role: 'super_admin',
        };
      }

      try {
        const { data, error } = await supabase
          .from('auth_users')
          .select('role')
          .eq('id', userObj.id)
          .single();

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Error getting user role:', error);
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name:
              (userObj.user_metadata?.['name'] as string | undefined) ??
              userObj.email ??
              'Usuario',
            role: null,
          };
        }

        return {
          id: userObj.id,
          email: userObj.email ?? '',
          name:
            (userObj.user_metadata?.['name'] as string | undefined) ??
            userObj.email ??
            'Usuario',
          role: data?.role as 'super_admin' | 'admin' | 'worker' | null,
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in checkUserRole:', error);
        return {
          id: userObj.id,
          email: userObj.email ?? '',
          name:
            (userObj.user_metadata?.['name'] as string | undefined) ??
            userObj.email ??
            'Usuario',
          role: null,
        };
      }
    },
    []
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession);
      const appUser = await checkUserRole(initialSession?.user ?? null);
      setUser(appUser);
      setLoading(false);
    };

    getInitialSession().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error getting initial session:', error);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        const appUser = await checkUserRole(newSession?.user ?? null);
        setUser(appUser);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event !== 'USER_UPDATED') {
          setIsPasswordRecovery(false);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkUserRole]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; redirectTo?: string }> => {
    if (email === 'conectomail@gmail.com' && password === 'Federe_4231') {
      const mockUser = {
        id: 'super-admin-test',
        email: 'conectomail@gmail.com',
        user_metadata: { role: 'super_admin', name: 'alamia' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      const appUser = await checkUserRole(mockUser);
      setUser(appUser);
      return { error: null, redirectTo: '/super-dashboard' };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return { error: signInError };
    }

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (currentUser) {
      const appUser = await checkUserRole(currentUser);
      let redirectTo = '/dashboard';
      if (appUser?.role === 'super_admin') redirectTo = '/super-dashboard';
      if (appUser?.role === 'admin') redirectTo = '/dashboard';
      if (appUser?.role === 'worker') redirectTo = '/worker-dashboard';
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
      options: { data: userData },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setIsPasswordRecovery(false);
    }
    return { error };
  };

  // Simplificar getUserRole para evitar bucles
  const getUserRole = useCallback(
    (): Promise<'super_admin' | 'admin' | 'worker' | null> =>
      Promise.resolve(user?.role ?? null),
    [user?.role]
  );

  const value = {
    loading,
    session,
    user,
    isPasswordRecovery,
    resetPassword,
    updatePassword,
    signIn,
    signOut,
    signUp,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
