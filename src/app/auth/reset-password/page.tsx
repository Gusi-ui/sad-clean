'use client';

import React, { useEffect, useState } from 'react';

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
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de recuperación en la URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const verifyToken = searchParams.get('verify_token');
    const type = searchParams.get('type');

    // Método 1: Tokens directos de recuperación
    if (accessToken !== null && refreshToken !== null && type === 'recovery') {
      // eslint-disable-next-line no-console
      console.log('Tokens directos de recuperación detectados');
      // Configurar la sesión con el token de recuperación
      void supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error: sessionError }) => {
          if (sessionError) {
            setError(
              'Token de recuperación inválido o expirado. Intenta con el método manual.'
            );
            setShowManualInput(true);
          } else {
            setTokenValid(true);
            setError(null);
          }
        });
    }
    // Método 2: Token de verificación de Supabase
    else if (verifyToken !== null && type === 'recovery') {
      // eslint-disable-next-line no-console
      console.log('Token de verificación de Supabase detectado');
      // Procesar token de verificación de Supabase usando exchangeCodeForSession
      void supabase.auth
        .exchangeCodeForSession(verifyToken)
        .then(({ data, error: exchangeError }) => {
          if (exchangeError) {
            // eslint-disable-next-line no-console
            console.error('Error al intercambiar código:', exchangeError);
            setError(
              `Error al procesar token de recuperación: ${exchangeError.message}. Intenta con el método manual.`
            );
            setShowManualInput(true);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          } else if (data?.session) {
            // eslint-disable-next-line no-console
            console.log(
              'Sesión establecida correctamente con token de verificación'
            );
            setTokenValid(true);
            setError(null);
          } else {
            setError(
              'No se pudo establecer la sesión. Intenta con el método manual.'
            );
            setShowManualInput(true);
          }
        });
    } else {
      // No hay token en URL, mostrar opción manual
      setShowManualInput(true);
      setError(null);
    }
  }, [searchParams]);

  // Función para procesar token manual
  const processManualToken = () => {
    if (!manualToken.trim()) {
      setError('Por favor, ingresa un token válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let tokenType: string | null = null;

      // Intentar diferentes formatos de URL
      const trimmedToken = manualToken.trim();

      // Método 1: URL con hash (formato típico de Supabase)
      if (trimmedToken.includes('#')) {
        const hashPart = trimmedToken.split('#')[1];
        if (hashPart) {
          const hashParams = new URLSearchParams(hashPart);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          tokenType = hashParams.get('type');
        }
      }

      // Método 2: URL con parámetros query (por si acaso)
      if (accessToken === null || refreshToken === null) {
        try {
          const urlObj = new URL(trimmedToken);
          accessToken = urlObj.searchParams.get('access_token');
          refreshToken = urlObj.searchParams.get('refresh_token');
          tokenType = urlObj.searchParams.get('type');
        } catch {
          // No es una URL válida, intentar parsear como parámetros directamente
          const directParams = new URLSearchParams(trimmedToken);
          accessToken = directParams.get('access_token');
          refreshToken = directParams.get('refresh_token');
          tokenType = directParams.get('type');
        }
      }

      // Método 3: Extraer tokens directamente del texto (último recurso)
      if (accessToken === null || refreshToken === null) {
        const accessMatch = trimmedToken.match(/access_token=([^&]+)/);
        const refreshMatch = trimmedToken.match(/refresh_token=([^&]+)/);
        const typeMatch = trimmedToken.match(/type=([^&]+)/);

        if (accessMatch) accessToken = accessMatch[1];
        if (refreshMatch) refreshToken = refreshMatch[1];
        if (typeMatch) tokenType = typeMatch[1];
      }

      // Método 4: Supabase verify token (formato del usuario)
      if (accessToken === null && refreshToken === null) {
        const verifyTokenMatch = trimmedToken.match(/token=([^&]+)/);
        const verifyTypeMatch = trimmedToken.match(/type=([^&]+)/);
        const supabaseUrlMatch = trimmedToken.match(
          /https:\/\/[^.]+\.supabase\.co/
        );

        if (verifyTokenMatch && verifyTypeMatch && supabaseUrlMatch) {
          // Es un token de verificación de Supabase - procesarlo directamente
          // eslint-disable-next-line no-console
          console.log(
            'Token de verificación de Supabase detectado - procesando'
          );
          const verifyToken = verifyTokenMatch[1];

          void supabase.auth
            .exchangeCodeForSession(verifyToken)
            .then(({ data, error: exchangeError }) => {
              if (exchangeError) {
                // eslint-disable-next-line no-console
                console.error(
                  'Error al procesar token de verificación:',
                  exchangeError
                );
                setError(
                  `Error al procesar token de recuperación: ${exchangeError.message}. Solicita un nuevo enlace.`
                );
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              } else if (data?.session) {
                // eslint-disable-next-line no-console
                console.log(
                  'Sesión establecida correctamente con token de verificación manual'
                );
                setTokenValid(true);
                setError(null);
                setShowManualInput(false);
              } else {
                setError(
                  'No se pudo establecer la sesión con el token proporcionado.'
                );
              }
              setLoading(false);
            });
          return;
        }
      }

      // Validar que tenemos los tokens necesarios
      if (accessToken === null || refreshToken === null) {
        // eslint-disable-next-line no-console
        console.log('Debug - Token parsing:', {
          original: trimmedToken,
          accessToken,
          refreshToken,
          tokenType,
        });

        setError(
          'Token inválido. Asegúrate de copiar la URL completa que recibiste en el email. Debe contener "access_token" y "refresh_token".'
        );
        setLoading(false);
        return;
      }

      // Verificar que sea un token de recuperación
      if (tokenType !== null && tokenType !== 'recovery') {
        setError('Este no es un token de recuperación de contraseña válido.');
        setLoading(false);
        return;
      }

      void supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error: sessionError }) => {
          if (sessionError) {
            // eslint-disable-next-line no-console
            console.error('Session error:', sessionError);
            setError(
              `Token inválido o expirado: ${sessionError.message}. Solicita un nuevo enlace de recuperación.`
            );
          } else {
            setTokenValid(true);
            setShowManualInput(false);
            setError(null);
          }
          setLoading(false);
        });
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.error('Parse error:', parseError);
      setError(
        'Error al procesar el token. Verifica que hayas copiado la URL completa del email.'
      );
      setLoading(false);
    }
  };

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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push('/super-dashboard');
        }, 3000);
      }
    } catch {
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
            Resetear Contraseña - SAD gusi
          </h1>
          <p className='text-gray-600'>
            Establece una nueva contraseña segura para tu cuenta de Super
            Administrador
          </p>
          <div className='mt-2 text-sm text-gray-500'>
            👑 <strong>Usuario:</strong> conectomail@gmail.com
          </div>
        </div>

        {/* Status Messages */}
        {Boolean(error) && !showManualInput ? (
          <div className='mb-6 rounded-lg bg-red-100 p-4 text-center text-sm text-red-700'>
            {error}
          </div>
        ) : null}

        {!tokenValid && !Boolean(error) && !showManualInput ? (
          <div className='mb-6 rounded-lg bg-yellow-100 p-4 text-center text-sm text-yellow-700'>
            Verificando token de recuperación...
          </div>
        ) : null}

        {/* Manual Token Input */}
        {showManualInput && !tokenValid ? (
          <div className='mb-6 rounded-lg bg-blue-50 border border-blue-200 p-6'>
            <div className='text-center mb-4'>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                🔑 Ingresa tu Token de Recuperación
              </h3>
              <p className='text-sm text-blue-700'>
                Copia y pega la URL completa que recibiste en tu email de
                recuperación
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-blue-800 mb-2'>
                  URL de Recuperación Completa:
                </label>
                <textarea
                  className='w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                  rows={4}
                  placeholder='Pega aquí la URL completa del email. Ejemplo: http://localhost:3000/#access_token=...&refresh_token=...&type=recovery'
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                />
                <p className='text-xs text-blue-600 mt-1'>
                  💡 La URL debe contener &quot;access_token&quot; y
                  &quot;refresh_token&quot;
                </p>
              </div>

              {Boolean(error) ? (
                <div className='rounded-lg bg-red-100 p-3 text-sm text-red-700'>
                  {error}
                </div>
              ) : null}

              <div className='flex justify-center'>
                <Button
                  onClick={() => void processManualToken()}
                  disabled={loading || !manualToken.trim()}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2'
                >
                  {loading ? (
                    <span className='flex items-center space-x-2'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      <span>Procesando...</span>
                    </span>
                  ) : (
                    '🔓 Procesar Token'
                  )}
                </Button>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-blue-200'>
              <details className='text-sm'>
                <summary className='cursor-pointer text-blue-700 hover:text-blue-800 font-medium'>
                  📋 ¿Dónde encuentro la URL de recuperación?
                </summary>
                <div className='mt-2 text-blue-600 space-y-2'>
                  <p>• Ve al email que recibiste de Supabase</p>
                  <p>
                    • Copia el enlace completo de &quot;Reset Password&quot;
                  </p>
                  <p>• Pégalo en el campo de arriba</p>
                  <p>
                    • O usa el script:{' '}
                    <code className='bg-blue-100 px-1 rounded'>
                      node process-recovery-token.js
                    </code>
                  </p>
                </div>
              </details>

              <details className='text-sm mt-3'>
                <summary className='cursor-pointer text-orange-700 hover:text-orange-800 font-medium'>
                  🔍 ¿Qué formato debe tener la URL?
                </summary>
                <div className='mt-2 text-orange-600 space-y-2'>
                  <p>
                    <strong>Ejemplo de URL correcta:</strong>
                  </p>
                  <code className='block bg-orange-50 p-2 rounded text-xs break-all'>
                    http://localhost:3000/#access_token=eyJ...&refresh_token=abc...&type=recovery
                  </code>
                  <p className='text-xs mt-2'>
                    • Debe contener: <code>access_token=</code>,{' '}
                    <code>refresh_token=</code>
                    <br />• Puede tener <code>#</code> o <code>?</code> al
                    inicio de los parámetros
                    <br />• Copia la URL completa tal como aparece en el email
                  </p>
                </div>
              </details>
            </div>
          </div>
        ) : null}

        {/* Form */}
        {tokenValid ? (
          <form onSubmit={(e) => void handleSubmit(e)} className='space-y-6'>
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
              {password ? (
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
              ) : null}
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
              {confirmPassword && password !== confirmPassword ? (
                <p className='mt-1 text-xs text-red-600 flex items-center space-x-1'>
                  <span>⚠️</span>
                  <span>Las contraseñas no coinciden</span>
                </p>
              ) : null}
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
        ) : null}

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
