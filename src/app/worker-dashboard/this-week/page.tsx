'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import { getWeekRange } from '@/lib/date-utils';

interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users?: { name: string | null; surname: string | null } | null;
}

// Lista de servicios por tramos con prioridad por estado y hora
const WeekServicesList = (props: {
  assignments: Array<{
    id: string;
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    users?: { name: string | null; surname: string | null } | null;
  }>;
  getWeekSlots: (
    schedule: unknown,
    assignmentType: string,
    date: Date,
    currentHolidaySet: ReadonlySet<string>
  ) => Array<{ start: string; end: string }>;
  holidaySet: ReadonlySet<string>;
  weekRange: { start: string; end: string };
}): React.JSX.Element => {
  const { assignments, getWeekSlots, holidaySet, weekRange } = props;

  type Row = {
    assignmentId: string;
    userLabel: string;
    start: string;
    end: string;
    startMinutes: number;
    date: string;
    dayName: string;
    state: 'pending' | 'inprogress' | 'done';
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

  // Función para verificar si una fecha es festivo (solo desde BD)
  const isKnownHoliday = (date: Date): boolean => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidaySet.has(dateKey);
  };

  // Función para verificar si una trabajadora debe trabajar en una fecha específica
  const shouldWorkOnDate = (date: Date, assignmentType: string): boolean => {
    const dayOfWeek = date.getDay();
    const type = assignmentType.toLowerCase();

    // Domingo (0) y Sábado (6)
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const isHoliday = holidaySet.has(dateKey) || isKnownHoliday(date);

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

  // Calcular el rango de la semana actual usando las utilidades de fecha española
  const weekStart = new Date(weekRange.start);
  const weekEnd = new Date(weekRange.end);

  const rows: Row[] = assignments.flatMap((a) => {
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';

    // Generar servicios para cada día de la semana
    const services: Row[] = [];

    const current = new Date(weekStart);
    while (current.getTime() <= weekEnd.getTime()) {
      const currentDate = new Date(current);

      // Verificar si la trabajadora debe trabajar en esta fecha
      const assignmentType = a.assignment_type ?? '';
      if (!shouldWorkOnDate(currentDate, assignmentType)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const slots = getWeekSlots(
        a.schedule,
        a.assignment_type,
        currentDate,
        holidaySet
      );

      // Solo agregar servicios si hay slots para este día
      if (slots.length > 0) {
        slots.forEach((s) => {
          const sm = toMinutes(s.start);
          const dateStr = currentDate.toISOString().split('T')[0] ?? '';
          services.push({
            assignmentId: a.id,
            userLabel: label,
            start: s.start,
            end: s.end,
            startMinutes: sm,
            date: dateStr,
            dayName: formatDate(dateStr),
            state: 'pending' as const,
          });
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return services;
  });

  // Ordenar por fecha y luego por hora
  rows.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startMinutes - b.startMinutes;
  });

  const badgeClassByState: Record<Row['state'], string> = {
    pending: 'bg-white/80 text-amber-800 ring-1 ring-amber-300',
    inprogress: 'bg-white/80 text-green-800 ring-1 ring-green-300',
    done: 'bg-white/80 text-rose-800 ring-1 ring-rose-300',
  };
  const containerClassByState: Record<Row['state'], string> = {
    pending: 'bg-amber-100 border-amber-300 shadow-sm hover:bg-amber-50',
    inprogress: 'bg-green-100 border-green-300 shadow-sm hover:bg-green-50',
    done: 'bg-rose-100 border-rose-300 shadow-sm hover:bg-rose-50',
  };

  // Agrupar por día
  const groupedByDay = rows.reduce<Record<string, Row[]>>((acc, row) => {
    if (!(row.date in acc)) {
      acc[row.date] = [];
    }
    const array = acc[row.date];
    if (array !== undefined) {
      array.push(row);
    }
    return acc;
  }, {});

  return (
    <div className='space-y-6'>
      {Object.entries(groupedByDay).map(([date, dayRows]) => (
        <div key={date} className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            {formatDate(date)}
          </h3>
          {dayRows.map((r, idx) => (
            <div
              key={`${r.assignmentId}-${r.start}-${r.end}-${idx}`}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 md:p-6 rounded-2xl border text-gray-900 ${containerClassByState[r.state]}`}
            >
              <div className='flex items-start md:items-center gap-4'>
                <div className='w-10 h-10 md:w-12 md:h-12 bg-white text-blue-700 rounded-full flex items-center justify-center ring-2 ring-blue-200 shadow-sm'>
                  <span className='font-bold'>{idx + 1}</span>
                </div>
                <div>
                  <h3 className='text-base md:text-lg font-semibold text-gray-900 leading-tight'>
                    {r.userLabel}
                  </h3>
                  <p className='mt-1 text-sm text-gray-700'>
                    <span className='font-medium text-gray-900'>{r.start}</span>
                    <span className='mx-1 text-gray-500'>a</span>
                    <span className='font-medium text-gray-900'>{r.end}</span>
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClassByState[r.state]}`}
                  >
                    Programado
                  </span>
                </div>
              </div>
              <Link
                href={`/worker-dashboard/assignment/${r.assignmentId}?start=${r.start}&end=${r.end}`}
              >
                <Button
                  size='sm'
                  variant='outline'
                  className='self-start md:self-auto'
                >
                  Ver Detalles
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function ThisWeekPage(): React.JSX.Element {
  const { user } = useAuth();
  const currentUser = user;
  const [weekAssignments, setWeekAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [holidaySet, setHolidaySet] = useState<Set<string>>(new Set());
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);

  type TimeSlotRange = { start: string; end: string };

  const getWeekSlots = useCallback(
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

  const weekRange = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + currentWeekOffset * 7);
    const range = getWeekRange(baseDate);
    return range;
  }, [currentWeekOffset]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (currentUser?.email === undefined) {
        setWeekAssignments([]);
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
          setWeekAssignments([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;

        // Cargar festivos para el rango de la semana
        const ws = new Date(weekRange.start ?? '');
        const we = new Date(weekRange.end ?? '');
        const { data: holidayRows } = await supabase
          .from('holidays')
          .select('day, month, year')
          .gte('year', ws.getFullYear())
          .lte('year', we.getFullYear());
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
            // Verificar si la asignación se solapa con el rango de la semana
            const assignmentStart = new Date(a.start_date);
            const assignmentEnd =
              a.end_date !== null
                ? new Date(a.end_date)
                : new Date('2099-12-31');
            const weekStart = new Date(weekRange.start ?? '');
            const weekEnd = new Date(weekRange.end ?? '');

            // Si la asignación no se solapa con la semana, filtrar
            if (
              assignmentEnd.getTime() < weekStart.getTime() ||
              assignmentStart.getTime() > weekEnd.getTime()
            ) {
              return false;
            }

            // Verificar si hay slots para algún día de la semana
            let hasSlotsInWeek = false;
            const current = new Date(weekStart);
            while (current.getTime() <= weekEnd.getTime()) {
              const slots = getWeekSlots(
                a.schedule,
                a.assignment_type,
                current,
                hset
              );
              if (slots.length > 0) {
                hasSlotsInWeek = true;
                break;
              }
              current.setDate(current.getDate() + 1);
            }

            if (!hasSlotsInWeek) return false;

            const t = (a.assignment_type ?? '').toLowerCase();
            return t === 'laborables' || t === 'flexible' || t === 'festivos';
          });

          // Simplemente pasar las asignaciones filtradas, sin generar slots diarios
          setWeekAssignments(filtered);
        } else {
          setWeekAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [currentUser?.email, currentWeekOffset, getWeekSlots, weekRange]);

  const formatLongDate = (d: Date): string =>
    d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const weekStart = useMemo(() => new Date(weekRange.start), [weekRange.start]);

  const weekEnd = useMemo(() => new Date(weekRange.end), [weekRange.end]);

  const handlePrevWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekOffset(0);
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
                    Servicios de Esta Semana
                  </h1>
                  <p className='text-gray-600'>
                    {formatLongDate(weekStart)} - {formatLongDate(weekEnd)}
                  </p>
                </div>
              </div>

              {/* Planning Navigation */}
              <div className='flex items-center space-x-2'>
                <Link href='/worker-dashboard/this-week'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  >
                    Esta Semana
                  </Button>
                </Link>
                <Link href='/worker-dashboard/this-month'>
                  <Button variant='outline' size='sm'>
                    Este Mes
                  </Button>
                </Link>
              </div>

              {/* Week Navigation */}
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePrevWeek}
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
                  onClick={handleCurrentWeek}
                  className='px-3 py-2 text-sm font-medium'
                >
                  Esta Semana
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleNextWeek}
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
                📅 Servicios Programados Esta Semana
              </h2>
              <p className='text-gray-600'>
                {weekAssignments.length} servicios programados
              </p>
            </div>
            <div className='p-6'>
              {loading ? (
                <p className='text-gray-600'>
                  Cargando servicios de esta semana...
                </p>
              ) : weekAssignments.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-600 mb-4'>
                    No tienes servicios programados para esta semana.
                  </p>
                  <Link href='/worker-dashboard'>
                    <Button variant='outline'>Volver al Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <WeekServicesList
                  assignments={weekAssignments}
                  getWeekSlots={getWeekSlots}
                  holidaySet={holidaySet}
                  weekRange={weekRange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
