'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { secureStorage } from '@/utils/secure-storage';

import { authenticateWorker } from '../lib/api';
import type {
  AuthContextType,
  AuthCredentials,
  AuthResponse,
  Worker,
} from '../types';

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

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        if (typeof window === 'undefined' || window === null) return;

        const workerData = secureStorage.getItem<Worker>('worker');
        if (workerData !== null) {
          dispatch({ type: 'AUTH_SUCCESS', payload: workerData });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch {
        // console.error('Error checking auth status:', error); // Comentado para producción
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Error al verificar autenticación',
        });
      }
    };

    void checkAuthStatus();
  }, []);

  const login = async (credentials: AuthCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authenticateWorker(
        credentials.email,
        credentials.password
      );

      if (response.error !== null && response.error !== undefined) {
        throw new Error(response.error);
      }

      if (response.data === null || response.data === undefined) {
        throw new Error('No se recibieron datos de autenticación');
      }

      const authResponse = response.data as AuthResponse;
      const worker = authResponse.worker;

      // Guardar en almacenamiento seguro
      if (typeof window !== 'undefined') {
        secureStorage.setItem('worker', worker);
        if (
          authResponse.token !== undefined &&
          authResponse.token !== null &&
          authResponse.token !== '' &&
          typeof authResponse.token === 'string'
        ) {
          secureStorage.setItem('token', authResponse.token);
        }
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: worker });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error de autenticación';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
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
      await login(credentials);
      return { redirectTo: '/dashboard' };
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
