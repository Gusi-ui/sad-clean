'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: string;
  workerName: string;
  userName: string;
  hours: number;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'regular' | 'urgent' | 'overtime';
}

interface WeekStats {
  totalAssignments: number;
  totalHours: number;
  activeWorkers: number;
  pendingAssignments: number;
}

export default function PlanningPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAssignmentModal, setShowAssignmentModal] =
    useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [stats, setStats] = useState<WeekStats>({
    totalAssignments: 0,
    totalHours: 0,
    activeWorkers: 0,
    pendingAssignments: 0,
  });

  const dashboardUrl =
    user?.user_metadata?.['role'] === 'super_admin'
      ? '/super-dashboard'
      : '/dashboard';

  // Generar fechas de la semana actual
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Lunes

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  // Navegar entre semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // Formatear fecha
  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });

  // Formatear día de la semana
  const formatWeekday = (date: Date) =>
    date.toLocaleDateString('es-ES', { weekday: 'long' });

  // Obtener asignaciones para una fecha específica
  const getAssignmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return assignments.filter((assignment) => assignment.date === dateString);
  };

  // Obtener color según el tipo de asignación
  const getAssignmentColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'overtime':
        return 'bg-yellow-50 border-yellow-500 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-900';
    }
  };

  // Obtener estado de la asignación
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // Cargar datos
  useEffect(() => {
    const loadPlanningData = async () => {
      setLoading(true);
      try {
        // Implementar carga real de datos
        // Por ahora, simular carga
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAssignments([]); // Sin datos de ejemplo
        setStats({
          totalAssignments: 0,
          totalHours: 0,
          activeWorkers: 0,
          pendingAssignments: 0,
        });
      } catch {
        // Error loading planning data
      } finally {
        setLoading(false);
      }
    };

    loadPlanningData().catch(() => {
      // Handle error silently
    });
  }, [currentWeek]);

  const handleAddAssignment = () => {
    setShowAddModal(true);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowAssignmentModal(false);
    setSelectedAssignment(null);
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
                      id='mobilePlanningLogoGradient'
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
                    fill='url(#mobilePlanningLogoGradient)'
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
                  📅 Planificación Semanal
                </h1>
                <p className='text-gray-600 text-lg'>
                  Gestiona la planificación de servicios SAD
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
              📅 Planificación Semanal
            </h1>
            <p className='text-gray-600 text-sm'>
              Gestiona la planificación de servicios SAD
            </p>
          </div>

          {/* Week Selector */}
          <div className='mb-6'>
            <Card className='p-4 lg:p-6'>
              <div className='flex flex-col lg:flex-row items-center justify-between gap-4'>
                <div className='flex items-center space-x-2 lg:space-x-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={goToPreviousWeek}
                    className='text-xs lg:text-sm'
                  >
                    ← Semana Anterior
                  </Button>
                  <h2 className='text-base lg:text-lg font-semibold text-gray-900 text-center'>
                    Semana del {formatDate(weekDates[0] ?? new Date())} -{' '}
                    {formatDate(weekDates[6] ?? new Date())}
                  </h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={goToNextWeek}
                    className='text-xs lg:text-sm'
                  >
                    Semana Siguiente →
                  </Button>
                </div>
                <div className='flex space-x-2'>
                  <Button
                    className='bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm'
                    onClick={handleAddAssignment}
                  >
                    ➕ Nueva Asignación
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs lg:text-sm'
                  >
                    📅 Ver Calendario
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando planificación...</p>
            </div>
          )}

          {/* Weekly Schedule - Mobile Layout */}
          {!loading && (
            <div className='lg:hidden space-y-4 mb-8'>
              {weekDates.map((date, index) => {
                const dayAssignments = getAssignmentsForDate(date);
                return (
                  <Card
                    key={index}
                    className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    <div className='text-center mb-4'>
                      <h3 className='font-semibold text-gray-900 text-lg'>
                        {formatWeekday(date)}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {formatDate(date)}
                      </p>
                    </div>

                    {dayAssignments.length > 0 ? (
                      <div className='space-y-3'>
                        {dayAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={`p-3 rounded-lg border-l-4 ${getAssignmentColor(assignment.type)} cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={() => handleViewAssignment(assignment)}
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <p className='text-sm font-medium'>
                                {assignment.workerName}
                              </p>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                              >
                                {assignment.status === 'confirmed'
                                  ? 'Confirmado'
                                  : assignment.status === 'completed'
                                    ? 'Completado'
                                    : assignment.status === 'cancelled'
                                      ? 'Cancelado'
                                      : 'Pendiente'}
                              </span>
                            </div>
                            <p className='text-xs text-gray-700'>
                              {assignment.userName} - {assignment.hours}h
                            </p>
                            {assignment.type === 'urgent' && (
                              <span className='inline-block mt-1 text-xs text-red-700 font-medium'>
                                🚨 Urgente
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-6'>
                        <div className='text-4xl mb-2'>📅</div>
                        <p className='text-sm text-gray-500'>
                          Sin asignaciones
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Weekly Schedule - Desktop Layout */}
          {!loading && (
            <div className='hidden lg:grid grid-cols-7 gap-4 mb-8'>
              {weekDates.map((date, index) => {
                const dayAssignments = getAssignmentsForDate(date);
                return (
                  <Card key={index} className='p-4'>
                    <div className='text-center mb-4'>
                      <h3 className='font-semibold text-gray-900'>
                        {formatWeekday(date)}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {formatDate(date)}
                      </p>
                    </div>

                    {dayAssignments.length > 0 ? (
                      <div className='space-y-2'>
                        {dayAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={`p-2 rounded border-l-4 ${getAssignmentColor(assignment.type)} cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={() => handleViewAssignment(assignment)}
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <p className='text-xs font-medium truncate'>
                                {assignment.workerName}
                              </p>
                              <span
                                className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                              >
                                {assignment.status === 'confirmed'
                                  ? '✓'
                                  : assignment.status === 'completed'
                                    ? '✓'
                                    : assignment.status === 'cancelled'
                                      ? '✗'
                                      : '⏳'}
                              </span>
                            </div>
                            <p className='text-xs text-gray-700 truncate'>
                              {assignment.userName} - {assignment.hours}h
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-4'>
                        <div className='text-2xl mb-1'>📅</div>
                        <p className='text-xs text-gray-500'>
                          Sin asignaciones
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary Stats */}
          {!loading && (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>👥</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Trabajadores Activos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.activeWorkers}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏰</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Horas Programadas
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalHours}h
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>📋</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Asignaciones
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalAssignments}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏳</div>
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
          )}

          {/* Empty State */}
          {!loading && assignments.length === 0 && (
            <Card className='p-8 text-center'>
              <div className='text-6xl mb-4'>📅</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay asignaciones programadas
              </h3>
              <p className='text-gray-600 mb-4'>
                Comienza creando tu primera asignación para esta semana
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

        {/* View Assignment Modal */}
        <Modal
          isOpen={showAssignmentModal}
          onClose={handleCloseModals}
          title='Detalles de Asignación'
        >
          {selectedAssignment && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
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
                  <p className='text-sm font-medium text-gray-600'>Horas</p>
                  <p className='text-base text-gray-900'>
                    {selectedAssignment.hours}h
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Estado</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAssignment.status)}`}
                  >
                    {selectedAssignment.status === 'confirmed'
                      ? 'Confirmado'
                      : selectedAssignment.status === 'completed'
                        ? 'Completado'
                        : selectedAssignment.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Pendiente'}
                  </span>
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
