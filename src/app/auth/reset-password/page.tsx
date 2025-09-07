'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de recuperación en la URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      // Configurar la sesión con el token de recuperación
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            setError('Token de recuperación inválido o expirado');
          } else {
            setTokenValid(true);
          }
        });
    } else {
      setError('No se encontró un token de recuperación válido');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!/(?=.*[a-z])/.test(password)) {
      setError('La contraseña debe contener al menos una letra minúscula');
      return;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return;
    }

    if (!/(?=.*\d)/.test(password)) {
      setError('La contraseña debe contener al menos un número');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push('/super-dashboard');
        }, 3000);
      }
    } catch (err) {
      setError('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-2xl'>✅</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            ¡Contraseña Actualizada!
          </h1>
          <p className='text-gray-600 mb-6'>
            Tu contraseña ha sido cambiada exitosamente. Serás redirigido al
            dashboard en unos segundos...
          </p>
          <div className='text-sm text-gray-500'>
            <p>📧 Email: conectomail@gmail.com</p>
            <p>👑 Rol: Super Administrador</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🔐</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Resetear Contraseña
          </h1>
          <p className='text-gray-600'>
            Establece una nueva contraseña segura para tu cuenta
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className='mb-6 rounded-lg bg-red-100 p-4 text-center text-sm text-red-700'>
            {error}
          </div>
        )}

        {!tokenValid && !error && (
          <div className='mb-6 rounded-lg bg-yellow-100 p-4 text-center text-sm text-yellow-700'>
            Verificando token de recuperación...
          </div>
        )}

        {/* Form */}
        {tokenValid && (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nueva Contraseña *
              </label>
              <Input
                type='password'
                className='w-full'
                placeholder='Mínimo 6 caracteres con mayúscula, minúscula y número'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className='mt-2 text-xs'>
                  <div
                    className={`flex items-center space-x-2 ${password.length >= 6 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{password.length >= 6 ? '✅' : '❌'}</span>
                    <span>Mínimo 6 caracteres</span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{/(?=.*[a-z])/.test(password) ? '✅' : '❌'}</span>
                    <span>Letra minúscula</span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{/(?=.*[A-Z])/.test(password) ? '✅' : '❌'}</span>
                    <span>Letra mayúscula</span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span>{/(?=.*\d)/.test(password) ? '✅' : '❌'}</span>
                    <span>Número</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirmar Contraseña *
              </label>
              <Input
                type='password'
                className='w-full'
                placeholder='Repite la contraseña'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className='mt-1 text-xs text-red-600 flex items-center space-x-1'>
                  <span>⚠️</span>
                  <span>Las contraseñas no coinciden</span>
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3'
              disabled={
                loading ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                password.length < 6
              }
            >
              {loading ? (
                <span className='flex items-center justify-center space-x-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>Actualizando...</span>
                </span>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
          <p className='text-sm text-gray-600 mb-4'>
            ¿Necesitas ayuda? Contacta al administrador del sistema
          </p>
          <Link
            href='/'
            className='text-blue-600 hover:text-blue-700 text-sm font-medium'
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
