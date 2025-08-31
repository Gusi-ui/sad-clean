'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import { getDayName, getMonthRange } from '@/lib/date-utils';

type Row = {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  startMinutes: number;
  date: string;
  dayName: string;
  state: 'pending' | 'inprogress' | 'done';
  assignmentType: string;
};

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};

// Lista de servicios por tramos con prioridad por estado y hora
const MonthServicesList = (props: {
  assignments: Row[];
  getMonthSlots: (
    schedule: unknown,
    assignmentType: string,
    date: Date,
    currentHolidaySet: ReadonlySet<string>
  ) => Array<{ start: string; end: string }>;
  holidaySet: ReadonlySet<string>;
}): React.JSX.Element => {
  const { assignments } = props;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Ordenar por fecha y hora
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startMinutes - b.startMinutes;
  });

  // Agrupar por fecha
  const groupedByDate = sortedAssignments.reduce<Record<string, Row[]>>(
    (acc, assignment) => {
      const date = assignment.date;
      if (!(date in acc)) {
        acc[date] = [];
      }
      acc[date].push(assignment);
      return acc;
    },
    {}
  );

  return (
    <div className='space-y-6'>
      {Object.entries(groupedByDate).map(([date, dayRows]) => (
        <div key={date} className='bg-gray-50 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-blue-700 font-bold text-sm'>
                  {new Date(date).getDate()}
                </span>
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>
                  {formatDate(date)}
                </h3>
                <p className='text-sm text-gray-600'>
                  {dayRows.length} servicio{dayRows.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Day Services */}
          <div className='space-y-3 ml-5'>
            {dayRows.map((r, idx) => (
              <div
                key={`${r.assignmentId}-${r.start}-${r.end}-${idx}`}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border-l-4 ${
                  r.assignmentType === 'laborables'
                    ? 'border-l-blue-500 bg-blue-50'
                    : r.assignmentType === 'festivos'
                      ? 'border-l-orange-500 bg-orange-50'
                      : r.assignmentType === 'flexible'
                        ? 'border-l-purple-500 bg-purple-50'
                        : 'border-l-gray-500 bg-gray-50'
                } hover:shadow-md transition-shadow`}
              >
                <div className='flex items-start md:items-center gap-3'>
                  <div className='w-8 h-8 bg-white text-blue-700 rounded-full flex items-center justify-center ring-2 ring-blue-200 shadow-sm'>
                    <span className='font-bold text-sm'>{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-gray-900 leading-tight'>
                      {r.userLabel}
                    </h3>
                    <p className='mt-1 text-xs text-gray-700'>
                      <span className='font-medium text-gray-900'>
                        {r.start}
                      </span>
                      <span className='mx-1 text-gray-500'>a</span>
                      <span className='font-medium text-gray-900'>{r.end}</span>
                    </p>
                    <span className='mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-white/80 text-gray-700 ring-1 ring-gray-300'>
                      {r.assignmentType === 'laborables'
                        ? 'Días Laborables'
                        : r.assignmentType === 'festivos'
                          ? 'Festivos'
                          : r.assignmentType === 'flexible'
                            ? 'Flexible'
                            : 'Otro'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/worker-dashboard/assignment/${r.assignmentId}?start=${r.start}&end=${r.end}`}
                >
                  <Button
                    size='sm'
                    variant='outline'
                    className='self-start md:self-auto text-xs'
                  >
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ThisMonthPage(): React.JSX.Element {
  const { user } = useAuth();
  const currentUser = user;
  const [monthAssignments, setMonthAssignments] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [holidaySet, setHolidaySet] = useState<Set<string>>(new Set());
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);

  type TimeSlotRange = { start: string; end: string };

  const getMonthSlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      date: Date,
      currentHolidaySet: ReadonlySet<string>
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
        const holidayDayRaw = Array.isArray(holidayDay?.['timeSlots'])
          ? (holidayDay['timeSlots'] as unknown[])
          : [];
        const holidayCfg =
          (sc?.['holiday_config'] as Record<string, unknown> | undefined) ??
          undefined;
        const holidayCfgRaw = Array.isArray(holidayCfg?.['holiday_timeSlots'])
          ? (holidayCfg?.['holiday_timeSlots'] as unknown[])
          : [];
        const holidaySlots = parseSlots(
          holidayCfgRaw.length > 0 ? holidayCfgRaw : holidayDayRaw
        );

        const type = (assignmentType ?? '').toLowerCase();
        const dateKey = date.toISOString().split('T')[0] ?? '';
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isOfficialHoliday = currentHolidaySet.has(dateKey);

        // Para trabajadoras de festivos, solo devolver slots en fines de semana y festivos
        if (type === 'festivos') {
          if ((isWeekend || isOfficialHoliday) && holidaySlots.length > 0)
            return holidaySlots;
          return [];
        }

        // Para trabajadoras de días laborables, solo devolver slots en días laborables (no fines de semana)
        if (type === 'laborables') {
          if (!isWeekend && !isOfficialHoliday && daySlots.length > 0)
            return daySlots;
          return [];
        }

        // Para trabajadoras flexibles, usar la lógica normal
        const mustUseHoliday = isWeekend || isOfficialHoliday;
        if (mustUseHoliday && holidaySlots.length > 0) return holidaySlots;
        if (daySlots.length > 0) return daySlots;
        return [];
      } catch {
        return [];
      }
    },
    []
  );

  const monthRange = useMemo(() => {
    const baseDate = new Date();
    // Usar el día 1 para evitar problemas con días que no existen en otros meses
    baseDate.setDate(1);
    baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
    const range = getMonthRange(baseDate);

    return range;
  }, [currentMonthOffset]);

  // Calcular el mes actual basado en el rango del mes para sincronización
  const currentMonth = useMemo(() => {
    const baseDate = new Date();
    // Usar el día 1 para evitar problemas con días que no existen en otros meses
    baseDate.setDate(1);
    baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
    return baseDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonthOffset]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (currentUser?.email === undefined) {
        setMonthAssignments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar trabajadora por email
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('id')
          .ilike('email', currentUser?.email)
          .maybeSingle();

        if (workerError !== null || workerData === null) {
          setMonthAssignments([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;

        // Cargar festivos para el rango del mes
        const ms = new Date(monthRange.start ?? '');
        const me = new Date(monthRange.end ?? '');
        const { data: holidayRows } = await supabase
          .from('holidays')
          .select('day, month, year')
          .gte('year', ms.getFullYear())
          .lte('year', me.getFullYear());
        const hset = new Set<string>();
        (holidayRows ?? []).forEach((row) => {
          const r = row as { day: number; month: number; year: number };
          const key = `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`;
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
            // Verificar si la asignación se solapa con el rango del mes
            const assignmentStart = new Date(a.start_date);
            const assignmentEnd =
              a.end_date !== null
                ? new Date(a.end_date)
                : new Date('2099-12-31');
            const monthStart = new Date(monthRange.start ?? '');
            const monthEnd = new Date(monthRange.end ?? '');

            // Si la asignación no se solapa con el mes, filtrar
            if (
              assignmentEnd.getTime() < monthStart.getTime() ||
              assignmentStart.getTime() > monthEnd.getTime()
            ) {
              return false;
            }

            // Verificar si hay slots para algún día del mes
            let hasSlotsInMonth = false;
            const current = new Date(monthStart);
            while (current.getTime() <= monthEnd.getTime()) {
              const slots = getMonthSlots(
                a.schedule,
                a.assignment_type,
                current,
                hset
              );
              if (slots.length > 0) {
                hasSlotsInMonth = true;
                break;
              }
              current.setDate(current.getDate() + 1);
            }

            if (!hasSlotsInMonth) return false;

            const t = (a.assignment_type ?? '').toLowerCase();
            return t === 'laborables' || t === 'flexible' || t === 'festivos';
          });

          // Procesar las asignaciones para generar slots diarios
          const monthSlots: Row[] = [];

          // Obtener el rango del mes
          const monthStart = new Date(monthRange.start ?? '');
          const monthEnd = new Date(monthRange.end ?? '');

          // Procesar las asignaciones y generar slots solo para días con servicios
          filtered.forEach((a) => {
            const currentForAssignment = new Date(monthStart);
            while (currentForAssignment.getTime() <= monthEnd.getTime()) {
              const slots = getMonthSlots(
                a.schedule,
                a.assignment_type,
                currentForAssignment,
                hset
              );

              slots.forEach((slot) => {
                const dateKey =
                  currentForAssignment.toISOString().split('T')[0] ?? '';
                monthSlots.push({
                  assignmentId: a.id,
                  userLabel:
                    `${(a.users as { name: string; surname: string })?.name ?? ''} ${(a.users as { name: string; surname: string })?.surname ?? ''}`.trim() ||
                    'Servicio',
                  start: slot.start,
                  end: slot.end,
                  startMinutes: toMinutes(slot.start),
                  date: dateKey,
                  dayName: getDayName(currentForAssignment),
                  state: 'pending',
                  assignmentType: a.assignment_type ?? '',
                });
              });

              currentForAssignment.setDate(currentForAssignment.getDate() + 1);
            }
          });

          setMonthAssignments(monthSlots);
        } else {
          setMonthAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [currentUser?.email, currentMonthOffset, getMonthSlots, monthRange]);

  const handlePrevMonth = () => {
    setCurrentMonthOffset((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonthOffset((prev) => prev + 1);
  };

  const handleCurrentMonth = () => {
    setCurrentMonthOffset(0);
  };

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
                    Servicios de Este Mes
                  </h1>
                  <p className='text-gray-600'>{currentMonth}</p>
                </div>
              </div>

              {/* Planning Navigation */}
              <div className='flex items-center space-x-2'>
                <Link href='/worker-dashboard/this-week'>
                  <Button variant='outline' size='sm'>
                    Esta Semana
                  </Button>
                </Link>
                <Link href='/worker-dashboard/this-month'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  >
                    Este Mes
                  </Button>
                </Link>
              </div>

              {/* Month Navigation */}
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePrevMonth}
                  className='flex items-center space-x-1 px-3 py-2 text-sm font-medium'
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
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                  <span className='hidden sm:inline'>Anterior</span>
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCurrentMonth}
                  className='px-3 py-2 text-sm font-medium'
                >
                  Este Mes
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleNextMonth}
                  className='flex items-center space-x-1 px-3 py-2 text-sm font-medium'
                >
                  <span className='hidden sm:inline'>Siguiente</span>
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
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          <div className='bg-white rounded-2xl shadow-sm'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                📅 Servicios Programados Este Mes
              </h2>
              <p className='text-gray-600'>
                {monthAssignments.length} servicios programados
              </p>
            </div>
            <div className='p-6'>
              {loading ? (
                <p className='text-gray-600'>
                  Cargando servicios de este mes...
                </p>
              ) : monthAssignments.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-600 mb-4'>
                    No tienes servicios programados para este mes.
                  </p>
                  <Link href='/worker-dashboard'>
                    <Button variant='outline'>Volver al Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <MonthServicesList
                  assignments={monthAssignments}
                  getMonthSlots={getMonthSlots}
                  holidaySet={holidaySet}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
