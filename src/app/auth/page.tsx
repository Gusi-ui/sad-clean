'use client';

import LoginForm from '@/components/auth/LoginForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const { isPasswordRecovery, loading } = useAuth();

  // Muestra un loader mientras el contexto determina el estado inicial
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        {/* Aquí podrías poner un spinner o cualquier indicador de carga */}
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el contexto dice que estamos en modo recuperación, muestra el formulario de reseteo.
  if (isPasswordRecovery) {
    return <ResetPasswordForm />;
  }

  // De lo contrario, muestra el formulario de inicio de sesión.
  return <LoginForm />;
}
