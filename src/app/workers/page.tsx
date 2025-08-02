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

// Usar el tipo de la base de datos
type Worker = WorkerType;

// Función helper para validar campos
const isValidField = (field: unknown): field is string =>
  typeof field === 'string' && field.length > 0;

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingWorker, setEditingWorker] = useState<Partial<WorkerType>>({});
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
    setEditingWorker({});
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
    try {
      if (isAddModalOpen) {
        // Agregar nueva trabajadora
        if (
          editingWorker.name === undefined ||
          editingWorker.name === null ||
          editingWorker.name.length === 0 ||
          editingWorker.surname === undefined ||
          editingWorker.surname === null ||
          editingWorker.surname.length === 0 ||
          editingWorker.email === undefined ||
          editingWorker.email === null ||
          editingWorker.email.length === 0 ||
          editingWorker.dni === undefined ||
          editingWorker.dni === null ||
          editingWorker.dni.length === 0
        ) {
          // Campos requeridos faltantes
          return;
        }

        const name = editingWorker.name;
        const surname = editingWorker.surname;
        const email = editingWorker.email;
        const dni = editingWorker.dni;

        const workerData = {
          name,
          surname,
          email,
          phone: editingWorker.phone ?? '',
          dni,
          worker_type:
            (editingWorker.worker_type as
              | 'cuidadora'
              | 'auxiliar'
              | 'enfermera') ?? 'cuidadora',
          is_active: editingWorker.is_active ?? true,
        } as WorkerInsert;

        const newWorker = await createWorker(workerData);
        setWorkers([...workers, newWorker]);
        setIsAddModalOpen(false);
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
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al guardar: ${errorMessage}`);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar a esta trabajadora? Esta acción no se puede deshacer.'
    );
    if (confirmed) {
      try {
        await deleteWorker(workerId);
        setWorkers(workers.filter((w) => w.id !== workerId));
        setSuccessMessage('Trabajadora eliminada con éxito.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
        setError(`Error al eliminar: ${errorMessage}`);
      }
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
            <div className='lg:hidden space-y-4'>
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
                        onClick={() => {
                          handleDeleteWorker(worker.id).catch((deleteError) => {
                            // eslint-disable-next-line no-console
                            console.error(
                              'Error deleting worker:',
                              deleteError
                            );
                          });
                        }}
                      >
                        🗑️ Eliminar
                      </button>
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
                              onClick={() => {
                                handleDeleteWorker(worker.id).catch(
                                  (deleteError) => {
                                    // eslint-disable-next-line no-console
                                    console.error(
                                      'Error deleting worker:',
                                      deleteError
                                    );
                                  }
                                );
                              }}
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
          onClose={() => setIsAddModalOpen(false)}
          title='Agregar Nueva Trabajadora'
          size='lg'
        >
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre *
                </label>
                <Input
                  className='w-full'
                  placeholder='María'
                  value={editingWorker.name ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Apellidos *
                </label>
                <Input
                  className='w-full'
                  placeholder='García López'
                  value={editingWorker.surname ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      surname: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <Input
                  className='w-full'
                  placeholder='maria.garcia@email.com'
                  type='email'
                  value={editingWorker.email ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingWorker({
                      ...editingWorker,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <Input
                  className='w-full'
                  placeholder='+34 600 123 456'
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
                  placeholder='12345678A'
                  type='text'
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
                  setIsAddModalOpen(false);
                  setEditingWorker({});
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
                  !isValidField(editingWorker.surname) ||
                  !isValidField(editingWorker.email) ||
                  !isValidField(editingWorker.dni)
                }
              >
                Guardar Trabajadora
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
                  editingWorker.name.length > 0
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
      </div>
    </ProtectedRoute>
  );
}
