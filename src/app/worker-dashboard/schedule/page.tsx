'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import {
  getMonthRange,
  getNextWeekRange,
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
  holidaySet?: ReadonlySet<string>;
}): React.JSX.Element => {
  const { assignments, getScheduleSlots, weekStart, weekEnd, holidaySet } =
    props;

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

  const isKnownHoliday = (date: Date): boolean => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    // Asunción de la Virgen: 15 de agosto
    if (m === 8 && d === 15) return true;
    return false;
  };

  // Función para verificar si una trabajadora debe trabajar en una fecha específica
  const shouldWorkOnDate = (date: Date, assignmentType: string): boolean => {
    const dayOfWeek = date.getDay();
    const type = assignmentType.toLowerCase();

    // Domingo (0) y Sábado (6)
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const isHoliday = holidaySet?.has(dateKey) === true || isKnownHoliday(date);

    // Lógica según tipo de trabajadora
    switch (type) {
      case 'laborables':
        // Solo trabaja lunes a viernes, NO festivos
        return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;

      case 'festivos':
        // Solo trabaja festivos y fines de semana (sábado y domingo)
        return isSaturday || isSunday || isHoliday;

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

// Componente mensual similar al planning, filtrado por la trabajadora logueada
const MonthlySchedule = (props: {
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
  monthStart: Date;
  monthEnd: Date;
  holidaySet?: ReadonlySet<string>;
}): React.JSX.Element => {
  const { assignments, getScheduleSlots, monthStart, monthEnd, holidaySet } =
    props;

  type Row = {
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

  const isKnownHoliday = (date: Date): boolean => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    if (m === 8 && d === 15) return true;
    return false;
  };

  const shouldWorkOnDate = (date: Date, assignmentType: string): boolean => {
    const dayOfWeek = date.getDay();
    const type = assignmentType.toLowerCase();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    const isHoliday = holidaySet?.has(dateKey) === true || isKnownHoliday(date);

    switch (type) {
      case 'laborables':
        return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;
      case 'festivos':
        return isSaturday || isSunday || isHoliday;
      case 'flexible':
      case 'daily':
        return true;
      default:
        return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;
    }
  };

  const rows: Row[] = assignments.flatMap((a) => {
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';
    const services: Row[] = [];
    const current = new Date(monthStart);
    while (current.getTime() <= monthEnd.getTime()) {
      const currentDate = new Date(current);
      const assignmentType = a.assignment_type ?? '';
      if (!shouldWorkOnDate(currentDate, assignmentType)) {
        current.setDate(current.getDate() + 1);
        continue;
      }
      const slots = getScheduleSlots(
        a.schedule,
        a.assignment_type,
        currentDate
      );
      if (slots.length > 0) {
        slots.forEach((s) => {
          const sm = toMinutes(s.start);
          const dateStr = `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(
            2,
            '0'
          )}-${String(currentDate.getDate()).padStart(2, '0')}`;
          services.push({
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
    return services;
  });

  rows.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startMinutes - b.startMinutes;
  });

  const groupedByWeek = rows.reduce<Record<string, Row[]>>((acc, row) => {
    const date = new Date(row.date);
    const day = date.getDay();
    const monday = new Date(date);
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(
      monday.getDate()
    ).padStart(2, '0')}`;
    (acc[weekKey] ??= []).push(row);
    return acc;
  }, {});

  const formatWeekLabel = (weekStartStr: string): string => {
    const parts = weekStartStr.split('-');
    const rawStart = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      12,
      0,
      0
    );
    const start = new Date(Math.max(rawStart.getTime(), monthStart.getTime()));
    const rawEnd = new Date(rawStart);
    rawEnd.setDate(rawStart.getDate() + 6);
    const end = new Date(Math.min(rawEnd.getTime(), monthEnd.getTime()));

    return `${start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })} - ${end.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })}`;
  };

  return (
    <div>
      <div className='mb-4 sm:mb-6'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2'>
          Este Mes
        </h3>
        <p className='text-sm sm:text-base text-gray-600'>
          Desde {monthStart.toLocaleDateString('es-ES')} hasta{' '}
          {monthEnd.toLocaleDateString('es-ES')}
        </p>
      </div>

      {Object.entries(groupedByWeek).map(([weekStartStr, weekRows]) => (
        <div key={weekStartStr} className='space-y-3 mb-6'>
          <h4 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            Semana del {formatWeekLabel(weekStartStr)}
          </h4>
          {weekRows.map((r, idx) => (
            <div
              key={`${r.assignmentId}-${r.start}-${r.end}-${idx}`}
              className='flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 md:p-5 rounded-xl border text-gray-900 bg-white'
            >
              <div className='flex items-start md:items-center gap-3'>
                <div className='w-8 h-8 md:w-10 md:h-10 bg-white text-blue-700 rounded-full flex items-center justify-center ring-2 ring-blue-200 shadow-sm'>
                  <span className='font-bold text-sm'>{idx + 1}</span>
                </div>
                <div>
                  <h3 className='text-sm md:text-base font-semibold text-gray-900 leading-tight'>
                    {r.userLabel}
                  </h3>
                  <p className='mt-1 text-xs md:text-sm text-gray-700'>
                    <span className='font-medium text-gray-900'>{r.start}</span>
                    <span className='mx-1 text-gray-500'>a</span>
                    <span className='font-medium text-gray-900'>{r.end}</span>
                    <span className='ml-2 text-gray-600'>({r.dayName})</span>
                  </p>
                </div>
              </div>
              <div>
                <span className='inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  Programado
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
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
  const [holidaySet, setHolidaySet] = useState<Set<string>>(new Set());

  type TimeSlotRange = { start: string; end: string };

  const getScheduleSlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
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

        // Festivos: soportar schedule.holiday.timeSlots y holiday_config.holiday_timeSlots
        const holidayDay = (sc?.['holiday'] as Record<string, unknown>) ?? {};
        const holidayEnabled = (holidayDay?.['enabled'] as boolean) ?? false;
        const holidaySlotsRaw = Array.isArray(holidayDay?.['timeSlots'])
          ? (holidayDay['timeSlots'] as unknown[])
          : [];

        const holidayCfg =
          (sc?.['holiday_config'] as Record<string, unknown> | undefined) ??
          undefined;
        const holidayCfgRaw = Array.isArray(holidayCfg?.['holiday_timeSlots'])
          ? (holidayCfg?.['holiday_timeSlots'] as unknown[])
          : [];

        const combinedHolidayRaw =
          holidayCfgRaw.length > 0 ? holidayCfgRaw : holidaySlotsRaw;
        const parsedHolidaySlots = holidayEnabled
          ? parseSlots(combinedHolidayRaw)
          : parseSlots(combinedHolidayRaw);

        // Determinar qué slots usar: festivos = fines de semana o festivo oficial o tipo 'festivos'
        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const type = (assignmentType ?? '').toLowerCase();
        const dateKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const isOfficialHoliday = holidaySet.has(dateKey);
        const mustUseHoliday =
          isWeekend || isOfficialHoliday || type === 'festivos';

        if (mustUseHoliday && parsedHolidaySlots.length > 0)
          return parsedHolidaySlots;
        if (daySlots.length > 0) return daySlots;
        return parsedHolidaySlots;
      } catch {
        // Error parsing schedule
        return [];
      }
    },
    [holidaySet]
  );

  // Calcular rangos de fechas
  const weekRange = useMemo(() => getWeekRange(), []);
  const nextWeekRange = useMemo(() => getNextWeekRange(), []);
  const monthRange = useMemo(() => getMonthRange(), []);

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

        // Cargar festivos para el rango que abarca semana actual, próxima semana y mes restante
        const holidayStart = new Date(
          Math.min(
            new Date(weekRange.start).getTime(),
            new Date(nextWeekRange.start).getTime(),
            new Date(monthRange.start).getTime()
          )
        );
        const holidayEnd = new Date(
          Math.max(
            new Date(weekRange.end).getTime(),
            new Date(nextWeekRange.end).getTime(),
            new Date(monthRange.end).getTime()
          )
        );
        const startYear = holidayStart.getFullYear();
        const endYear = holidayEnd.getFullYear();
        const { data: holidayRows } = await supabase
          .from('holidays')
          .select('day, month, year')
          .gte('year', startYear)
          .lte('year', endYear);
        const hset = new Set<string>();
        (holidayRows ?? []).forEach((row) => {
          const r = row as { day: number; month: number; year: number };
          const key = `${r.year}-${String(r.month).padStart(2, '0')}-${String(
            r.day
          ).padStart(2, '0')}`;
          hset.add(key);
        });
        setHolidaySet(hset);

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
  }, [
    user?.email,
    weekRange.start,
    weekRange.end,
    nextWeekRange.start,
    nextWeekRange.end,
    monthRange.start,
    monthRange.end,
  ]);

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
                        holidaySet={holidaySet}
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
                          holidaySet={holidaySet}
                        />
                      </div>
                    </div>
                  ) : (
                    <MonthlySchedule
                      assignments={assignments}
                      getScheduleSlots={getScheduleSlots}
                      monthStart={new Date(monthRange.start)}
                      monthEnd={new Date(monthRange.end)}
                      holidaySet={holidaySet}
                    />
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
