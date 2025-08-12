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
const MonthServicesList = (props: {
  assignments: Array<{
    id: string;
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    users?: { name: string | null; surname: string | null } | null;
  }>;
  getMonthSlots: (
    schedule: unknown,
    assignmentType: string,
    date: Date
  ) => Array<{ start: string; end: string }>;
}): React.JSX.Element => {
  const { assignments, getMonthSlots } = props;

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

  // Calcular el rango del mes (misma lógica que el componente principal)
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() + 1); // Empezar desde mañana
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ); // Último día del mes

  const rows: Row[] = assignments.flatMap((a) => {
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';

    // Generar servicios para cada día del mes
    const services: Row[] = [];

    const current = new Date(monthStart);
    while (current.getTime() <= monthEnd.getTime()) {
      const currentDate = new Date(current);

      // Verificar si la trabajadora debe trabajar en esta fecha
      const assignmentType = a.assignment_type ?? '';
      if (!shouldWorkOnDate(currentDate, assignmentType)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const slots = getMonthSlots(a.schedule, a.assignment_type, currentDate);

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

  // Agrupar por semana
  const groupedByWeek = rows.reduce<Record<string, Row[]>>((acc, row) => {
    const date = new Date(row.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0] ?? '';

    if (!(weekKey in acc)) {
      acc[weekKey] = [];
    }
    const array = acc[weekKey];
    if (array) {
      array.push(row);
    }
    return acc;
  }, {});

  const formatWeekLabel = (weekStart: string): string => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })} - ${end.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })}`;
  };

  return (
    <div className='space-y-8'>
      {Object.entries(groupedByWeek).map(([weekStart, weekRows]) => (
        <div key={weekStart} className='space-y-4'>
          <h3 className='text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3'>
            Semana del {formatWeekLabel(weekStart)}
          </h3>

          {/* Agrupar por día dentro de la semana */}
          {Object.entries(
            weekRows.reduce<Record<string, Row[]>>((acc, row) => {
              if (!(row.date in acc)) {
                acc[row.date] = [];
              }
              const array = acc[row.date];
              if (array) {
                array.push(row);
              }
              return acc;
            }, {})
          ).map(([date, dayRows]) => (
            <div key={date} className='space-y-3 ml-4'>
              <h4 className='text-lg font-medium text-gray-800 border-l-4 border-blue-500 pl-3'>
                {formatDate(date)}
              </h4>
              {dayRows.map((r, idx) => (
                <div
                  key={`${r.assignmentId}-${r.start}-${r.end}`}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 md:p-5 rounded-xl border text-gray-900 ${containerClassByState[r.state]} ml-4`}
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
                        <span className='font-medium text-gray-900'>
                          {r.start}
                        </span>
                        <span className='mx-1 text-gray-500'>a</span>
                        <span className='font-medium text-gray-900'>
                          {r.end}
                        </span>
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClassByState[r.state]}`}
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
                      className='self-start md:self-auto text-xs'
                    >
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function ThisMonthPage(): React.JSX.Element {
  const { user } = useAuth();
  const [monthAssignments, setMonthAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  type TimeSlotRange = { start: string; end: string };

  const getMonthSlots = useCallback(
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

  const monthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() + 1); // Empezar desde mañana
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
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
          .ilike('email', user.email)
          .maybeSingle();

        if (workerError !== null || workerData === null) {
          setMonthAssignments([]);
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
                current
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
          setMonthAssignments(filtered);
        } else {
          setMonthAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [getMonthSlots, monthRange.start, monthRange.end, user?.email]);

  const currentMonth = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      }),
    []
  );

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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
