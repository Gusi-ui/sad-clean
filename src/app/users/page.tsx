'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import {
  logUserCreated,
  logUserDeleted,
  logUserUpdated,
} from '@/lib/activities-query';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUsersStats,
  searchUsers,
  updateUser,
} from '@/lib/users-query';
import type { User, UserInsert, UserUpdate } from '@/types';

export default function UsersPage() {
  const { user } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');

  // Determinar la URL del dashboard según el rol del usuario
  useEffect(() => {
    if (user?.role === 'super_admin') {
      setDashboardUrl('/super-dashboard');
    } else if (user?.role === 'admin') {
      setDashboardUrl('/dashboard');
    } else if (user?.role === 'worker') {
      setDashboardUrl('/worker-dashboard');
    }
  }, [user?.role]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados para modal de confirmación de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Estados para validaciones del formulario de crear usuario
  const [userValidationErrors, setUserValidationErrors] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    client_code: '',
  });

  // Estados para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withAssignments: 0,
  });

  // Funciones de validación para usuarios
  const validateUserName = (name: string): string => {
    if (name.trim().length === 0) {
      return 'El nombre es obligatorio';
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (name.trim().length > 50) {
      return 'El nombre no puede tener más de 50 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return '';
  };

  const validateUserSurname = (surname: string): string => {
    if (surname.trim().length === 0) {
      return 'Los apellidos son obligatorios';
    }
    if (surname.trim().length < 2) {
      return 'Los apellidos deben tener al menos 2 caracteres';
    }
    if (surname.trim().length > 100) {
      return 'Los apellidos no pueden tener más de 100 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(surname.trim())) {
      return 'Los apellidos solo pueden contener letras y espacios';
    }
    return '';
  };

  const validateUserEmail = (email: string): string => {
    if (email.trim().length === 0) {
      return 'El email es obligatorio';
    }
    if (email.trim().length > 100) {
      return 'El email no puede tener más de 100 caracteres';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Formato de email inválido';
    }
    return '';
  };

  const validateUserPhone = (phone: string): string => {
    if (phone.trim().length === 0) {
      return 'El teléfono es obligatorio';
    }
    const phoneRegex =
      /^[67]\d{8}$|^[89]\d{8}$|^\+34[67]\d{8}$|^\+34[89]\d{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
      return 'Formato de teléfono inválido (ej: 612345678 o +34612345678)';
    }
    return '';
  };

  const validateUserAddress = (address: string): string => {
    if (address.trim().length === 0) {
      return 'La dirección es obligatoria';
    }
    if (address.trim().length < 5) {
      return 'La dirección debe tener al menos 5 caracteres';
    }
    if (address.trim().length > 200) {
      return 'La dirección no puede tener más de 200 caracteres';
    }
    return '';
  };

  const validateUserPostalCode = (postalCode: string): string => {
    if (postalCode.trim().length === 0) {
      return 'El código postal es obligatorio';
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      return 'El código postal debe tener 5 dígitos';
    }
    return '';
  };

  const validateUserCity = (city: string): string => {
    if (city.trim().length === 0) {
      return 'La ciudad es obligatoria';
    }
    if (city.trim().length < 2) {
      return 'La ciudad debe tener al menos 2 caracteres';
    }
    if (city.trim().length > 50) {
      return 'La ciudad no puede tener más de 50 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(city.trim())) {
      return 'La ciudad solo puede contener letras y espacios';
    }
    return '';
  };

  // Función para generar código de usuario automáticamente
  const generateUserCode = (): string => {
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 caracteres aleatorios
    return `USR${timestamp}${random}`;
  };

  const validateUserForm = (): boolean => {
    const nameError = validateUserName(editingUser.name ?? '');
    const surnameError = validateUserSurname(editingUser.surname ?? '');
    const emailError = validateUserEmail(editingUser.email ?? '');
    const phoneError = validateUserPhone(editingUser.phone ?? '');
    const addressError = validateUserAddress(editingUser.address ?? '');
    const postalCodeError = validateUserPostalCode(
      editingUser.postal_code ?? ''
    );
    const cityError = validateUserCity(editingUser.city ?? '');

    setUserValidationErrors({
      name: nameError,
      surname: surnameError,
      email: emailError,
      phone: phoneError,
      address: addressError,
      postal_code: postalCodeError,
      city: cityError,
      client_code: '', // Ya no se valida porque se auto-genera
    });

    return (
      nameError === '' &&
      surnameError === '' &&
      emailError === '' &&
      phoneError === '' &&
      addressError === '' &&
      postalCodeError === '' &&
      cityError === ''
    );
  };

  // Cargar usuarios y estadísticas
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const [usersData, statsData] = await Promise.all([
          getAllUsers(),
          getUsersStats(),
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch (err) {
        setError('Error al cargar los usuarios');
        // eslint-disable-next-line no-console
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers().catch((loadError) => {
      // eslint-disable-next-line no-console
      console.error('Error loading users:', loadError);
    });
  }, []);

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

  const handleAddUser = () => {
    setEditingUser({
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      client_code: generateUserCode(), // Auto-generar código
      medical_conditions: [],
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
      is_active: true,
    });
    setUserValidationErrors({
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      client_code: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditUser = (currentUser: User) => {
    setEditingUser({ ...currentUser });
    setUserValidationErrors({
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      client_code: '',
    });
    setIsEditModalOpen(true);
  };

  const handleViewUser = (currentUser: User) => {
    setSelectedUser(currentUser);
    setIsViewModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!validateUserForm()) {
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setSavingUser(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isAddModalOpen) {
        const newUser = await createUser(editingUser as UserInsert);
        setUsers([newUser, ...users]);
        setSuccessMessage('Usuario creado exitosamente');
        setIsAddModalOpen(false);

        // Log de creación de usuario
        if (user) {
          await logUserCreated(
            `${newUser.name} ${newUser.surname}`,
            newUser.id,
            (user.user_metadata?.['name'] as string) || 'Administrador',
            user.email || ''
          );
        }
      } else {
        const updatedUser = await updateUser(
          editingUser.id ?? '',
          editingUser as UserUpdate
        );
        if (updatedUser) {
          setUsers(
            users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          );
          setSuccessMessage('Usuario actualizado exitosamente');
          setIsEditModalOpen(false);

          // Log de actualización de usuario
          if (user) {
            await logUserUpdated(
              `${updatedUser.name} ${updatedUser.surname}`,
              updatedUser.id,
              (user.user_metadata?.['name'] as string) || 'Administrador',
              user.email || ''
            );
          }
        }
      }
      setEditingUser({});
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar el usuario: ${errorMessage}`);
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUserConfirm = (currentUser: User) => {
    setUserToDelete(currentUser);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(true);
    setError(null);

    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setSuccessMessage('Usuario eliminado exitosamente');
      setIsDeleteModalOpen(false);

      // Log de eliminación de usuario
      if (user) {
        await logUserDeleted(
          `${userToDelete.name} ${userToDelete.surname}`,
          userToDelete.id,
          (user.user_metadata?.['name'] as string) || 'Administrador',
          user.email || ''
        );
      }

      setUserToDelete(null);
    } catch (deleteError) {
      const errorMessage =
        deleteError instanceof Error
          ? deleteError.message
          : 'Error desconocido';
      setError(`Error al eliminar el usuario: ${errorMessage}`);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term);
    try {
      if (term.trim() === '') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } else {
        const searchResults = await searchUsers(term);
        setUsers(searchResults);
      }
    } catch (searchError) {
      // eslint-disable-next-line no-console
      console.error('Error searching users:', searchError);
    }
  };

  // Filtrar usuarios según el estado seleccionado
  const filteredUsers = users.filter((currentUser) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return currentUser.is_active === true;
    if (filterStatus === 'inactive') return currentUser.is_active !== true;
    return true;
  });

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
                      id='mobileUsersLogoGradient'
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
                    fill='url(#mobileUsersLogoGradient)'
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
            <Link
              href={dashboardUrl}
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
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </Link>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          {/* Header Desktop */}
          <div className='hidden lg:block mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  👤 Gestión de Usuarios
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administra los usuarios del servicio SAD
                </p>
              </div>
              <Link
                href={dashboardUrl}
                className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-4 h-4 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                Volver al Dashboard
              </Link>
            </div>
          </div>

          {/* Header Mobile */}
          <div className='lg:hidden mb-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              👤 Gestión de Usuarios
            </h1>
            <p className='text-gray-600 text-sm'>
              Administra los usuarios del servicio SAD
            </p>
          </div>

          {/* Mensajes de Éxito y Error */}
          {successMessage !== null && successMessage !== undefined && (
            <div className='mb-4 rounded-lg bg-green-100 p-4 text-center text-sm text-green-700'>
              {successMessage}
            </div>
          )}
          {error !== null && error !== undefined && (
            <div className='mb-4 rounded-lg bg-red-100 p-4 text-center text-sm text-red-700'>
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div
              onClick={() => setFilterStatus('all')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>👤</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Total Usuarios
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.total}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('active')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>✅</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Activos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.active}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('inactive')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏸️</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Inactivos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.inactive}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div className='cursor-pointer'>
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>📋</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Con Asignación
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.withAssignments}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search and Actions */}
          <div className='mb-6 space-y-4'>
            {/* Search Bar */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <Input
                type='text'
                placeholder='Buscar usuarios por nombre, apellido o email...'
                value={searchTerm}
                onChange={(e) => {
                  handleSearch(e.target.value).catch((searchError) => {
                    // eslint-disable-next-line no-console
                    console.error('Error in search:', searchError);
                  });
                }}
                className='pl-10'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                onClick={handleAddUser}
                className='bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
              >
                ➕ Agregar Usuario
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando usuarios...</p>
            </div>
          )}

          {/* Users List - Mobile Cards */}
          {!loading && (
            <div className='md:hidden space-y-4'>
              {filteredUsers.map((currentUser) => (
                <Card
                  key={currentUser.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  {/* Header con Avatar y Nombre */}
                  <div className='flex items-center space-x-3 mb-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md'>
                      <span className='text-sm font-bold text-white'>
                        {currentUser.name.charAt(0).toUpperCase()}
                        {currentUser.surname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-gray-900 text-lg'>
                        {currentUser.name} {currentUser.surname}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        Código: {currentUser.client_code}
                      </p>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className='space-y-2 mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>📧</span>
                      <span className='text-sm text-gray-700'>
                        {currentUser.email ?? 'Sin email'}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>📱</span>
                      <span className='text-sm text-gray-700'>
                        {currentUser.phone}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>📍</span>
                      <span className='text-sm text-gray-700'>
                        {currentUser.city}
                      </span>
                    </div>
                  </div>

                  {/* Estado y Acciones */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          currentUser.is_active === true
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {currentUser.is_active === true ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className='flex items-center space-x-3'>
                      <button
                        className='text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium'
                        onClick={() => handleViewUser(currentUser)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 transition-colors text-sm font-medium'
                        onClick={() => handleEditUser(currentUser)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className='text-red-600 hover:text-red-900 transition-colors text-sm font-medium'
                        onClick={() => handleDeleteUserConfirm(currentUser)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Users List - Tablet Hybrid Layout */}
          {!loading && (
            <div className='hidden md:block lg:hidden space-y-3'>
              {filteredUsers.map((currentUser) => (
                <Card
                  key={currentUser.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  <div className='flex items-center gap-6'>
                    {/* Avatar y información principal */}
                    <div className='flex items-center space-x-4 flex-1'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                        <span className='text-base font-bold text-white'>
                          {currentUser.name.charAt(0).toUpperCase()}
                          {currentUser.surname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 mb-1'>
                          {currentUser.name} {currentUser.surname}
                        </h3>
                        <p className='text-sm text-gray-600 mb-1'>
                          Código: {currentUser.client_code}
                        </p>
                        <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600'>
                          <span>📧 {currentUser.email ?? 'Sin email'}</span>
                          <span>📱 {currentUser.phone}</span>
                          <span>📍 {currentUser.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className='flex flex-col items-center gap-3 min-w-0'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          currentUser.is_active === true
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {currentUser.is_active === true ? 'Activo' : 'Inactivo'}
                      </span>

                      <div className='flex space-x-2'>
                        <button
                          className='px-3 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleViewUser(currentUser)}
                        >
                          👁️ Ver
                        </button>
                        <button
                          className='px-3 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleEditUser(currentUser)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className='px-3 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleDeleteUserConfirm(currentUser)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Users List - Desktop Layout */}
          {!loading && (
            <div className='hidden lg:block space-y-4'>
              {filteredUsers.map((currentUser) => (
                <Card key={currentUser.id} className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                        <span className='text-xl font-bold text-white'>
                          {currentUser.name.charAt(0).toUpperCase()}
                          {currentUser.surname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-xl font-semibold text-gray-900 truncate'>
                          {currentUser.name} {currentUser.surname}
                        </h3>
                        <p className='text-base text-gray-600 truncate'>
                          {currentUser.email ?? 'Sin email'}
                        </p>
                        <p className='text-sm text-gray-500 truncate'>
                          {currentUser.phone} • {currentUser.city}
                        </p>
                        <p className='text-sm text-gray-500 truncate'>
                          Código: {currentUser.client_code}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          currentUser.is_active
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {currentUser.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className='flex space-x-3'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewUser(currentUser)}
                        >
                          👁️ Ver
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditUser(currentUser)}
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteUserConfirm(currentUser)}
                          className='text-red-600 hover:text-red-700'
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredUsers.length === 0 && (
            <Card className='p-8 text-center'>
              <div className='text-6xl mb-4'>👤</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay usuarios
              </h3>
              <p className='text-gray-600 mb-4'>
                {searchTerm
                  ? 'No se encontraron usuarios con ese criterio de búsqueda'
                  : 'Aún no hay usuarios registrados en el sistema'}
              </p>
              <Button
                onClick={handleAddUser}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                ➕ Agregar Primer Usuario
              </Button>
            </Card>
          )}
        </div>

        {/* Add/Edit User Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingUser({});
            setUserValidationErrors({
              name: '',
              surname: '',
              email: '',
              phone: '',
              address: '',
              postal_code: '',
              city: '',
              client_code: '',
            });
          }}
          title={isAddModalOpen ? '➕ Agregar Usuario' : '✏️ Editar Usuario'}
          size='lg'
        >
          <div className='space-y-4'>
            {/* Personal Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre *
                </label>
                <Input
                  value={editingUser.name ?? ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, name: e.target.value });
                  }}
                  className={
                    userValidationErrors.name
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.name && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Apellidos *
                </label>
                <Input
                  value={editingUser.surname ?? ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, surname: e.target.value });
                  }}
                  className={
                    userValidationErrors.surname
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.surname && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.surname}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <Input
                  type='email'
                  value={editingUser.email ?? ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, email: e.target.value });
                  }}
                  className={
                    userValidationErrors.email
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.email && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono *
                </label>
                <Input
                  type='tel'
                  value={editingUser.phone ?? ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, phone: e.target.value });
                  }}
                  className={
                    userValidationErrors.phone
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.phone && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Dirección *
              </label>
              <Input
                value={editingUser.address ?? ''}
                onChange={(e) => {
                  setEditingUser({ ...editingUser, address: e.target.value });
                }}
                className={
                  userValidationErrors.address
                    ? 'border-red-300 focus:border-red-500'
                    : ''
                }
              />
              {userValidationErrors.address && (
                <p className='mt-1 text-sm text-red-600'>
                  {userValidationErrors.address}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Código Postal *
                </label>
                <Input
                  value={editingUser.postal_code ?? ''}
                  onChange={(e) => {
                    setEditingUser({
                      ...editingUser,
                      postal_code: e.target.value,
                    });
                  }}
                  className={
                    userValidationErrors.postal_code
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.postal_code && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.postal_code}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ciudad *
                </label>
                <Input
                  value={editingUser.city ?? ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, city: e.target.value });
                  }}
                  className={
                    userValidationErrors.city
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  }
                />
                {userValidationErrors.city && (
                  <p className='mt-1 text-sm text-red-600'>
                    {userValidationErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Código Usuario *
                </label>
                <Input
                  value={editingUser.client_code ?? ''}
                  readOnly
                  className='bg-gray-50 cursor-not-allowed'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Código auto-generado por el sistema
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={editingUser.is_active ?? true}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      is_active: e.target.checked,
                    })
                  }
                  className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Usuario activo
                </span>
              </label>
            </div>
          </div>

          <div className='flex justify-end space-x-3 mt-6'>
            <Button
              variant='outline'
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingUser({});
              }}
              disabled={savingUser}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleSaveUser().catch((saveError) => {
                  // eslint-disable-next-line no-console
                  console.error('Error saving user:', saveError);
                });
              }}
              disabled={savingUser}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              {savingUser ? 'Guardando...' : 'Guardar Usuario'}
            </Button>
          </div>
        </Modal>

        {/* View User Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          title='👤 Detalles del Usuario'
          size='md'
        >
          {selectedUser && (
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 font-bold text-xl'>
                    {selectedUser.name.charAt(0).toUpperCase()}
                    {selectedUser.surname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    {selectedUser.name} {selectedUser.surname}
                  </h3>
                  <p className='text-gray-600'>{selectedUser.email}</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Teléfono
                  </label>
                  <p className='text-sm text-gray-900'>{selectedUser.phone}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Código Usuario
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedUser.client_code}
                  </p>
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Dirección
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedUser.address}
                    <br />
                    {selectedUser.postal_code} {selectedUser.city}
                  </p>
                </div>
              </div>

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleDeleteUserConfirm(selectedUser);
                  }}
                  className='text-red-600 hover:text-red-700'
                >
                  🗑️ Eliminar
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          title='🗑️ Eliminar Usuario'
          size='md'
        >
          <div className='space-y-4'>
            <div className='bg-red-50 border border-red-200 text-red-800 rounded-lg p-4'>
              <p className='font-medium'>
                ¿Estás seguro de que quieres eliminar a{' '}
                <strong>
                  {userToDelete?.name} {userToDelete?.surname}
                </strong>
                ?
              </p>
              <p className='text-sm mt-2'>
                Esta acción no se puede deshacer. Se eliminarán todos los datos
                asociados al usuario.
              </p>
            </div>

            <div className='flex justify-end space-x-3'>
              <Button variant='outline' onClick={handleDeleteModalClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  handleDeleteUser().catch((deleteError) => {
                    // eslint-disable-next-line no-console
                    console.error('Error deleting user:', deleteError);
                  });
                }}
                disabled={deletingUser}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                {deletingUser ? 'Eliminando...' : 'Eliminar Usuario'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
