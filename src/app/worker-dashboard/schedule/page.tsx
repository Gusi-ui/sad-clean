'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import {
  getNextWeekRange,
  getRemainingMonthRange,
  getWeekRange,
} from '@/lib/date-utils';

interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users?: { name: string | null; surname: string | null } | null;
}

// Componente para mostrar el horario semanal
const WeeklySchedule = (props: {
  assignments: Array<{
    id: string;
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    users?: { name: string | null; surname: string | null } | null;
  }>;
  getScheduleSlots: (
    schedule: unknown,
    assignmentType: string,
    date: Date
  ) => Array<{ start: string; end: string }>;
  weekStart: Date;
  weekEnd: Date;
}): React.JSX.Element => {
  const { assignments, getScheduleSlots, weekStart, weekEnd } = props;

  type TimeSlot = {
    assignmentId: string;
    userLabel: string;
    start: string;
    end: string;
    startMinutes: number;
    date: string;
    dayName: string;
  };

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Función para verificar si una trabajadora debe trabajar en una fecha específica
  const shouldWorkOnDate = (date: Date, assignmentType: string): boolean => {
    const dayOfWeek = date.getDay();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const type = assignmentType.toLowerCase();

    // Domingo (día 0)
    const isSunday = dayOfWeek === 0;

    // Festivos específicos (se pueden expandir)
    const isHoliday = (() => {
      if (year === 2025) {
        // 15 de agosto (viernes)
        if (month === 8 && day === 15) return true;
        // Otros festivos se pueden agregar aquí
      }
      return false;
    })();

    // Lógica según tipo de trabajadora
    switch (type) {
      case 'laborables':
        // Solo trabaja lunes a viernes, NO festivos
        return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;

      case 'festivos':
        // Solo trabaja festivos y fines de semana
        return isSunday || isHoliday;

      case 'flexible':
        // Trabaja todos los días
        return true;

      case 'daily':
        // Trabaja todos los días
        return true;

      default:
        // Por defecto, solo días laborables
        return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;
    }
  };

  // Generar slots para toda la semana
  const allSlots: TimeSlot[] = assignments.flatMap((a) => {
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';
    const slots: TimeSlot[] = [];

    const current = new Date(weekStart);
    while (current.getTime() <= weekEnd.getTime()) {
      const currentDate = new Date(current);

      // Verificar si la trabajadora debe trabajar en esta fecha
      const assignmentType = a.assignment_type ?? '';
      if (!shouldWorkOnDate(currentDate, assignmentType)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const daySlots = getScheduleSlots(
        a.schedule,
        a.assignment_type,
        currentDate
      );

      // Solo agregar servicios si hay slots para este día
      if (daySlots.length > 0) {
        daySlots.forEach((s) => {
          const sm = toMinutes(s.start);
          const dateStr = currentDate.toISOString().split('T')[0] ?? '';
          slots.push({
            assignmentId: a.id,
            userLabel: label,
            start: s.start,
            end: s.end,
            startMinutes: sm,
            date: dateStr,
            dayName: formatDate(dateStr),
          });
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  });

  // Ordenar por fecha y luego por hora
  allSlots.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startMinutes - b.startMinutes;
  });

  // Agrupar por día
  const groupedByDay = allSlots.reduce<Record<string, TimeSlot[]>>(
    (acc, slot) => {
      if (!(slot.date in acc)) {
        acc[slot.date] = [];
      }
      const array = acc[slot.date];
      if (array) {
        array.push(slot);
      }
      return acc;
    },
    {}
  );

  const dayNames = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  return (
    <div className='space-y-4 sm:space-y-6'>
      {dayNames.map((dayName, index) => {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + index);
        const dateKey = currentDate.toISOString().split('T')[0];
        const daySlots = groupedByDay[dateKey ?? ''] ?? [];

        return (
          <div key={dayName} className='bg-gray-50 rounded-xl p-3 sm:p-4'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3'>
              <span className='block sm:inline'>{dayName}</span>
              <span className='block sm:inline text-sm sm:text-base font-normal text-gray-600 sm:ml-2'>
                {currentDate.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </h3>

            {daySlots.length === 0 ? (
              <div className='text-center py-4'>
                <p className='text-gray-500 italic text-sm sm:text-base'>
                  Sin servicios programados
                </p>
              </div>
            ) : (
              <div className='space-y-2 sm:space-y-3'>
                {daySlots.map((slot, slotIndex) => (
                  <div
                    key={`${slot.assignmentId}-${slot.start}-${slot.end}-${slotIndex}`}
                    className='bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm'
                  >
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900 text-sm sm:text-base'>
                          {slot.userLabel}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-600'>
                          {slot.start} - {slot.end}
                        </p>
                      </div>
                      <div className='flex justify-end sm:text-right'>
                        <span className='inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          Programado
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function SchedulePage(): React.JSX.Element {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>(
    'week'
  );

  type TimeSlotRange = { start: string; end: string };

  const getScheduleSlots = useCallback(
    (
      schedule: unknown,
      _assignmentType: string,
      date: Date
    ): TimeSlotRange[] => {
      try {
        const sc =
          typeof schedule === 'string'
            ? (JSON.parse(schedule) as Record<string, unknown>)
            : (schedule as Record<string, unknown>);

        const dayOfWeek = date.getDay();
        const dayNames = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
        const dayName = dayNames[dayOfWeek] ?? 'monday';

        const parseSlots = (raw: unknown[]): TimeSlotRange[] =>
          raw
            .map((s: unknown) => {
              const slot = s as Record<string, unknown>;
              const start = (slot?.['start'] as string | undefined) ?? '';
              const end = (slot?.['end'] as string | undefined) ?? '';
              const ok = (t: string): boolean => /^\d{1,2}:\d{2}$/.test(t);
              if (ok(start) && ok(end)) {
                const pad = (t: string) =>
                  t
                    .split(':')
                    .map((p, i) => (i === 0 ? p.padStart(2, '0') : p))
                    .join(':');
                return { start: pad(start), end: pad(end) };
              }
              return null;
            })
            .filter((v): v is TimeSlotRange => v !== null);

        // Tramos del día normal
        const dayConfig = (sc?.[dayName] as Record<string, unknown>) ?? {};
        const enabled = (dayConfig?.['enabled'] as boolean) ?? true;
        const daySlotsRaw = Array.isArray(dayConfig?.['timeSlots'])
          ? (dayConfig['timeSlots'] as unknown[])
          : [];
        const daySlots = enabled ? parseSlots(daySlotsRaw) : [];

        // Festivos
        const holidayDay = (sc?.['holiday'] as Record<string, unknown>) ?? {};
        const holidayEnabled = (holidayDay?.['enabled'] as boolean) ?? false;
        const holidaySlotsRaw = Array.isArray(holidayDay?.['timeSlots'])
          ? (holidayDay['timeSlots'] as unknown[])
          : [];
        const holidaySlots = holidayEnabled ? parseSlots(holidaySlotsRaw) : [];

        // Determinar qué slots usar
        const isHoliday = date.getDay() === 0; // Domingo
        return isHoliday ? holidaySlots : daySlots;
      } catch {
        // Error parsing schedule
        return [];
      }
    },
    []
  );

  // Calcular rangos de fechas
  const weekRange = useMemo(() => getWeekRange(), []);
  const nextWeekRange = useMemo(() => getNextWeekRange(), []);
  const monthRange = useMemo(() => getRemainingMonthRange(), []);

  const currentWeekStart = useMemo(
    () => new Date(weekRange.start),
    [weekRange.start]
  );
  const currentWeekEnd = useMemo(
    () => new Date(weekRange.end),
    [weekRange.end]
  );
  const nextWeekStart = useMemo(
    () => new Date(nextWeekRange.start),
    [nextWeekRange.start]
  );
  const nextWeekEnd = useMemo(
    () => new Date(nextWeekRange.end),
    [nextWeekRange.end]
  );

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar trabajadora por email
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('id')
          .ilike('email', user.email)
          .maybeSingle();

        if (workerError !== null || workerData === null) {
          setAssignments([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;

        // Obtener todas las asignaciones activas de la trabajadora
        const { data: rows, error: err } = await supabase
          .from('assignments')
          .select(
            `
            id,
            assignment_type,
            schedule,
            start_date,
            end_date,
            users(name, surname)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active');

        if (err === null && rows !== null) {
          const filtered = rows.filter((a) => {
            const t = (a.assignment_type ?? '').toLowerCase();
            return t === 'laborables' || t === 'flexible' || t === 'festivos';
          });
          setAssignments(filtered);
        } else {
          setAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [user?.email]);

  const formatLongDate = (d: Date): string =>
    d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  return (
    <ProtectedRoute requiredRole='worker'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Link
                  href='/worker-dashboard'
                  className='text-gray-600 hover:text-gray-900'
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
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>
                    Mi Horario Completo
                  </h1>
                  <p className='text-gray-600'>
                    Vista detallada de todos tus servicios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
          <div className='bg-white rounded-2xl shadow-sm'>
            <div className='p-4 sm:p-6 border-b border-gray-200'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
                <div>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                    📅 Horario Detallado
                  </h2>
                  <p className='text-sm sm:text-base text-gray-600'>
                    {assignments.length} asignaciones activas
                  </p>
                </div>

                {/* Selector de período */}
                <div className='flex space-x-2'>
                  <Button
                    variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedPeriod('week')}
                    className='flex-1 sm:flex-none'
                  >
                    <span className='hidden sm:inline'>Esta Semana</span>
                    <span className='sm:hidden'>Semana</span>
                  </Button>
                  <Button
                    variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedPeriod('month')}
                    className='flex-1 sm:flex-none'
                  >
                    <span className='hidden sm:inline'>Este Mes</span>
                    <span className='sm:hidden'>Mes</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className='p-4 sm:p-6'>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600 text-sm sm:text-base'>
                    Cargando horario completo...
                  </p>
                </div>
              ) : assignments.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                    <span className='text-2xl'>📅</span>
                  </div>
                  <p className='text-gray-600 mb-4 text-sm sm:text-base'>
                    No tienes asignaciones activas.
                  </p>
                  <Link href='/worker-dashboard'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='sm:text-base'
                    >
                      Volver al Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='space-y-6'>
                  {selectedPeriod === 'week' ? (
                    <div>
                      <div className='mb-4 sm:mb-6'>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2'>
                          Semana Actual
                        </h3>
                        <p className='text-sm sm:text-base text-gray-600'>
                          {formatLongDate(currentWeekStart)} -{' '}
                          {formatLongDate(currentWeekEnd)}
                        </p>
                      </div>

                      <WeeklySchedule
                        assignments={assignments}
                        getScheduleSlots={getScheduleSlots}
                        weekStart={currentWeekStart}
                        weekEnd={currentWeekEnd}
                      />

                      <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200'>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2'>
                          Próxima Semana
                        </h3>
                        <p className='text-sm sm:text-base text-gray-600 mb-4'>
                          {formatLongDate(nextWeekStart)} -{' '}
                          {formatLongDate(nextWeekEnd)}
                        </p>

                        <WeeklySchedule
                          assignments={assignments}
                          getScheduleSlots={getScheduleSlots}
                          weekStart={nextWeekStart}
                          weekEnd={nextWeekEnd}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='mb-4 sm:mb-6'>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2'>
                          Este Mes
                        </h3>
                        <p className='text-sm sm:text-base text-gray-600'>
                          Desde{' '}
                          {new Date(monthRange.start).toLocaleDateString(
                            'es-ES'
                          )}{' '}
                          hasta{' '}
                          {new Date(monthRange.end).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      <div className='text-center py-8'>
                        <div className='w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-2xl'>🚧</span>
                        </div>
                        <p className='text-gray-600 italic text-sm sm:text-base'>
                          Vista mensual en desarrollo...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
