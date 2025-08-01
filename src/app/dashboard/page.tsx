'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/lib/database';
import { getWorkersStats } from '@/lib/workers-query';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Funciones de navegación
  const handleNavigateToWorkers = (): void => {
    router.push('/workers');
  };

  const handleNavigateToUsers = (): void => {
    router.push('/users');
  };

  const handleNavigateToPlanning = (): void => {
    router.push('/planning');
  };

  const handleNavigateToBalances = (): void => {
    router.push('/balances');
  };

  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');

  // Estados para estadísticas reales
  const [stats, setStats] = useState({
    workers: 0,
    users: 0,
    servicesWithIncrement: '',
    hoursWithIncrement: '',
  });
  const [loading, setLoading] = useState(true);

  // Obtener nombre del usuario y saludo personalizado
  useEffect(() => {
    const metadataName = user?.name;
    if (
      metadataName !== undefined &&
      metadataName !== null &&
      typeof metadataName === 'string' &&
      metadataName.length > 0
    ) {
      // Usar el nombre del user_metadata si está disponible
      setUserName(metadataName);
    } else if (
      user?.email !== undefined &&
      user.email !== null &&
      typeof user.email === 'string' &&
      user.email.length > 0
    ) {
      // Extraer nombre del email como fallback
      const emailName = user.email.split('@')[0];
      if (
        emailName !== undefined &&
        emailName !== null &&
        emailName.length > 0
      ) {
        const displayName =
          emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setUserName(displayName);
      }
    }

    // Saludo según la hora del día
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('¡Buenos días');
    } else if (hour < 18) {
      setGreeting('¡Buenas tardes');
    } else {
      setGreeting('¡Buenas noches');
    }
  }, [user?.email, user?.name]);

  // Cargar estadísticas reales del dashboard
  useEffect(() => {
    const loadDashboardStats = async (): Promise<void> => {
      try {
        setLoading(true);

        // Cargar estadísticas de workers
        const workersStats = await getWorkersStats();

        // Cargar usuarios
        const users = await getAllUsers();

        // Simular datos de servicios y horas (por ahora)
        const currentHour = new Date().getHours();
        const servicesCount = Math.floor(Math.random() * 10) + 15; // Entre 15-25
        const weeklyHours = Math.floor(Math.random() * 50) + 120; // Entre 120-170
        const increment = currentHour > 12 ? '+' : '';

        setStats({
          workers: workersStats.active,
          users: users.length,
          servicesWithIncrement: `${servicesCount}`,
          hoursWithIncrement: `${weeklyHours}${increment}${Math.floor(Math.random() * 20)}h vs semana pasada`,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading dashboard stats:', error);
        // Usar datos por defecto en caso de error
        setStats({
          workers: 0,
          users: 0,
          servicesWithIncrement: '0',
          hoursWithIncrement: '0h vs semana pasada',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      loadDashboardStats().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error in loadDashboardStats:', error);
      });
    }
  }, [user?.role]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute requiredRole='admin'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
        {/* Header Móvil */}
        <header className='bg-white shadow-sm border-b border-gray-200 lg:hidden'>
          <div className='px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 64 64'
                  width='32'
                  height='32'
                  className='w-full h-full'
                >
                  <defs>
                    <linearGradient
                      id='mobileLogoGradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='100%'
                    >
                      <stop offset='0%' stopColor='#3b82f6' />
                      <stop offset='100%' stopColor='#22c55e' />
                    </linearGradient>
                  </defs>
                  <circle
                    cx='32'
                    cy='32'
                    r='30'
                    fill='url(#mobileLogoGradient)'
                  />
                  <path
                    d='M32 50C32 50 12 36.36 12 24.5C12 17.6 17.6 12 24.5 12C28.09 12 31.36 13.94 32 16.35C32.64 13.94 35.91 12 39.5 12C46.4 12 52 17.6 52 24.5C52 36.36 32 50 32 50Z'
                    fill='white'
                    stroke='white'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
              <span className='text-lg font-bold text-gray-900'>SAD</span>
            </div>
            <button
              onClick={() => {
                handleSignOut().catch((error) => {
                  // eslint-disable-next-line no-console
                  console.error('Error signing out:', error);
                });
              }}
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
            </button>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          {/* Saludo Personalizado */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h1 className='text-2xl lg:text-3xl font-bold text-gray-900'>
                  {greeting}, {userName} 👋
                </h1>
                <p className='text-gray-600 mt-1'>
                  Aquí tienes el resumen de tu gestión
                </p>
              </div>
              <div className='hidden lg:flex items-center space-x-4'>
                <span className='text-sm text-gray-500'>
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => {
                    handleSignOut().catch((error) => {
                      // eslint-disable-next-line no-console
                      console.error('Error signing out:', error);
                    });
                  }}
                  className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas - Triple Layout Optimizado */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8'>
            <button
              onClick={handleNavigateToWorkers}
              className='bg-white hover:bg-blue-50 active:bg-blue-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-blue-200 transition-all duration-200 w-full cursor-pointer transform hover:scale-105'
            >
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Trabajadoras
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : stats.workers}
                  </p>
                  <p className='text-xs md:text-xs text-green-600 mt-1'>
                    {loading ? 'Cargando...' : `${stats.workers} activas`}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>👥</span>
                </div>
              </div>
            </button>

            <button
              onClick={handleNavigateToUsers}
              className='bg-white hover:bg-green-50 active:bg-green-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-green-200 transition-all duration-200 w-full cursor-pointer transform hover:scale-105'
            >
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Usuarios
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : stats.users}
                  </p>
                  <p className='text-xs md:text-xs text-green-600 mt-1'>
                    {loading ? 'Cargando...' : `${stats.users} registrados`}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>👤</span>
                </div>
              </div>
            </button>

            <button
              onClick={handleNavigateToPlanning}
              className='bg-white hover:bg-purple-50 active:bg-purple-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-purple-200 transition-all duration-200 w-full cursor-pointer transform hover:scale-105'
            >
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Servicios Hoy
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : stats.servicesWithIncrement}
                  </p>
                  <p className='text-xs md:text-xs text-blue-600 mt-1'>
                    {loading ? 'Cargando...' : 'En progreso'}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>📅</span>
                </div>
              </div>
            </button>

            <button
              onClick={handleNavigateToBalances}
              className='bg-white hover:bg-orange-50 active:bg-orange-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-orange-200 transition-all duration-200 w-full cursor-pointer transform hover:scale-105'
            >
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Horas Semana
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : stats.hoursWithIncrement.split(' ')[0]}
                  </p>
                  <p className='text-xs md:text-xs text-orange-600 mt-1'>
                    {loading
                      ? 'Cargando...'
                      : stats.hoursWithIncrement.split(' ').slice(1).join(' ')}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>⏰</span>
                </div>
              </div>
            </button>
          </div>

          {/* Navegación Principal - Triple Layout Optimizado */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8'>
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                🚀 Acciones Rápidas
              </h2>
              <div className='space-y-3'>
                <Link href='/workers' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>👥</span>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Gestionar Trabajadoras
                        </p>
                        <p className='text-sm text-gray-600'>
                          Añadir, editar o eliminar trabajadoras
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                <Link href='/users' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>👤</span>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Gestionar Usuarios
                        </p>
                        <p className='text-sm text-gray-600'>
                          Administrar usuarios del servicio
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                <Link href='/planning' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>📅</span>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Planificar Servicios
                        </p>
                        <p className='text-sm text-gray-600'>
                          Crear y gestionar asignaciones
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-purple-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                <Link href='/balances' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>⏰</span>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Control de Horas
                        </p>
                        <p className='text-sm text-gray-600'>
                          Revisar balances y horarios
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-orange-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                📊 Actividad Reciente
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200'>
                  <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>M</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      María García
                    </p>
                    <p className='text-xs text-gray-600'>
                      ✅ Completó servicio en Calle Mayor, 123
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>2h</span>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200'>
                  <div className='w-10 h-10 bg-green-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>A</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      Ana López
                    </p>
                    <p className='text-xs text-gray-600'>
                      🆕 Nuevo usuario registrado
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>4h</span>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200'>
                  <div className='w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>C</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      Carlos Ruiz
                    </p>
                    <p className='text-xs text-gray-600'>
                      📅 Asignación programada para mañana
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>6h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación Secundaria - Triple Layout Optimizado */}
          <div className='block'>
            <div className='bg-white rounded-2xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-100'>
              <h2 className='text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                🔧 Herramientas Adicionales
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
                <Link href='/planning' className='block'>
                  <div className='p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-xl md:text-2xl mb-2 block'>📅</span>
                      <p className='text-sm md:text-base font-medium text-gray-900'>
                        Planificación
                      </p>
                      <p className='text-xs md:text-sm text-gray-600'>
                        Servicios
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href='/balances' className='block'>
                  <div className='p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-xl md:text-2xl mb-2 block'>⏰</span>
                      <p className='text-sm md:text-base font-medium text-gray-900'>
                        Balances
                      </p>
                      <p className='text-xs md:text-sm text-gray-600'>Horas</p>
                    </div>
                  </div>
                </Link>
                <Link href='/assignments' className='block'>
                  <div className='p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-xl md:text-2xl mb-2 block'>📋</span>
                      <p className='text-sm md:text-base font-medium text-gray-900'>
                        Asignaciones
                      </p>
                      <p className='text-xs md:text-sm text-gray-600'>
                        Ver todas
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href='/settings' className='block'>
                  <div className='p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-xl md:text-2xl mb-2 block'>⚙️</span>
                      <p className='text-sm md:text-base font-medium text-gray-900'>
                        Configuración
                      </p>
                      <p className='text-xs md:text-sm text-gray-600'>
                        Ajustes
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Simplificado */}
          <footer className='mt-12 lg:mt-16 border-t border-gray-200 bg-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              <div className='text-center'>
                <p className='text-sm text-gray-500 mb-2'>
                  © {new Date().getFullYear()} SAD - Sistema de Gestión de
                  Servicios Asistenciales Domiciliarios
                </p>
                <p className='text-sm text-gray-500'>
                  Hecho con mucho ❤️ por Gusi
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}
