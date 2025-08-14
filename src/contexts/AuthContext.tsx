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
import { authLogger } from '@/utils/logger';

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
  // Usar useMemo para cache del resultado y evitar re-ejecutar
  const checkUserRole = useCallback(
    async (userObj: User | null): Promise<AppUser | null> => {
      if (!userObj) return null;

      // Cache simple para evitar múltiples ejecuciones del mismo usuario
      if (
        userObj.email !== null &&
        userObj.email === user?.email &&
        user?.role
      ) {
        return user;
      }

      try {
        // Debug logs (solo en desarrollo)
        authLogger.userRole(userObj.email);

        // Primero verificar si el rol está en los metadatos del usuario
        const metaRole = userObj.user_metadata?.['role'] as string | undefined;
        authLogger.metadata(metaRole);

        // Si el rol está en metadata, usarlo directamente (más eficiente)
        if (
          metaRole !== null &&
          metaRole !== undefined &&
          ['super_admin', 'admin', 'worker'].includes(metaRole)
        ) {
          authLogger.usingRole(metaRole);
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name:
              (userObj.user_metadata?.['name'] as string | undefined) ??
              userObj.email?.split('@')[0] ??
              'Usuario',
            role: metaRole as 'super_admin' | 'admin' | 'worker',
          };
        }

        // Si es súper admin por email
        if (userObj.email === 'conectomail@gmail.com') {
          authLogger.superAdminByEmail();
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name: 'Super Admin',
            role: 'super_admin',
          };
        }

        // Para admin por defecto (credenciales de prueba)
        if (userObj.email === 'admin@sadlas.com') {
          authLogger.adminDefault();
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name: 'Administrador',
            role: 'admin',
          };
        }

        // Para worker por defecto (credenciales de prueba)
        if (userObj.email === 'maria.garcia@sadlas.com') {
          authLogger.workerDefault();
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name: 'María García',
            role: 'worker',
          };
        }

        // Solo consultar auth_users si no hay metadata
        authLogger.fetchingUserFromDb(userObj.id);
        const { data, error } = await supabase
          .from('auth_users')
          .select('role')
          .eq('id', userObj.id)
          .single();

        if (error) {
          // eslint-disable-next-line no-console
          console.warn(
            'User not found in auth_users, treating as basic user:',
            error
          );
          return {
            id: userObj.id,
            email: userObj.email ?? '',
            name:
              (userObj.user_metadata?.['name'] as string | undefined) ??
              userObj.email ??
              'Usuario',
            role: 'worker', // Default role
          };
        }

        authLogger.userRoleFromDb(data?.role);
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
          role: 'worker', // Default role on error
        };
      }
    },
    [user] // Dependencia completa para cache
  );

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(initialSession);
      if (initialSession?.user) {
        const appUser = await checkUserRole(initialSession.user);
        if (isMounted) {
          setUser(appUser);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    getInitialSession().catch((error) => {
      authLogger.sessionError(error);
      if (isMounted) {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        setSession(newSession);

        if (newSession?.user) {
          const appUser = await checkUserRole(newSession.user);
          if (isMounted) {
            setUser(appUser);
          }
        } else {
          setUser(null);
        }

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event !== 'USER_UPDATED') {
          setIsPasswordRecovery(false);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserRole]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; redirectTo?: string }> => {
    authLogger.signInStart(email);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      authLogger.authError(signInError);
      return { error: signInError };
    }

    authLogger.signInSuccess();

    // No necesitamos llamar checkUserRole aquí porque useEffect lo hará
    // cuando detecte el cambio de sesión, evitando duplicación

    // Determinar redirect basado en email como fallback rápido
    let redirectTo = '/dashboard';
    if (email === 'conectomail@gmail.com') redirectTo = '/super-dashboard';
    if (email === 'info@alamia.es' || email === 'admin@sadlas.com')
      redirectTo = '/dashboard';
    if (email === 'maria.garcia@sadlas.com') redirectTo = '/worker-dashboard';

    authLogger.quickRedirect(redirectTo);

    return { error: null, redirectTo };
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
