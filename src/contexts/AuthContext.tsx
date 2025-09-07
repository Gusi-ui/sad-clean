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

  // Verificar autenticación solo al iniciar - optimizado
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeAuth = (): void => {
      try {
        const workerData = secureStorage.getItem<Worker>('worker');
        const token = secureStorage.getItem<string>('token');

        if (workerData != null && token != null && token !== '') {
          // Restaurar sesión previa inmediatamente
          dispatch({ type: 'AUTH_SUCCESS', payload: workerData });
        } else {
          // No hay sesión previa - finalizar carga
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch {
        // Error al restaurar sesión - limpiar y finalizar carga
        secureStorage.clear();
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    };

    // Ejecutar inmediatamente sin demoras
    initializeAuth();
  }, []); // Solo al montar

  // Manejar tokens de recuperación de contraseña
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePasswordRecovery = async (): Promise<void> => {
      try {
        // Verificar si hay parámetros de recuperación en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        const accessToken =
          urlParams.get('access_token') ?? hashParams.get('access_token');
        const refreshToken =
          urlParams.get('refresh_token') ?? hashParams.get('refresh_token');
        const type = urlParams.get('type') ?? hashParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          // eslint-disable-next-line no-console
          console.log('Token de recuperación detectado, redirigiendo...');

          // Configurar la sesión con el token de recuperación
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            // eslint-disable-next-line no-console
            console.error('Error al configurar sesión de recuperación:', error);
            dispatch({
              type: 'AUTH_FAILURE',
              payload: 'Error al procesar token de recuperación',
            });
          } else {
            // Redirigir a la página de reset de contraseña
            window.location.href = '/auth/reset-password';
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error en manejo de recuperación:', error);
      }
    };

    void handlePasswordRecovery();
  }, []);

  const login = async (
    credentials: AuthCredentials
  ): Promise<Worker | undefined> => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Normalizar email a minúsculas para evitar problemas de case
      const normalizedEmail = credentials.email.toLowerCase().trim();

      // Login directo con Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: credentials.password,
        });

      if (authError) {
        throw new Error(`Error de autenticación: ${authError.message}`);
      }

      if (authData.user == null) {
        throw new Error('Error de autenticación: Usuario no encontrado');
      }

      // Autenticación exitosa con Supabase
      // Usar directamente los datos de Supabase Auth sin consultar auth_users

      // Crear objeto worker basado en los datos de Supabase Auth
      const metadata = authData.user.user_metadata as Record<
        string,
        unknown
      > | null;

      // Determinar el rol basado en el email o metadata
      let role: 'worker' | 'admin' | 'super_admin' = 'worker';
      if (authData.user.email === 'conectomail@gmail.com') {
        role = 'super_admin';
      } else if (authData.user.email === 'webmaster@gusi.dev') {
        role = 'admin';
      } else {
        // Para otros usuarios, asumir que son workers
        role = 'worker';
      }

      const worker: Worker = {
        id: authData.user.id,
        email: authData.user.email ?? '',
        name:
          (metadata?.name as string) ??
          authData.user.email?.split('@')[0] ??
          'Usuario',
        surname: (metadata?.surname as string) ?? '',
        phone: (metadata?.phone as string) ?? '',
        dni: (metadata?.dni as string) ?? '',
        worker_type: (metadata?.worker_type as string) ?? 'cuidadora',
        role,
        is_active: true,
        monthly_contracted_hours:
          (metadata?.monthly_contracted_hours as number) ?? 0,
        weekly_contracted_hours:
          (metadata?.weekly_contracted_hours as number) ?? 0,
        address: (metadata?.address as string) ?? null,
        postal_code: (metadata?.postal_code as string) ?? null,
        city: (metadata?.city as string) ?? null,
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
      const redirectTo =
        authenticatedUser?.role === 'super_admin'
          ? '/super-dashboard'
          : authenticatedUser?.role === 'admin'
            ? '/dashboard'
            : '/worker-dashboard';

      return { redirectTo };
    } catch {
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
