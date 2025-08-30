'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { secureStorage } from '@/utils/secure-storage';

import { supabase } from '../lib/database';
import type { AuthContextType, AuthCredentials, Worker } from '../types';

// Estado inicial
const initialState = {
  isAuthenticated: false,
  currentWorker: null as Worker | null,
  isLoading: true,
  error: null as string | null,
};

// Tipos de acciones
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: Worker }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PASSWORD_RECOVERY'; payload: boolean };

// Reducer
function authReducer(
  state: typeof initialState & { isPasswordRecovery: boolean },
  action: AuthAction
): typeof initialState & { isPasswordRecovery: boolean } {
  // Debug completado - reducer funcionando correctamente
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        currentWorker: action.payload,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        currentWorker: null,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentWorker: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_PASSWORD_RECOVERY':
      return { ...state, isPasswordRecovery: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    isPasswordRecovery: false,
  });

  // Debug completado - AuthProvider funcionando correctamente

  // Verificar autenticación solo al iniciar - una sola vez
  useEffect(() => {
    let isInitialized = false;

    const initializeAuth = (): void => {
      if (isInitialized) return;
      if (typeof window === 'undefined') return;

      try {
        const workerData = secureStorage.getItem<Worker>('worker');
        const token = secureStorage.getItem<string>('token');

        if (workerData != null && token != null && token !== '') {
          // Restaurar sesión previa
          dispatch({ type: 'AUTH_SUCCESS', payload: workerData });
        } else {
          // No hay sesión previa - mostrar login
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch {
        // Error al restaurar sesión - limpiar y mostrar login
        // Limpiar storage corrupto
        secureStorage.clear();
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }

      isInitialized = true;
    };

    initializeAuth();
  }, []); // Solo al montar

  const login = async (
    credentials: AuthCredentials
  ): Promise<Worker | undefined> => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Normalizar email a minúsculas para evitar problemas de case
      const normalizedEmail = credentials.email.toLowerCase().trim();

      // Login directo con Supabase

      // Usar Supabase directamente como funcionaba antes
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: credentials.password,
        });

      if (authError) {
        throw new Error('Credenciales inválidas');
      }

      if (authData.user == null) {
        throw new Error('Error de autenticación');
      }

      // Autenticación exitosa con Supabase

      // Obtener información del usuario desde auth_users
      const { data: userData, error: userError } = await supabase
        .from('auth_users')
        .select('id, email, role')
        .eq('id', authData.user.id)
        .single();

      if (userError != null || userData == null) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      // Datos de usuario obtenidos correctamente

      // Crear objeto worker basado en los datos de Supabase
      const metadata = authData.user.user_metadata as Record<
        string,
        unknown
      > | null;
      const worker: Worker = {
        id: userData.id,
        email: userData.email,
        name:
          (metadata?.name as string) ??
          authData.user.email?.split('@')[0] ??
          'Usuario',
        surname: (metadata?.surname as string) ?? '',
        phone: (metadata?.phone as string) ?? '',
        dni: (metadata?.dni as string) ?? '',
        worker_type: (metadata?.worker_type as string) ?? 'general',
        role: userData.role as 'worker' | 'admin' | 'super_admin',
        is_active: true,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at ?? authData.user.created_at,
      };

      // Guardar en almacenamiento seguro
      if (typeof window !== 'undefined') {
        secureStorage.setItem('worker', worker);
        if (
          authData.session?.access_token != null &&
          authData.session.access_token !== ''
        ) {
          secureStorage.setItem('token', authData.session.access_token);
        }
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: worker });

      // Login completado exitosamente

      // Retornar el worker para usar en signIn
      return worker;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error de autenticación';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error; // Re-throw para que signIn pueda capturarlo
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Limpiar almacenamiento seguro
      if (typeof window !== 'undefined') {
        secureStorage.removeItem('worker');
        secureStorage.removeItem('token');
      }
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch {
      // console.error('Error during logout:', error); // Comentado para producción
      // Aún así, limpiar el estado local
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updatePassword = async (
    _email: string
  ): Promise<{
    error?: string;
  }> => {
    try {
      // Implementar lógica de recuperación de contraseña
      // console.log('Password recovery for:', _email); // Comentado para producción
      // Evitar warning de variable no utilizada
      void _email;
      return {};
    } catch {
      return {
        error: 'Error al actualizar contraseña',
      };
    }
  };

  const signIn = async (
    credentials: AuthCredentials
  ): Promise<{
    error?: string;
    redirectTo?: string;
  }> => {
    try {
      const authenticatedUser = await login(credentials);

      // Determinar redirección basada en el rol del usuario
      let redirectTo = '/dashboard';
      if (authenticatedUser?.role === 'super_admin') {
        redirectTo = '/super-dashboard';
      } else if (authenticatedUser?.role === 'admin') {
        redirectTo = '/dashboard';
      } else if (authenticatedUser?.role === 'worker') {
        redirectTo = '/worker-dashboard';
      }

      // Redirección determinada según el rol del usuario

      return { redirectTo };
    } catch {
      // Error en el proceso de signIn
      return {
        error: 'Error de autenticación',
      };
    }
  };

  const value: AuthContextType = {
    state,
    user: state.currentWorker,
    loading: state.isLoading,
    isPasswordRecovery: state.isPasswordRecovery,
    login,
    logout,
    signOut: logout,
    signIn,
    updatePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };
