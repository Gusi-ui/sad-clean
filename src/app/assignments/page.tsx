'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: string;
  assignmentCode: string;
  workerName: string;
  workerId: string;
  userName: string;
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  type: 'regular' | 'urgent' | 'overtime';
  schedule: string;
  hours: number;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
}

interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  pendingAssignments: number;
  newThisWeek: number;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAssignmentModal, setShowAssignmentModal] =
    useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    activeAssignments: 0,
    pendingAssignments: 0,
    newThisWeek: 0,
  });

  const dashboardUrl =
    user?.user_metadata?.['role'] === 'super_admin'
      ? '/super-dashboard'
      : '/dashboard';

  // Filtrar asignaciones
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignmentCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || assignment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Obtener color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // Obtener color según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'overtime':
        return 'bg-yellow-50 border-yellow-500 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-900';
    }
  };

  // Cargar datos
  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        // Implementar carga real de datos
        // Por ahora, simular carga
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAssignments([]); // Sin datos de ejemplo
        setStats({
          totalAssignments: 0,
          activeAssignments: 0,
          pendingAssignments: 0,
          newThisWeek: 0,
        });
      } catch {
        // Error loading assignments data
      } finally {
        setLoading(false);
      }
    };

    loadAssignments().catch(() => {
      // Handle error silently
    });
  }, []);

  const handleAddAssignment = () => {
    setShowAddModal(true);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowAssignmentModal(false);
    setSelectedAssignment(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <ProtectedRoute>
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
                      id='mobileAssignmentsLogoGradient'
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
                    fill='url(#mobileAssignmentsLogoGradient)'
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
                  📋 Gestión de Asignaciones
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administra las asignaciones entre trabajadoras y usuarios
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
              📋 Gestión de Asignaciones
            </h1>
            <p className='text-gray-600 text-sm'>
              Administra las asignaciones entre trabajadoras y usuarios
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div
              onClick={() => setFilterStatus('all')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>📋</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Total Asignaciones
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalAssignments}
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
                      Activas
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.activeAssignments}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div
              onClick={() => setFilterStatus('pending')}
              className='cursor-pointer'
            >
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏰</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Pendientes
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.pendingAssignments}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div className='cursor-pointer'>
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>🆕</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Nuevas Esta Semana
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.newThisWeek}
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
                placeholder='Buscar por trabajadora, usuario o código...'
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
                onClick={handleAddAssignment}
              >
                ➕ Nueva Asignación
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
                <option value='active'>Activas</option>
                <option value='pending'>Pendientes</option>
                <option value='completed'>Completadas</option>
                <option value='cancelled'>Canceladas</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando asignaciones...</p>
            </div>
          )}

          {/* Assignments List - Mobile Cards */}
          {!loading && (
            <div className='md:hidden space-y-4'>
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  {/* Header con Código y Estado */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md'>
                        <span className='text-sm font-bold text-white'>
                          {assignment.assignmentCode.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className='font-medium text-gray-900 text-lg'>
                          {assignment.assignmentCode}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {assignment.type === 'urgent'
                            ? 'Urgente'
                            : assignment.type === 'overtime'
                              ? 'Extra'
                              : 'Regular'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                    >
                      {assignment.status === 'active'
                        ? 'Activa'
                        : assignment.status === 'completed'
                          ? 'Completada'
                          : assignment.status === 'cancelled'
                            ? 'Cancelada'
                            : 'Pendiente'}
                    </span>
                  </div>

                  {/* Información de Trabajadora y Usuario */}
                  <div className='space-y-3 mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>👩‍⚕️</span>
                      <span className='text-sm text-gray-700'>
                        {assignment.workerName}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>👤</span>
                      <span className='text-sm text-gray-700'>
                        {assignment.userName}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-400 text-sm'>⏰</span>
                      <span className='text-sm text-gray-700'>
                        {assignment.schedule} - {assignment.hours}h
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(assignment.type)}`}
                      >
                        {assignment.type === 'urgent'
                          ? '🚨 Urgente'
                          : assignment.type === 'overtime'
                            ? '⏰ Extra'
                            : '📋 Regular'}
                      </span>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <button
                        className='text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium'
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 transition-colors text-sm font-medium'
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Assignments List - Tablet Hybrid Layout */}
          {!loading && (
            <div className='hidden md:block lg:hidden space-y-3'>
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  <div className='flex items-center gap-6'>
                    {/* Avatar y información principal */}
                    <div className='flex items-center space-x-4 flex-1'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                        <span className='text-base font-bold text-white'>
                          {assignment.assignmentCode.slice(0, 2)}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 mb-1'>
                          {assignment.assignmentCode}
                        </h3>
                        <p className='text-sm text-gray-600 mb-1'>
                          {assignment.type === 'urgent'
                            ? 'Urgente'
                            : assignment.type === 'overtime'
                              ? 'Extra'
                              : 'Regular'}
                        </p>
                        <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600'>
                          <span>👩‍⚕️ {assignment.workerName}</span>
                          <span>👤 {assignment.userName}</span>
                          <span>⏰ {assignment.schedule}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className='flex flex-col items-center gap-3 min-w-0'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(assignment.status)}`}
                      >
                        {assignment.status === 'active'
                          ? 'Activa'
                          : assignment.status === 'completed'
                            ? 'Completada'
                            : assignment.status === 'cancelled'
                              ? 'Cancelada'
                              : 'Pendiente'}
                      </span>

                      <div className='flex space-x-2'>
                        <button
                          className='px-3 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          👁️ Ver
                        </button>
                        <button
                          className='px-3 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors whitespace-nowrap'
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Assignments List - Desktop Layout */}
          {!loading && (
            <div className='hidden lg:block'>
              <Card className='overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Lista de Asignaciones
                  </h3>
                </div>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Asignación
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Trabajadora
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Usuario
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Estado
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Horario
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredAssignments.map((assignment) => (
                        <tr key={assignment.id} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                              {assignment.assignmentCode}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {assignment.type === 'urgent'
                                ? 'Urgente'
                                : assignment.type === 'overtime'
                                  ? 'Extra'
                                  : 'Regular'}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='flex-shrink-0 h-8 w-8'>
                                <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                                  <span className='text-xs font-medium text-blue-600'>
                                    {assignment.workerName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className='ml-3'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {assignment.workerName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='flex-shrink-0 h-8 w-8'>
                                <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
                                  <span className='text-xs font-medium text-green-600'>
                                    {assignment.userName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className='ml-3'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {assignment.userName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                            >
                              {assignment.status === 'active'
                                ? 'Activa'
                                : assignment.status === 'completed'
                                  ? 'Completada'
                                  : assignment.status === 'cancelled'
                                    ? 'Cancelada'
                                    : 'Pendiente'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {assignment.schedule}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='mr-2'
                              onClick={() => handleEditAssignment(assignment)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAssignments.length === 0 && (
            <Card className='p-8 text-center'>
              <div className='text-6xl mb-4'>📋</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay asignaciones
              </h3>
              <p className='text-gray-600 mb-4'>
                {searchTerm
                  ? 'No se encontraron asignaciones con ese criterio de búsqueda'
                  : 'Aún no hay asignaciones registradas en el sistema'}
              </p>
              <Button
                onClick={handleAddAssignment}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                ➕ Crear Primera Asignación
              </Button>
            </Card>
          )}
        </div>

        {/* Add Assignment Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={handleCloseModals}
          title='Nueva Asignación'
        >
          <div className='space-y-4'>
            <p className='text-gray-600'>
              Funcionalidad de creación de asignaciones en desarrollo...
            </p>
            <div className='flex justify-end space-x-3'>
              <Button variant='outline' onClick={handleCloseModals}>
                Cancelar
              </Button>
              <Button onClick={handleCloseModals}>Crear Asignación</Button>
            </div>
          </div>
        </Modal>

        {/* View/Edit Assignment Modal */}
        <Modal
          isOpen={showAssignmentModal}
          onClose={handleCloseModals}
          title='Detalles de Asignación'
        >
          {selectedAssignment && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Código</p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.assignmentCode}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Estado</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAssignment.status)}`}
                  >
                    {selectedAssignment.status === 'active'
                      ? 'Activa'
                      : selectedAssignment.status === 'completed'
                        ? 'Completada'
                        : selectedAssignment.status === 'cancelled'
                          ? 'Cancelada'
                          : 'Pendiente'}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Trabajadora
                  </p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.workerName}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Usuario</p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.userName}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Horario</p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.schedule}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Horas</p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.hours}h
                  </p>
                </div>
              </div>
              <div className='flex justify-end space-x-3'>
                <Button variant='outline' onClick={handleCloseModals}>
                  Cerrar
                </Button>
                <Button>Editar Asignación</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
