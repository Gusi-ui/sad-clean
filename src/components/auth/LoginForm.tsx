'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError, redirectTo } = await signIn(email, password);

      if (signInError !== null) {
        setError(signInError.message);
      } else if (redirectTo !== undefined) {
        router.push(redirectTo);
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    // eslint-disable-next-line no-void
    void handleSubmit(e);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='flex justify-center'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white font-bold text-2xl'>SAD</span>
            </div>
          </div>
          <h2 className='mt-6 text-center text-3xl font-bold text-gray-900'>
            Iniciar Sesión
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Accede a tu cuenta para gestionar servicios
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleFormSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Correo Electrónico
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='tu@email.com'
                className='mt-1'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Contraseña
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='mt-1'
              />
            </div>
          </div>

          {error !== null && error !== '' && (
            <div className='bg-red-50 border border-red-200 rounded-md p-4'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div>
            <Button
              type='submit'
              className='w-full'
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              ¿Necesitas ayuda? Contacta con administración
            </p>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 text-gray-500'>
                Sistema de Ayuda a Domicilio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
