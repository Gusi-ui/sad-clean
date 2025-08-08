'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import AssignmentForm, {
  type AssignmentFormData,
} from '@/components/assignments/AssignmentForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useDashboardUrl } from '@/hooks/useDashboardUrl';
import { supabase } from '@/lib/database';
import { logger } from '@/utils/logger';

interface Assignment {
  id: string;
  user_id: string;
  worker_id: string;
  assignment_type: string;
  monthly_hours: number;
  schedule: Record<string, unknown>;
  start_date: string;
  end_date?: string | null;
  status: string;
  priority: number;
  notes: string;
  created_at: string;
  user?: { name: string; surname: string };
  worker?: { name: string; surname: string };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );

  // Función helper para parsear el schedule de forma segura
  const parseSchedule = (schedule: unknown) => {
    if (typeof schedule === 'string') {
      try {
        return JSON.parse(schedule) as Record<string, unknown>;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing schedule JSON:', error);
        // Retornar un schedule por defecto si el parsing falla
        return {
          monday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          tuesday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          wednesday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          thursday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          friday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          saturday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
          sunday: {
            enabled: false,
            timeSlots: [{ id: '1', start: '08:00', end: '16:00' }],
          },
        };
      }
    }
    return schedule;
  };

  // Tipos auxiliares para la configuración de festivos embebida en schedule
  type HolidayTimeSlot = { id: string; start: string; end: string };
  type HolidayConfig = {
    has_holiday_service: boolean;
    holiday_timeSlots: HolidayTimeSlot[];
  };

  type ScheduleWithHoliday = AssignmentFormData['schedule'] & {
    holiday_config?: HolidayConfig;
  };

  // Función para calcular horas semanales basada en el schedule, incluyendo festivos si aplica
  const calculateWeeklyHours = (
    schedule: AssignmentFormData['schedule'] | ScheduleWithHoliday
  ) => {
    let totalHours = 0;

    // Calcular horas de días laborables (lunes a viernes)
    const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    workDays.forEach((day) => {
      const daySchedule = schedule[day as keyof typeof schedule];
      if (daySchedule.enabled) {
        daySchedule.timeSlots.forEach((slot) => {
          const start = new Date(`2000-01-01T${slot.start}`);
          const end = new Date(`2000-01-01T${slot.end}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
        });
      }
    });

    // Incluir horas de festivos/fines de semana si está activo
    const maybeWithHoliday = schedule as ScheduleWithHoliday;
    if (maybeWithHoliday.holiday_config?.has_holiday_service === true) {
      let holidayDailyHours = 0;
      (maybeWithHoliday.holiday_config.holiday_timeSlots ?? []).forEach(
        (slot) => {
          const start = new Date(`2000-01-01T${slot.start}`);
          const end = new Date(`2000-01-01T${slot.end}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          holidayDailyHours += hours;
        }
      );
      // Sumar horas de sábado y domingo
      totalHours += holidayDailyHours * 2;
    }

    return totalHours;
  };

  const dashboardUrl = useDashboardUrl();

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: assignmentsData, error: assignmentsError } =
          await supabase
            .from('assignments')
            .select(
              `
            *,
            user:users(name, surname),
            worker:workers(name, surname)
          `
            )
            .order('created_at', { ascending: false });

        if (assignmentsError !== null) {
          logger.error('Error cargando asignaciones:', assignmentsError);
        } else {
          // Transformar los datos para incluir monthly_hours
          const transformedData = (assignmentsData ?? []).map((assignment) => ({
            ...assignment,
            monthly_hours: assignment.weekly_hours || 0, // Usar weekly_hours como monthly_hours temporalmente
          })) as Assignment[];

          setAssignments(transformedData);
        }
      } catch (error) {
        logger.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData().catch((error) => {
      logger.error('Error loading data:', error);
    });
  }, []);

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la asignación de ${assignment.worker?.name} ${assignment.worker?.surname} para ${assignment.user?.name} ${assignment.user?.surname}?`
    );

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('id', assignment.id);

        if (error !== null) {
          logger.error('Error eliminando asignación:', error);
          // eslint-disable-next-line no-alert
          alert('Error eliminando asignación');
        } else {
          setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
          // eslint-disable-next-line no-alert
          alert('Asignación eliminada correctamente');
        }
      } catch (error) {
        logger.error('Error eliminando asignación:', error);
        // eslint-disable-next-line no-alert
        alert('Error eliminando asignación');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const searchLower = searchTerm.toLowerCase();
    const workerName =
      `${assignment.worker?.name} ${assignment.worker?.surname}`.toLowerCase();
    const userName =
      `${assignment.user?.name} ${assignment.user?.surname}`.toLowerCase();
    const assignmentType = assignment.assignment_type.toLowerCase();

    return (
      workerName.includes(searchLower) ||
      userName.includes(searchLower) ||
      assignmentType.includes(searchLower)
    );
  });

  const getStatusColor = (status: string): string => {
    if (status === 'active') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'laborables':
        return 'bg-blue-100 text-blue-800';
      case 'festivos':
        return 'bg-green-100 text-green-800';
      case 'flexible':
        return 'bg-purple-100 text-purple-800';
      case 'completa':
        return 'bg-orange-100 text-orange-800';
      case 'personalizada':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className='bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen flex flex-col'>
        {/* Header - Visible en todos los dispositivos */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
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
              className='flex items-center text-gray-600 hover:text-gray-900 transition-colors space-x-2'
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
              <span className='text-sm font-medium'>Volver al Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Contenido Principal */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex-1'>
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
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <span className='text-blue-600 text-lg'>📋</span>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>
                    Total Asignaciones
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {assignments.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                    <span className='text-green-600 text-lg'>✅</span>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Activas</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {assignments.filter((a) => a.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                    <span className='text-gray-600 text-lg'>⏸️</span>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Inactivas</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {assignments.filter((a) => a.status === 'inactive').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <span className='text-yellow-600 text-lg'>🆕</span>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>
                    Esta Semana
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {
                      assignments.filter((a) => {
                        if (a.created_at === null) return false;
                        const createdDate = new Date(a.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return createdDate >= weekAgo;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='flex-1'>
              <Input
                type='text'
                placeholder='Buscar por trabajadora, usuario o tipo...'
                value={searchTerm}
                onChange={handleSearch}
                className='w-full'
              />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              + Nueva Asignación
            </Button>
          </div>

          {/* Assignments List */}
          {loading ? (
            <Card className='p-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-gray-600'>Cargando asignaciones...</p>
              </div>
            </Card>
          ) : (
            <div className='space-y-4'>
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-blue-600 font-medium'>
                            {assignment.worker?.name?.charAt(0)}
                            {assignment.worker?.surname?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {assignment.worker?.name} {assignment.worker?.surname}
                        </h3>
                        <p className='text-gray-600'>
                          Para: {assignment.user?.name}{' '}
                          {assignment.user?.surname}
                        </p>
                        <div className='flex items-center space-x-2 mt-1'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(assignment.assignment_type)}`}
                          >
                            {assignment.assignment_type === 'laborables'
                              ? '🎉 Laborables'
                              : assignment.assignment_type === 'festivos'
                                ? '🎉 Festivos'
                                : '🔄 Flexible'}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                          >
                            {assignment.status === 'active'
                              ? 'Activa'
                              : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewAssignment(assignment)}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        👁️ Ver
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditAssignment(assignment)}
                        className='text-yellow-600 hover:text-yellow-900'
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          handleDeleteAssignment(assignment).catch((error) => {
                            logger.error('Error deleting assignment:', error);
                          });
                        }}
                        className='text-red-600 hover:text-red-900'
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Assignment Forms */}
          <AssignmentForm
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={(data) => {
              const handleSubmit = async () => {
                try {
                  // Incluir configuración de festivos en el schedule persistido
                  const scheduleWithHoliday: ScheduleWithHoliday = {
                    ...data.schedule,
                    holiday_config: {
                      has_holiday_service: data.has_holiday_service,
                      holiday_timeSlots: data.holiday_timeSlots,
                    },
                  };

                  // Calcular horas semanales (incluye festivos si aplica)
                  const totalHours = calculateWeeklyHours(scheduleWithHoliday);

                  const { error } = await supabase.from('assignments').insert([
                    {
                      user_id: data.user_id,
                      worker_id: data.worker_id,
                      assignment_type: data.assignment_type,
                      start_date: data.start_date,
                      end_date:
                        data.end_date.trim() === '' ? null : data.end_date,
                      schedule: JSON.stringify(scheduleWithHoliday),
                      notes: data.notes,
                      status: 'active',
                      weekly_hours: totalHours,
                    },
                  ]);

                  if (error) {
                    logger.error('Error creando asignación:', error);
                    // eslint-disable-next-line no-alert
                    alert('Error creando asignación');
                  } else {
                    // Recargar datos
                    const { data: newAssignments } = await supabase
                      .from('assignments')
                      .select(
                        `
                        *,
                        user:users(name, surname),
                        worker:workers(name, surname)
                      `
                      )
                      .order('created_at', { ascending: false });

                    // Transformar datos para incluir monthly_hours
                    const transformedData = (newAssignments ?? []).map(
                      (assignment) => ({
                        ...assignment,
                        monthly_hours: assignment.weekly_hours ?? 0,
                      })
                    ) as Assignment[];

                    setAssignments(transformedData);
                    setShowAddModal(false);
                    // eslint-disable-next-line no-alert
                    alert('Asignación creada correctamente');
                  }
                } catch (error) {
                  logger.error('Error creando asignación:', error);
                  // eslint-disable-next-line no-alert
                  alert('Error creando asignación');
                }
              };
              // eslint-disable-next-line no-void
              void handleSubmit();
            }}
            mode='create'
          />

          <AssignmentForm
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingAssignment(null);
            }}
            onSubmit={(data) => {
              const handleSubmit = async () => {
                if (!editingAssignment) return;

                try {
                  // Log de datos para debugging
                  // eslint-disable-next-line no-console
                  console.log('=== INICIO ACTUALIZACIÓN ===');
                  // eslint-disable-next-line no-console
                  console.log('ID de asignación:', editingAssignment.id);
                  // eslint-disable-next-line no-console
                  console.log('Datos a actualizar:', {
                    id: editingAssignment.id,
                    user_id: data.user_id,
                    worker_id: data.worker_id,
                    assignment_type: data.assignment_type,
                    start_date: data.start_date,
                    end_date:
                      data.end_date.trim() === '' ? null : data.end_date,
                    schedule: JSON.stringify(data.schedule),
                    notes: data.notes,
                    weekly_hours: calculateWeeklyHours(data.schedule),
                  });

                  // eslint-disable-next-line no-console
                  console.log('Ejecutando query de actualización...');

                  // Incluir configuración de festivos en el schedule persistido
                  const scheduleWithHoliday: ScheduleWithHoliday = {
                    ...data.schedule,
                    holiday_config: {
                      has_holiday_service: data.has_holiday_service,
                      holiday_timeSlots: data.holiday_timeSlots,
                    },
                  };

                  const { data: updateResult, error } = await supabase
                    .from('assignments')
                    .update({
                      user_id: data.user_id,
                      worker_id: data.worker_id,
                      assignment_type: data.assignment_type,
                      start_date: data.start_date,
                      end_date:
                        data.end_date.trim() === '' ? null : data.end_date,
                      schedule: JSON.stringify(scheduleWithHoliday),
                      notes: data.notes,
                      // Calcular weekly_hours basado en el schedule (incluye festivos)
                      weekly_hours: calculateWeeklyHours(scheduleWithHoliday),
                    })
                    .eq('id', editingAssignment.id)
                    .select();

                  // eslint-disable-next-line no-console
                  console.log('Resultado de la operación:', {
                    updateResult,
                    error,
                  });

                  if (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error de Supabase:', error);
                    logger.error('Error actualizando asignación:', error);
                    // eslint-disable-next-line no-alert
                    alert(
                      `Error actualizando asignación: ${error.message || 'Error desconocido'}`
                    );
                  } else {
                    // eslint-disable-next-line no-console
                    console.log(
                      'Asignación actualizada correctamente:',
                      updateResult
                    );
                    // Recargar datos
                    const { data: updatedAssignments } = await supabase
                      .from('assignments')
                      .select(
                        `
                        *,
                        user:users(name, surname),
                        worker:workers(name, surname)
                      `
                      )
                      .order('created_at', { ascending: false });

                    // Transformar datos para incluir monthly_hours
                    const transformedData = (updatedAssignments ?? []).map(
                      (assignment) => ({
                        ...assignment,
                        monthly_hours: assignment.weekly_hours ?? 0,
                      })
                    ) as Assignment[];

                    setAssignments(transformedData);
                    setShowEditModal(false);
                    setEditingAssignment(null);
                    // eslint-disable-next-line no-alert
                    alert('Asignación actualizada correctamente');
                  }
                } catch (error) {
                  logger.error('Error actualizando asignación:', error);
                  // eslint-disable-next-line no-alert
                  alert('Error actualizando asignación');
                }
              };
              // eslint-disable-next-line no-void
              void handleSubmit();
            }}
            initialData={
              editingAssignment
                ? (() => {
                    const parsed = parseSchedule(
                      editingAssignment.schedule
                    ) as ScheduleWithHoliday;
                    return {
                      user_id: editingAssignment.user_id,
                      worker_id: editingAssignment.worker_id,
                      assignment_type: editingAssignment.assignment_type as
                        | 'laborables'
                        | 'festivos'
                        | 'flexible',
                      start_date: editingAssignment.start_date,
                      end_date: editingAssignment.end_date ?? '',
                      schedule: parsed as AssignmentFormData['schedule'],
                      has_holiday_service:
                        parsed.holiday_config?.has_holiday_service ?? false,
                      holiday_timeSlots:
                        parsed.holiday_config?.holiday_timeSlots ?? [],
                      notes: editingAssignment.notes ?? '',
                    };
                  })()
                : {}
            }
            mode='edit'
          />

          <AssignmentForm
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            onSubmit={() => {
              // Función vacía para modo view
            }}
            initialData={
              selectedAssignment
                ? (() => {
                    const parsed = parseSchedule(
                      selectedAssignment.schedule
                    ) as ScheduleWithHoliday;
                    return {
                      user_id: selectedAssignment.user_id,
                      worker_id: selectedAssignment.worker_id,
                      assignment_type: selectedAssignment.assignment_type as
                        | 'laborables'
                        | 'festivos'
                        | 'flexible',
                      start_date: selectedAssignment.start_date,
                      end_date: selectedAssignment.end_date ?? '',
                      schedule: parsed as AssignmentFormData['schedule'],
                      has_holiday_service:
                        parsed.holiday_config?.has_holiday_service ?? false,
                      holiday_timeSlots:
                        parsed.holiday_config?.holiday_timeSlots ?? [],
                      notes: selectedAssignment.notes ?? '',
                    };
                  })()
                : {}
            }
            mode='view'
          />
        </div>

        {/* Footer */}
        <footer className='border-t border-gray-200 bg-white py-8 mt-auto mb-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2 font-medium'>
                © 2025 SAD - Sistema de Gestión de Servicios Asistenciales
                Domiciliarios
              </p>
              <p className='text-xs text-gray-500'>
                Hecho con mucho ❤️ por{' '}
                <span className='font-bold text-gray-700'>Gusi</span>
              </p>
            </div>
          </div>
        </footer>

        {/* Navegación Móvil */}
        <Navigation variant='mobile' />
      </div>
    </ProtectedRoute>
  );
}
