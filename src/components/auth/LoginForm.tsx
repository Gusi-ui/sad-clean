'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();

  // Cargar email guardado del localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('sad_last_email');
    if (savedEmail !== null) {
      setEmail(savedEmail);
    }
  }, []);

  // Validación en tiempo real del email
  useEffect(() => {
    if (email === '') {
      setEmailError(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, introduce un email válido');
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Validación en tiempo real de la contraseña
  useEffect(() => {
    if (password === '') {
      setPasswordError(null);
      return;
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
    } else {
      setPasswordError(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación final antes de enviar
    if (emailError !== null || passwordError !== null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Guardar email en localStorage
      localStorage.setItem('sad_last_email', email);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid =
    email !== '' &&
    password !== '' &&
    emailError === null &&
    passwordError === null;

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Logo y Header */}
        <div className='text-center'>
          <div className='flex justify-center mb-6'>
            <div className='w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 64 64'
                width='48'
                height='48'
                className='w-full h-full'
              >
                <defs>
                  <linearGradient
                    id='loginLogoGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='100%'
                  >
                    <stop offset='0%' stopColor='#ffffff' />
                    <stop offset='100%' stopColor='#ffffff' />
                  </linearGradient>
                </defs>
                <circle cx='32' cy='32' r='30' fill='url(#loginLogoGradient)' />
                <path
                  d='M32 50C32 50 12 36.36 12 24.5C12 17.6 17.6 12 24.5 12C28.09 12 31.36 13.94 32 16.35C32.64 13.94 35.91 12 39.5 12C46.4 12 52 17.6 52 24.5C52 36.36 32 50 32 50Z'
                  fill='#3b82f6'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Bienvenido de vuelta
          </h2>
          <p className='text-gray-600'>
            Accede a tu cuenta para gestionar servicios asistenciales
          </p>
        </div>

        {/* Formulario */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <form className='space-y-6' onSubmit={handleFormSubmit}>
            {/* Campo Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Correo Electrónico
              </label>
              <div className='relative'>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='tu@email.com'
                  className={`mt-1 pr-10 ${
                    emailError !== null
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }`}
                  aria-describedby={
                    emailError !== null ? 'email-error' : undefined
                  }
                />
                {emailError !== null && (
                  <div id='email-error' className='mt-1 text-sm text-red-600'>
                    {emailError}
                  </div>
                )}
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Contraseña
              </label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className={`mt-1 pr-12 ${
                    passwordError !== null
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }`}
                  aria-describedby={
                    passwordError !== null ? 'password-error' : undefined
                  }
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  )}
                </button>
                {passwordError !== null && (
                  <div
                    id='password-error'
                    className='mt-1 text-sm text-red-600'
                  >
                    {passwordError}
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de Error General */}
            {error !== null && error !== '' && (
              <div
                className='bg-red-50 border border-red-200 rounded-lg p-4'
                role='alert'
              >
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-600'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <div>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
                loading={loading}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  '🔐 Iniciar Sesión'
                )}
              </Button>
            </div>

            {/* Información de Ayuda */}
            <div className='text-center'>
              <p className='text-sm text-gray-600'>
                ¿Necesitas ayuda?{' '}
                <a
                  href='mailto:info@alamia.es?subject=Ayuda con acceso a SAD'
                  className='text-blue-600 hover:text-blue-800 font-medium transition-colors'
                >
                  Contacta con administración
                </a>
              </p>
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
            Hecho con mucho ❤️ por Gusi
          </p>
        </div>
      </div>
    </div>
  );
}
