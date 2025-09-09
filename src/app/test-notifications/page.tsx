'use client';

import React, { useEffect, useState } from 'react';

export default function TestNotificationsPage() {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [title, setTitle] = useState('🧪 Notificación de Prueba');
  const [body, setBody] = useState(
    'Esta es una notificación de prueba para verificar el funcionamiento del sistema.'
  );
  const [type, setType] = useState('system_message');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verificar estado de Supabase al cargar la página
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        // Intentar importar Supabase dinámicamente para evitar problemas
        const { supabase } = await import('@/lib/database');

        if (supabase) {
          setIsSupabaseReady(true);

          // Limpiar cualquier error de autenticación anterior
          setAuthError(null);
        }
      } catch (initError) {
        console.error('Error inicializando Supabase:', initError);
        setAuthError('Error al inicializar Supabase. Revisa la configuración.');
        setIsSupabaseReady(false);
      }
    };

    checkSupabaseStatus().catch((checkError) => {
      console.error('Error checking Supabase status:', checkError);
    });

    // Limpiar errores de autenticación al montar el componente
    const clearAuthErrors = () => {
      setAuthError(null);
    };

    // Limpiar errores después de un tiempo
    const timeout = setTimeout(clearAuthErrors, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const clearSupabaseSession = async () => {
    try {
      // Limpiar localStorage y sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // Limpiar cookies relacionadas con Supabase
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }

      setAuthError(null);
      setResult('✅ Sesión limpiada. Recarga la página para continuar.');
      // eslint-disable-next-line no-console
      console.log('🧹 Sesión de Supabase limpiada');
    } catch (clearError) {
      // eslint-disable-next-line no-console
      console.error('Error limpiando sesión:', clearError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    if (!isSupabaseReady) {
      setError(
        'Supabase no está listo. Espera un momento o recarga la página.'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId,
          title,
          body,
          type,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        notification?: unknown;
        message?: string;
      };

      if (response.ok && data.success) {
        setResult(`✅ ${data.message ?? 'Notificación enviada exitosamente'}`);
        // eslint-disable-next-line no-console
        console.log('📋 Notificación creada:', data.notification);
      } else {
        setError(data.error ?? 'Error desconocido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al enviar notificación: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'system_message', label: 'Mensaje del Sistema' },
    { value: 'assignment_change', label: 'Cambio de Asignación' },
    { value: 'new_user', label: 'Nuevo Usuario' },
    { value: 'schedule_change', label: 'Cambio de Horario' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'reminder', label: 'Recordatorio' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='max-w-2xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-2xl shadow-lg p-8'>
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-3xl font-bold text-gray-900'>
                🧪 Prueba de Notificaciones
              </h1>
              <div className='flex items-center space-x-2'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSupabaseReady ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <span className='text-sm text-gray-600'>
                  {isSupabaseReady ? 'Supabase OK' : 'Cargando...'}
                </span>
              </div>
            </div>
            <p className='text-gray-600'>
              Utiliza este formulario para probar el sistema de notificaciones y
              verificar que funcionen correctamente.
            </p>

            {/* Indicador de estado de Supabase */}
            {!isSupabaseReady && (
              <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <p className='text-sm text-yellow-800'>
                  🔄 Inicializando conexión con Supabase...
                </p>
              </div>
            )}

            {/* Error de autenticación */}
            {authError && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-red-800'>
                    ❌ Error de autenticación: {authError}
                  </p>
                  <button
                    onClick={() => void clearSupabaseSession()}
                    className='text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded'
                  >
                    Limpiar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              handleSubmit(e).catch((submitError) => {
                console.error('Error submitting form:', submitError);
              });
            }}
            className='space-y-6'
          >
            <div>
              <label
                htmlFor='workerId'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                ID del Trabajador *
              </label>
              <input
                type='text'
                id='workerId'
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Ingresa el ID del trabajador'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>
                Puedes obtener el ID del trabajador desde la tabla workers en
                Supabase
              </p>
            </div>

            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Título de la Notificación
              </label>
              <input
                type='text'
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Título de la notificación'
              />
            </div>

            <div>
              <label
                htmlFor='body'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Cuerpo de la Notificación
              </label>
              <textarea
                id='body'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Contenido de la notificación'
              />
            </div>

            <div>
              <label
                htmlFor='type'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Tipo de Notificación
              </label>
              <select
                id='type'
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {notificationTypes.map((nt) => (
                  <option key={nt.value} value={nt.value}>
                    {nt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type='submit'
              disabled={loading || !workerId.trim()}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center'
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
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
                  Enviando...
                </>
              ) : (
                '🚀 Enviar Notificación de Prueba'
              )}
            </button>
          </form>

          {result && (
            <div className='mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                {result}
              </div>
            </div>
          )}

          {error && (
            <div className='mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h3 className='text-sm font-medium text-blue-800 mb-2'>
              💡 Consejos para probar:
            </h3>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• Abre la aplicación de trabajadoras en otra pestaña</li>
              <li>• Asegúrate de que el worker esté autenticado</li>
              <li>• Verifica la consola del navegador para logs de debug</li>
              <li>• Revisa si aparecen las notificaciones en tiempo real</li>
            </ul>
          </div>

          <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <h3 className='text-sm font-medium text-yellow-800 mb-2'>
              🚨 Solución de problemas de autenticación
            </h3>
            <ul className='text-sm text-yellow-700 space-y-1'>
              <li>
                • Si ves &ldquo;Invalid Refresh Token&rdquo;: haz clic en
                &ldquo;Limpiar Sesión&rdquo;
              </li>
              <li>• Después de limpiar, recarga la página (F5)</li>
              <li>• Si persiste el error, borra las cookies del navegador</li>
              <li>
                • Verifica que las variables de entorno de Supabase estén
                configuradas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
