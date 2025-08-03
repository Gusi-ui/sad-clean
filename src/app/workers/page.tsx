'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import {
  createWorker,
  deleteWorker,
  getActiveWorkers,
  updateWorker,
} from '@/lib/workers-query';
import type { WorkerInsert, Worker as WorkerType, WorkerUpdate } from '@/types';
import { workerLogger } from '@/utils/logger';

// Usar el tipo de la base de datos
type Worker = WorkerType;

// Función helper para validar campos
const isValidField = (field: unknown): field is string =>
  typeof field === 'string' && field.length > 0;

/* eslint-disable react/jsx-closing-tag-location */
export default function WorkersPage() {
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

  const [workers, setWorkers] = useState<WorkerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingWorker, setSavingWorker] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingWorker, setEditingWorker] = useState<Partial<WorkerType>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados para modal de confirmación de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [deletingWorker, setDeletingWorker] = useState(false);

  // Estados para validaciones del formulario de crear trabajadora
  const [workerValidationErrors, setWorkerValidationErrors] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    dni: '',
  });

  // Funciones de validación para trabajadoras
  const validateWorkerName = (name: string): string => {
    if (name.trim().length === 0) {
      return 'El nombre es obligatorio';
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return '';
  };

  const validateWorkerSurname = (surname: string): string => {
    if (surname.trim().length === 0) {
      return 'Los apellidos son obligatorios';
    }
    if (surname.trim().length < 2) {
      return 'Los apellidos deben tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(surname.trim())) {
      return 'Los apellidos solo pueden contener letras y espacios';
    }
    return '';
  };

  const validateWorkerEmail = (email: string): string => {
    if (email.trim().length === 0) {
      return 'El email es obligatorio';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Formato de email inválido';
    }
    return '';
  };

  const validateWorkerPhone = (phone: string): string => {
    if (phone.trim().length === 0) {
      return ''; // Teléfono es opcional
    }
    const phoneRegex =
      /^[67]\d{8}$|^[89]\d{8}$|^\+34[67]\d{8}$|^\+34[89]\d{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
      return 'Formato de teléfono inválido (ej: 612345678 o +34612345678)';
    }
    return '';
  };

  const validateWorkerDni = (dni: string): string => {
    if (dni.trim().length === 0) {
      return 'El DNI es obligatorio';
    }

    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (!dniRegex.test(dni.trim())) {
      return 'Formato de DNI inválido (ej: 12345678A)';
    }

    // Validar letra del DNI
    const dniNumber = dni.trim().slice(0, 8);
    const dniLetter = dni.trim().slice(8).toUpperCase();
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';

    const expectedLetter = letters[parseInt(dniNumber) % 23];

    if (dniLetter !== expectedLetter) {
      return 'La letra del DNI no es correcta';
    }

    return '';
  };

  const validateWorkerForm = (): boolean => {
    const nameError = validateWorkerName(editingWorker.name ?? '');
    const surnameError = validateWorkerSurname(editingWorker.surname ?? '');
    const emailError = validateWorkerEmail(editingWorker.email ?? '');
    const phoneError = validateWorkerPhone(editingWorker.phone ?? '');
    const dniError = validateWorkerDni(editingWorker.dni ?? '');

    setWorkerValidationErrors({
      name: nameError,
      surname: surnameError,
      email: emailError,
      phone: phoneError,
      dni: dniError,
    });

    const isValid =
      nameError === '' &&
      surnameError === '' &&
      emailError === '' &&
      phoneError === '' &&
      dniError === '';

    return isValid;
  };

  // validateWorkerForm definida (sin log para evitar infinite re-renders)

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

  // Cargar trabajadoras desde Supabase
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const workersData = await getActiveWorkers();
        setWorkers(workersData);
      } catch {
        // Error loading workers
      } finally {
        setLoading(false);
      }
    };

    loadWorkers().catch(() => {
      // Error loading workers
    });
  }, []);

  // Filtrar trabajadoras basado en búsqueda y filtro
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.dni !== undefined &&
        worker.dni !== null &&
        worker.dni.length > 0 &&
        worker.dni.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' ||
      (worker.is_active === true && filterStatus === 'activa') ||
      (worker.is_active !== true && filterStatus === 'inactiva');

    return matchesSearch && matchesStatus;
  });

  // Estadísticas calculadas
  const stats = {
    total: workers.length,
    active: workers.filter((w) => w.is_active === true).length,
    inactive: workers.filter((w) => w.is_active !== true).length,
    vacation: 0, // No hay campo de vacaciones en el esquema actual
  };

  const handleAddWorker = () => {
    // Limpiar todos los estados antes de abrir el modal
    setEditingWorker({});
    setWorkerValidationErrors({
      name: '',
      surname: '',
      email: '',
      phone: '',
      dni: '',
    });
    setError(null);
    setSavingWorker(false);
    setIsAddModalOpen(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditingWorker({ ...worker });
    setIsEditModalOpen(true);
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };

  const handleSaveWorker = async () => {
    setSavingWorker(true);
    setError(null); // Limpiar errores previos

    try {
      if (isAddModalOpen) {
        // Validar formulario antes de enviar
        if (!validateWorkerForm()) {
          setError('Por favor, corrige los errores en el formulario.');
          setSavingWorker(false);
          return;
        }

        const workerData = {
          name: editingWorker.name?.trim() ?? '',
          surname: editingWorker.surname?.trim() ?? '',
          email: editingWorker.email?.trim() ?? '',
          phone: editingWorker.phone?.trim() ?? '',
          dni: editingWorker.dni?.trim() ?? '',
          worker_type: 'cuidadora', // Valor por defecto fijo
          is_active: editingWorker.is_active ?? true,
        } as WorkerInsert;

        // Debug: log the data being sent
        workerLogger.sendingData(workerData);

        const newWorker = await createWorker(workerData);
        workerLogger.created(newWorker);

        setWorkers([...workers, newWorker]);
        setIsAddModalOpen(false);
        setEditingWorker({});
        setWorkerValidationErrors({
          name: '',
          surname: '',
          email: '',
          phone: '',
          dni: '',
        });
        setSuccessMessage('Trabajadora creada con éxito.');
      } else if (isEditModalOpen && selectedWorker) {
        // Validar campos requeridos antes de actualizar
        if (
          !isValidField(editingWorker.name) ||
          !isValidField(editingWorker.surname) ||
          !isValidField(editingWorker.email) ||
          !isValidField(editingWorker.dni)
        ) {
          setError('Los campos marcados con * son obligatorios.');
          setSavingWorker(false);
          return;
        }

        // Construir el objeto de actualización dinámicamente
        const workerData: WorkerUpdate = {};
        if (isValidField(editingWorker.name)) {
          workerData.name = editingWorker.name;
        }
        if (isValidField(editingWorker.surname)) {
          workerData.surname = editingWorker.surname;
        }
        if (isValidField(editingWorker.email)) {
          workerData.email = editingWorker.email;
        }
        if (isValidField(editingWorker.phone)) {
          workerData.phone = editingWorker.phone;
        }
        if (isValidField(editingWorker.dni)) {
          workerData.dni = editingWorker.dni;
        }
        if (isValidField(editingWorker.worker_type)) {
          workerData.worker_type = editingWorker.worker_type;
        }
        if (
          editingWorker.is_active !== undefined &&
          editingWorker.is_active !== null
        ) {
          workerData.is_active = editingWorker.is_active;
        }

        const updatedWorker = await updateWorker(selectedWorker.id, workerData);
        if (updatedWorker) {
          const updatedWorkers = workers.map((w) => {
            if (w.id === selectedWorker.id) {
              return updatedWorker;
            }
            return w;
          });
          setWorkers(updatedWorkers);
          setIsEditModalOpen(false);
          setSuccessMessage('Trabajadora actualizada con éxito.');
        }
      }
      setEditingWorker({});
    } catch (err) {
      workerLogger.error(err);
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al guardar: ${errorMessage}`);
    } finally {
      setSavingWorker(false);
    }
  };

  // Función para abrir modal de confirmación de eliminación
  const handleDeleteWorkerConfirm = (worker: Worker) => {
    setWorkerToDelete(worker);
    setIsDeleteModalOpen(true);
  };

  // Función para cerrar modal de eliminación
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setWorkerToDelete(null);
    setDeletingWorker(false);
  };

  // Función para ejecutar la eliminación
  const handleDeleteWorker = async () => {
    if (workerToDelete === null) return;

    setDeletingWorker(true);
    try {
      await deleteWorker(workerToDelete.id);
      setWorkers(workers.filter((w) => w.id !== workerToDelete.id));
      setSuccessMessage('Trabajadora eliminada con éxito.');
      handleDeleteModalClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al eliminar: ${errorMessage}`);
      setDeletingWorker(false);
    }
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
                      id='mobileWorkersLogoGradient'
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
                    fill='url(#mobileWorkersLogoGradient)'
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
                  👥 Gestión de Trabajadoras
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administra el equipo de servicios asistenciales domiciliarios
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
              👥 Gestión de Trabajadoras
            </h1>
            <p className='text-gray-600 text-sm'>
              Administra el equipo de servicios asistenciales
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
                  <div className='text-2xl lg:text-3xl mr-3'>👥</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Total Trabajadoras
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.total}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('activa')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>✅</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Activas
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.active}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('inactiva')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏸️</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Inactivas
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.inactive}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('vacaciones')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>🏖️</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Vacaciones
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.vacation}
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
                className='pl-10 w-full'
                placeholder='Buscar por nombre, email o DNI...'
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
                onClick={handleAddWorker}
              >
                ➕ Agregar Trabajadora
              </Button>

              {/* Filter Status */}
              <select
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilterStatus(e.target.value)
                }
              >
                <option value='all'>Todos los estados</option>
                <option value='activa'>Activas</option>
                <option value='inactiva'>Inactivas</option>
                <option value='vacaciones'>Vacaciones</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando trabajadoras...</p>
            </div>
          )}

          {/* Workers List - Mobile Cards */}
          {!loading && (
            <div className='md:hidden space-y-4'>
              {filteredWorkers.map((worker) => (
                <Card
                  key={worker.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  {/* Header con Avatar y Nombre */}
                  <div className='flex items-center space-x-3 mb-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md'>
                      <span className='text-sm font-bold text-white'>
                        {worker.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-gray-900 text-lg'>
                        {worker.name} {worker.surname}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {worker.worker_type}
                      </p>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className='space-y-2 mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>📧</span>
                      <span className='text-sm text-gray-700'>
                        {worker.email}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>📱</span>
                      <span className='text-sm text-gray-700'>
                        {worker.phone}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>🆔</span>
                      <span className='text-sm text-gray-700'>
                        DNI: {worker.dni}
                      </span>
                    </div>
                  </div>

                  {/* Estado y Acciones */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          worker.is_active === true
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {worker.is_active === true ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className='flex items-center space-x-3'>
                      <button
                        className='text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium'
                        onClick={() => handleViewWorker(worker)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 transition-colors text-sm font-medium'
                        onClick={() => handleEditWorker(worker)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className='text-red-600 hover:text-red-900 transition-colors text-sm font-medium'
                        onClick={() => handleDeleteWorkerConfirm(worker)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Workers List - Tablet Hybrid Layout */}
          {!loading && (
            <div className='hidden md:block lg:hidden space-y-3'>
              {filteredWorkers.map((worker) => (
                <Card
                  key={worker.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  <div className='flex items-center gap-6'>
                    {/* Avatar y información principal */}
                    <div className='flex items-center space-x-4 flex-1'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                        <span className='text-base font-bold text-white'>
                          {worker.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 mb-1'>
                          {worker.name} {worker.surname}
                        </h3>
                        <p className='text-sm text-gray-600 mb-1'>
                          {worker.worker_type}
                        </p>
                        <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600'>
                          <span>📧 {worker.email}</span>
                          <span>📱 {worker.phone}</span>
                          <span>🆔 {worker.dni}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className='flex flex-col items-center gap-3 min-w-0'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          worker.is_active === true
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {worker.is_active === true ? 'Activa' : 'Inactiva'}
                      </span>

                      <div className='flex space-x-2'>
                        <button
                          className='px-3 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleViewWorker(worker)}
                        >
                          👁️ Ver
                        </button>
                        <button
                          className='px-3 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleEditWorker(worker)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className='px-3 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleDeleteWorkerConfirm(worker)}
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

          {/* Workers Table - Desktop */}
          {!loading && (
            <div className='hidden lg:block'>
              <Card className='overflow-hidden shadow-lg'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                      <tr>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Trabajadora
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Email
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Teléfono
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Estado
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredWorkers.map((worker) => (
                        <tr
                          key={worker.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-4 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md'>
                                <span className='text-sm font-bold text-white'>
                                  {worker.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className='text-sm font-medium text-gray-900'>
                                  {worker.name} {worker.surname}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  DNI: {worker.dni}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {worker.email}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {worker.phone}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                worker.is_active === true
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                              }`}
                            >
                              {worker.is_active === true
                                ? 'Activa'
                                : 'Inactiva'}
                            </span>
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                            <button
                              className='text-blue-600 hover:text-blue-900 transition-colors'
                              onClick={() => handleViewWorker(worker)}
                            >
                              👁️ Ver
                            </button>
                            <button
                              className='text-indigo-600 hover:text-indigo-900 transition-colors'
                              onClick={() => handleEditWorker(worker)}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              className='text-red-600 hover:text-red-900 transition-colors'
                              onClick={() => handleDeleteWorkerConfirm(worker)}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* No Results */}
          {filteredWorkers.length === 0 && (
            <Card className='p-8 text-center'>
              <div className='text-gray-500'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No se encontraron trabajadoras
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda.'
                    : 'No hay trabajadoras registradas.'}
                </p>
              </div>
            </Card>
          )}
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

        {/* Add Worker Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingWorker({});
            setWorkerValidationErrors({
              name: '',
              surname: '',
              email: '',
              phone: '',
              dni: '',
            });
            setError(null);
            setSavingWorker(false);
          }}
          title='👷‍♀️ Agregar Nueva Trabajadora'
          size='lg'
        >
          <div className='space-y-4 md:space-y-6'>
            {/* Banner informativo */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4'>
              <div className='flex items-start space-x-2'>
                <span className='text-blue-600 text-lg md:text-xl flex-shrink-0'>
                  ℹ️
                </span>
                <div>
                  <p className='text-sm md:text-base text-blue-800 font-medium'>
                    Nueva Trabajadora del Sistema
                  </p>
                  <p className='text-xs md:text-sm text-blue-700 mt-1'>
                    Las trabajadoras pueden gestionar servicios asistenciales
                    domiciliarios y registrar sus actividades.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario responsive */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
              {/* Nombre */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>👤</span>
                  <span>Nombre *</span>
                </label>
                <Input
                  className={`w-full ${
                    workerValidationErrors.name !== ''
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='María Carmen'
                  value={editingWorker.name ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setEditingWorker({
                      ...editingWorker,
                      name: newValue,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Validar solo cuando se pierde el foco (más eficiente)
                    setWorkerValidationErrors((prev) => ({
                      ...prev,
                      name: validateWorkerName(e.target.value),
                    }));
                  }}
                />
                {workerValidationErrors.name !== '' && (
                  <p className='text-xs md:text-sm text-red-600 flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>{workerValidationErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Apellidos */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>👤</span>
                  <span>Apellidos *</span>
                </label>
                <Input
                  className={`w-full ${
                    workerValidationErrors.surname !== ''
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='García López'
                  value={editingWorker.surname ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setEditingWorker({
                      ...editingWorker,
                      surname: newValue,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Validar solo cuando se pierde el foco (más eficiente)
                    setWorkerValidationErrors((prev) => ({
                      ...prev,
                      surname: validateWorkerSurname(e.target.value),
                    }));
                  }}
                />
                {workerValidationErrors.surname !== '' && (
                  <p className='text-xs md:text-sm text-red-600 flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>{workerValidationErrors.surname}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>📧</span>
                  <span>Email *</span>
                </label>
                <Input
                  className={`w-full ${
                    workerValidationErrors.email !== ''
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='maria.garcia@email.com'
                  type='email'
                  value={editingWorker.email ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setEditingWorker({
                      ...editingWorker,
                      email: newValue,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Validar solo cuando se pierde el foco (más eficiente)
                    setWorkerValidationErrors((prev) => ({
                      ...prev,
                      email: validateWorkerEmail(e.target.value),
                    }));
                  }}
                />
                {workerValidationErrors.email !== '' && (
                  <p className='text-xs md:text-sm text-red-600 flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>{workerValidationErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>📱</span>
                  <span>Teléfono</span>
                </label>
                <Input
                  className={`w-full ${
                    workerValidationErrors.phone !== ''
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='612345678 o +34612345678'
                  type='tel'
                  value={editingWorker.phone ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setEditingWorker({
                      ...editingWorker,
                      phone: newValue,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Validar solo cuando se pierde el foco (más eficiente)
                    setWorkerValidationErrors((prev) => ({
                      ...prev,
                      phone: validateWorkerPhone(e.target.value),
                    }));
                  }}
                />
                {workerValidationErrors.phone !== '' && (
                  <p className='text-xs md:text-sm text-red-600 flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>{workerValidationErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* DNI */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>🆔</span>
                  <span>DNI *</span>
                </label>
                <Input
                  className={`w-full ${
                    workerValidationErrors.dni !== ''
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='12345678A'
                  type='text'
                  value={editingWorker.dni ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value.toUpperCase();
                    setEditingWorker({
                      ...editingWorker,
                      dni: newValue,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Validar solo cuando se pierde el foco (más eficiente)
                    setWorkerValidationErrors((prev) => ({
                      ...prev,
                      dni: validateWorkerDni(e.target.value),
                    }));
                  }}
                />
                {workerValidationErrors.dni !== '' && (
                  <p className='text-xs md:text-sm text-red-600 flex items-center space-x-1'>
                    <span>⚠️</span>
                    <span>{workerValidationErrors.dni}</span>
                  </p>
                )}
              </div>

              {/* Estado */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700'>
                  <span className='text-blue-600'>⚡</span>
                  <span>Estado</span>
                </label>
                <select
                  className='w-full px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base'
                  value={
                    editingWorker.is_active === true
                      ? 'activa'
                      : editingWorker.is_active === false
                        ? 'inactiva'
                        : 'activa'
                  }
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      is_active: e.target.value === 'activa',
                    })
                  }
                >
                  <option value='activa'>✅ Activa</option>
                  <option value='inactiva'>❌ Inactiva</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className='flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 pt-4 md:pt-6'>
              <Button
                variant='outline'
                className='w-full md:w-auto py-3 md:py-2 text-sm md:text-base'
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWorker({});
                  setWorkerValidationErrors({
                    name: '',
                    surname: '',
                    email: '',
                    phone: '',
                    dni: '',
                  });
                  setError(null);
                  setSavingWorker(false);
                }}
              >
                ❌ Cancelar
              </Button>
              <Button
                className={`w-full md:w-auto py-3 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white ${
                  savingWorker ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  handleSaveWorker().catch(() => {
                    // Error saving worker
                  });
                }}
                disabled={
                  savingWorker ||
                  workerValidationErrors.name !== '' ||
                  workerValidationErrors.surname !== '' ||
                  workerValidationErrors.email !== '' ||
                  workerValidationErrors.phone !== '' ||
                  workerValidationErrors.dni !== '' ||
                  (editingWorker.name ?? '').trim() === '' ||
                  (editingWorker.surname ?? '').trim() === '' ||
                  (editingWorker.email ?? '').trim() === '' ||
                  (editingWorker.dni ?? '').trim() === ''
                }
              >
                {savingWorker ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  '👷‍♀️ Crear Trabajadora'
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Worker Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title='Editar Trabajadora'
          size='lg'
        >
          <div className='space-y-6'>
            {/* Encabezado con avatar y nombre */}
            <div className='flex flex-col items-center mb-2'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-2'>
                <span className='text-2xl font-bold text-white'>
                  {editingWorker.name !== undefined &&
                  editingWorker.name !== null &&
                  editingWorker.name.trim().length > 0
                    ? editingWorker.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : '?'}
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {editingWorker.name ?? 'Nueva trabajadora'}
              </h3>
              {editingWorker.is_active !== undefined &&
                editingWorker.is_active !== null && (
                  <span
                    className={`mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      editingWorker.is_active === true
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {editingWorker.is_active === true ? 'Activa' : 'Inactiva'}
                  </span>
                )}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre Completo *
                </label>
                <Input
                  className='w-full'
                  value={editingWorker.name ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEditingWorker({
                      ...editingWorker,
                      name: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <Input
                  className='w-full'
                  type='email'
                  value={editingWorker.email ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEditingWorker({
                      ...editingWorker,
                      email: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <Input
                  className='w-full'
                  type='tel'
                  value={editingWorker.phone ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  DNI *
                </label>
                <Input
                  className='w-full'
                  value={editingWorker.dni ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      dni: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo de Trabajadora
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={editingWorker.worker_type ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      worker_type: e.target.value as
                        | 'cuidadora'
                        | 'auxiliar'
                        | 'enfermera',
                    })
                  }
                >
                  <option value=''>Seleccionar tipo</option>
                  <option value='cuidadora'>Cuidadora</option>
                  <option value='auxiliar'>Auxiliar</option>
                  <option value='enfermera'>Enfermera</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={
                    editingWorker.is_active === true
                      ? 'activa'
                      : editingWorker.is_active === false
                        ? 'inactiva'
                        : ''
                  }
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      is_active: e.target.value === 'activa',
                    })
                  }
                >
                  <option value=''>Seleccionar estado</option>
                  <option value='activa'>Activa</option>
                  <option value='inactiva'>Inactiva</option>
                </select>
              </div>
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingWorker({});
                  setError(null);
                  setSavingWorker(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                className='bg-blue-600 hover:bg-blue-700 text-white'
                onClick={() => {
                  handleSaveWorker().catch(() => {
                    // Error saving worker
                  });
                }}
                disabled={
                  !isValidField(editingWorker.name) ||
                  !isValidField(editingWorker.email) ||
                  !isValidField(editingWorker.dni)
                }
              >
                Actualizar Trabajadora
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Worker Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title='Detalles de la Trabajadora'
          size='md'
        >
          <div className='space-y-6'>
            <div className='flex flex-col items-center mb-2'>
              <div className='w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-2'>
                <span className='text-3xl font-bold text-white'>
                  {selectedWorker && isValidField(selectedWorker.name)
                    ? selectedWorker.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : '?'}
                </span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {selectedWorker?.name ?? 'N/A'}
              </h3>
              {selectedWorker?.is_active !== undefined &&
                selectedWorker.is_active !== null && (
                  <span
                    className={`mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedWorker.is_active === true
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {selectedWorker.is_active === true ? 'Activa' : 'Inactiva'}
                  </span>
                )}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-gray-400 text-lg'>📧</span>
                <span className='text-sm text-gray-700'>
                  {selectedWorker?.email}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-gray-400 text-lg'>📱</span>
                <span className='text-sm text-gray-700'>
                  {selectedWorker?.phone}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-gray-400 text-lg'>🆔</span>
                <span className='text-sm text-gray-700'>
                  DNI: {selectedWorker?.dni}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-gray-400 text-lg'>💼</span>
                <span className='text-sm text-gray-700'>
                  {selectedWorker?.worker_type}
                </span>
              </div>
            </div>
            <div className='flex justify-center pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de Confirmación de Eliminación */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          title='Confirmar Eliminación'
          size='md'
        >
          <div className='space-y-6'>
            {/* Mensaje de advertencia */}
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <h3 className='ml-3 text-sm font-medium text-red-800'>
                  ⚠️ Acción Irreversible
                </h3>
              </div>
              <p className='text-sm text-red-700'>
                Esta acción no se puede deshacer. La trabajadora será eliminada
                permanentemente del sistema.
              </p>
            </div>

            {/* Información de la trabajadora */}
            {workerToDelete && (
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-lg font-bold text-white'>
                      {workerToDelete.name?.charAt(0) ?? '?'}
                      {workerToDelete.surname?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-gray-900'>
                      {workerToDelete.name} {workerToDelete.surname}
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {workerToDelete.email}
                    </p>
                    <p className='text-xs text-gray-500'>
                      DNI: {workerToDelete.dni}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pregunta de confirmación */}
            <div className='text-center'>
              <p className='text-gray-900 font-medium mb-2'>
                ¿Estás seguro de que deseas eliminar a esta trabajadora?
              </p>
              <p className='text-sm text-gray-600'>
                Esta acción eliminará permanentemente todos los datos asociados.
              </p>
            </div>

            {/* Botones de acción */}
            <div className='flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3'>
              <Button
                variant='outline'
                onClick={handleDeleteModalClose}
                disabled={deletingWorker}
                className='w-full sm:w-auto'
              >
                Cancelar
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  handleDeleteWorker().catch((deleteError) => {
                    // eslint-disable-next-line no-console
                    console.error(
                      'Error al eliminar trabajadora:',
                      deleteError
                    );
                  });
                }}
                disabled={deletingWorker}
                className='w-full sm:w-auto'
              >
                {deletingWorker ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  '🗑️ Eliminar Definitivamente'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
