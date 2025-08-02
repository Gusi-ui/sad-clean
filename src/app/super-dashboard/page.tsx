'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { createAdmin, getAdmins, resetAdminPassword } from '@/lib/admin-query';
import type { User as AdminUser } from '@/types';

export default function SuperDashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [selectedAdminForReset, setSelectedAdminForReset] =
    useState<AdminUser | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error !== null && error !== undefined) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  useEffect(() => {
    if (successMessage !== null && successMessage !== undefined) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

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
  }, [user]);

  // Cargar administradores existentes
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminUsers = await getAdmins();
        setAdmins(adminUsers);
      } catch (err) {
        setError('No se pudieron cargar los administradores.');
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    fetchAdmins().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching admins:', err);
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreateAdmin = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const newAdminUser = await createAdmin({
        email: newAdmin.email,
        password: newAdmin.password,
        name: newAdmin.name,
        surname: '',
        phone: '',
        address: '',
        postal_code: '',
        city: '',
        medical_conditions: [],
        emergency_contact: {
          name: '',
          phone: '',
          relationship: '',
        },
      });

      setAdmins([...admins, newAdminUser]);
      setSuccessMessage('¡Administrador creado con éxito!');
      setIsCreateAdminModalOpen(false);
      setNewAdmin({ email: '', password: '', name: '' });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al crear el administrador: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('Error creating admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAdminForReset) return;

    setError(null);
    setSuccessMessage(null);

    if (!resetPasswordData.password || !resetPasswordData.confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (resetPasswordData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetAdminPassword(
        selectedAdminForReset.id,
        resetPasswordData.password
      );

      if (result.success) {
        setSuccessMessage(
          `Contraseña actualizada para ${selectedAdminForReset.name}`
        );
        setIsResetPasswordModalOpen(false);
        setSelectedAdminForReset(null);
        setResetPasswordData({ password: '', confirmPassword: '' });
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al crear el administrador: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('Error creating admin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole='super_admin'>
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
                handleSignOut().catch((signOutError) => {
                  // eslint-disable-next-line no-console
                  console.error('Error signing out:', signOutError);
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
                  {greeting}, {userName} 👑
                </h1>
                <p className='text-gray-600 mt-1'>
                  Panel de control del sistema - Súper Administrador
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
                <Button
                  onClick={() => setIsCreateAdminModalOpen(true)}
                  className='bg-purple-600 hover:bg-purple-700 text-white'
                >
                  ➕ Crear Administrador
                </Button>
                <button
                  onClick={() => {
                    handleSignOut().catch((signOutError) => {
                      // eslint-disable-next-line no-console
                      console.error('Error signing out:', signOutError);
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

          {/* Mensajes de Error y Éxito */}
          {error !== null && error !== undefined && (
            <div className='mb-4 rounded-lg bg-red-100 p-4 text-center text-sm text-red-700'>
              {error}
            </div>
          )}
          {successMessage !== null && successMessage !== undefined && (
            <div className='mb-4 rounded-lg bg-green-100 p-4 text-center text-sm text-green-700'>
              {successMessage}
            </div>
          )}

          {/* Estadísticas - Mobile First */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8'>
            <div className='bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs lg:text-sm text-gray-600 mb-1'>
                    Súper Admin
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    1
                  </p>
                  <p className='text-xs text-purple-600 mt-1'>Tú</p>
                </div>
                <div className='w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg lg:text-2xl'>👑</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs lg:text-sm text-gray-600 mb-1'>
                    Administradores
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    {admins.length}
                  </p>
                  <p className='text-xs text-blue-600 mt-1'>
                    +{admins.length} creados
                  </p>
                </div>
                <div className='w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg lg:text-2xl'>👥</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs lg:text-sm text-gray-600 mb-1'>
                    Trabajadoras
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    0
                  </p>
                  <p className='text-xs text-green-600 mt-1'>
                    Listo para agregar
                  </p>
                </div>
                <div className='w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg lg:text-2xl'>👷</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs lg:text-sm text-gray-600 mb-1'>
                    Usuarios
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    0
                  </p>
                  <p className='text-xs text-orange-600 mt-1'>
                    Listo para agregar
                  </p>
                </div>
                <div className='w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg lg:text-2xl'>👤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación Principal - Mobile First */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8'>
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                🚀 Acciones Rápidas
              </h2>
              <div className='space-y-3'>
                <Button
                  onClick={() => setIsCreateAdminModalOpen(true)}
                  className='w-full text-left p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200'
                >
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>👑</span>
                    <div className='flex-1'>
                      <p className='font-semibold text-gray-900'>
                        Crear Administrador
                      </p>
                      <p className='text-sm text-gray-600'>
                        Añadir nuevo administrador al sistema
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
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                  </div>
                </Button>

                <Link href='/workers' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-2xl'>👥</span>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Gestionar Trabajadoras
                        </p>
                        <p className='text-sm text-gray-600'>
                          Administrar equipo de trabajo
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

                <Link href='/users' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200'>
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

                <Link href='/planning' className='block'>
                  <div className='w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200'>
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
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                👑 Administradores del Sistema
              </h2>
              <div className='space-y-4'>
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className='flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200'
                  >
                    <div
                      className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden'
                      style={{
                        minWidth: '2.5rem',
                        minHeight: '2.5rem',
                        maxWidth: '2.5rem',
                        maxHeight: '2.5rem',
                      }}
                    >
                      <span
                        className='text-white text-xs font-bold leading-none flex items-center justify-center'
                        style={{ lineHeight: '1' }}
                      >
                        {admin.name
                          ? admin.name
                              .split(' ')
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '👤'}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        {admin.name}
                      </p>
                      <p className='text-xs text-gray-600'>{admin.email}</p>
                    </div>
                    <div className='flex flex-col items-end min-w-0'>
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                        Administrador
                      </span>
                      <span className='text-xs text-gray-500 mt-1 text-right'>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='ml-2'>
                      <button
                        onClick={() => {
                          setSelectedAdminForReset(admin);
                          setIsResetPasswordModalOpen(true);
                        }}
                        className='text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded'
                        title='Resetear contraseña'
                      >
                        🔑 Reset
                      </button>
                    </div>
                  </div>
                ))}

                {admins.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <p>No hay administradores creados</p>
                    <p className='text-sm'>
                      Crea el primer administrador del sistema
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navegación Secundaria - Visible en Móvil y Desktop */}
          <div className='block'>
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-lg lg:text-xl font-bold text-gray-900 mb-4'>
                🔧 Herramientas Adicionales
              </h2>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                <Link href='/planning' className='block'>
                  <div className='p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-2xl mb-2 block'>📅</span>
                      <p className='font-medium text-gray-900'>Planificación</p>
                      <p className='text-sm text-gray-600'>Servicios</p>
                    </div>
                  </div>
                </Link>
                <Link href='/balances' className='block'>
                  <div className='p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-2xl mb-2 block'>⏰</span>
                      <p className='font-medium text-gray-900'>Balances</p>
                      <p className='text-sm text-gray-600'>Horas</p>
                    </div>
                  </div>
                </Link>
                <Link href='/assignments' className='block'>
                  <div className='p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-2xl mb-2 block'>📋</span>
                      <p className='font-medium text-gray-900'>Asignaciones</p>
                      <p className='text-sm text-gray-600'>Ver todas</p>
                    </div>
                  </div>
                </Link>
                <Link href='/settings' className='block'>
                  <div className='p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200'>
                    <div className='text-center'>
                      <span className='text-2xl mb-2 block'>⚙️</span>
                      <p className='font-medium text-gray-900'>Configuración</p>
                      <p className='text-sm text-gray-600'>Ajustes</p>
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

        {/* Create Admin Modal */}
        <Modal
          isOpen={isCreateAdminModalOpen}
          onClose={() => setIsCreateAdminModalOpen(false)}
          title='Crear Nuevo Administrador'
          size='md'
        >
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre Completo *
              </label>
              <Input
                className='w-full'
                placeholder='Nombre del administrador'
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email *
              </label>
              <Input
                className='w-full'
                type='email'
                placeholder='admin@empresa.com'
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Contraseña *
              </label>
              <Input
                className='w-full'
                type='password'
                placeholder='Contraseña segura'
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
              />
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsCreateAdminModalOpen(false);
                  setNewAdmin({ email: '', password: '', name: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                className='bg-purple-600 hover:bg-purple-700 text-white'
                onClick={() => {
                  handleCreateAdmin().catch((createAdminError) => {
                    // eslint-disable-next-line no-console
                    console.error('Error creating admin:', createAdminError);
                  });
                }}
                disabled={
                  loading ||
                  newAdmin.name === '' ||
                  newAdmin.email === '' ||
                  newAdmin.password === ''
                }
              >
                {loading ? 'Creando...' : 'Crear Administrador'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          isOpen={isResetPasswordModalOpen}
          onClose={() => {
            setIsResetPasswordModalOpen(false);
            setSelectedAdminForReset(null);
            setResetPasswordData({ password: '', confirmPassword: '' });
          }}
          title={`Resetear Contraseña - ${selectedAdminForReset?.name}`}
          size='md'
        >
          <div className='space-y-4'>
            <div className='bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-3 text-sm'>
              <strong>Atención:</strong> Esto cambiará la contraseña de{' '}
              <strong>{selectedAdminForReset?.email}</strong> inmediatamente.
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nueva Contraseña *
              </label>
              <Input
                type='password'
                className='w-full'
                placeholder='Mínimo 6 caracteres'
                value={resetPasswordData.password}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Confirmar Contraseña *
              </label>
              <Input
                type='password'
                className='w-full'
                placeholder='Repetir contraseña'
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            {error !== null && error !== undefined && (
              <div className='bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm'>
                {error}
              </div>
            )}

            {successMessage !== null && successMessage !== undefined && (
              <div className='bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 text-sm'>
                {successMessage}
              </div>
            )}

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setSelectedAdminForReset(null);
                  setResetPasswordData({ password: '', confirmPassword: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                className='bg-orange-600 hover:bg-orange-700 text-white'
                onClick={() => {
                  handleResetPassword().catch((resetError) => {
                    // eslint-disable-next-line no-console
                    console.error('Error resetting password:', resetError);
                  });
                }}
                disabled={
                  loading ||
                  resetPasswordData.password === '' ||
                  resetPasswordData.confirmPassword === ''
                }
              >
                {loading ? 'Reseteando...' : 'Resetear Contraseña'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
