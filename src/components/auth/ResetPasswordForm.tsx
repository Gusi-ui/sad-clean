'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message || 'Error al actualizar la contraseña.');
      } else {
        setSuccess(
          '¡Contraseña actualizada con éxito! Redirigiendo al login...'
        );
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      }
    } catch {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md w-full space-y-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>
          Restablecer Contraseña
        </h2>
        <p className='text-gray-600'>
          Introduce tu nueva contraseña a continuación.
        </p>
      </div>

      <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
        <form
          className='space-y-6'
          onSubmit={(e) => {
            handleSubmit(e).catch((submitError) => {
              // eslint-disable-next-line no-console
              console.error('Error submitting reset password:', submitError);
            });
          }}
        >
          {/* Campo Nueva Contraseña */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Nueva Contraseña
            </label>
            <Input
              id='password'
              name='password'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          {/* Campo Confirmar Contraseña */}
          <div>
            <label
              htmlFor='confirm-password'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Confirmar Nueva Contraseña
            </label>
            <Input
              id='confirm-password'
              name='confirm-password'
              type='password'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          {/* Mensajes de Error/Éxito */}
          {error !== null && error !== undefined && (
            <div className='bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm'>
              {error}
            </div>
          )}
          {success !== null && success !== undefined && (
            <div className='bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 text-sm'>
              {success}
            </div>
          )}

          {/* Botón de Envío */}
          <div>
            <Button
              type='submit'
              className='w-full'
              loading={loading}
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className='text-center'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-500 font-medium'>
              Sistema de Ayuda a Domicilio
            </span>
          </div>
        </div>
        <p className='mt-4 text-xs text-gray-400'>
          © 2025 SAD - Sistema de Gestión de Servicios Asistenciales
          Domiciliarios
        </p>
        <p className='mt-1 text-xs text-gray-400'>
          Hecho con mucho ❤️ por{' '}
          <span className='font-medium text-gray-600'>Gusi</span>
        </p>
      </div>
    </div>
  );
}
