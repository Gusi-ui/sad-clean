'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';

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
    date: Date
  ) => Array<{ start: string; end: string }>;
}): React.JSX.Element => {
  const { assignments, getWeekSlots } = props;

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

  // Calcular el rango de la semana (misma lógica que el componente principal)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + 1); // Empezar desde mañana
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Hasta 7 días después

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

      const slots = getWeekSlots(a.schedule, a.assignment_type, currentDate);

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
    if (array) {
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
              key={`${r.assignmentId}-${r.start}-${r.end}`}
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
  const [weekAssignments, setWeekAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  type TimeSlotRange = { start: string; end: string };

  const getWeekSlots = useCallback(
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
        const isHoliday = dayOfWeek === 0; // Domingo
        const mustUseHoliday = isHoliday || type === 'festivos';
        if (mustUseHoliday && holidaySlots.length > 0) return holidaySlots;
        if (daySlots.length > 0) return daySlots;
        return holidaySlots;
      } catch {
        return [];
      }
    },
    []
  );

  const weekRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() + 1); // Empezar desde mañana
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Hasta 7 días después
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
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
          .ilike('email', user.email)
          .maybeSingle();

        if (workerError !== null || workerData === null) {
          setWeekAssignments([]);
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
                current
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
  }, [getWeekSlots, weekRange.start, weekRange.end, user?.email]);

  const formatLongDate = (d: Date): string =>
    d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const weekStart = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    return start;
  }, []);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
