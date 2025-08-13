'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteMap from '@/components/route/RouteMap';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';

// Función auxiliar para calcular duración
const calculateDuration = (start: string, end: string): string => {
  const startParts = start.split(':');
  const endParts = end.split(':');

  if (startParts.length < 2 || endParts.length < 2) {
    return 'Duración no disponible';
  }

  const startMinutes =
    parseInt(startParts[0] ?? '0') * 60 + parseInt(startParts[1] ?? '0');
  const endMinutes =
    parseInt(endParts[0] ?? '0') * 60 + parseInt(endParts[1] ?? '0');
  const duration = endMinutes - startMinutes;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users?: {
    name: string | null;
    surname: string | null;
    address?: string | null;
  } | null;
}

// Componente para mostrar la ruta del día
const DailyRoute = (props: {
  assignments: Array<{
    id: string;
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    users?: { name: string | null; surname: string | null } | null;
  }>;
  getRouteSlots: (
    schedule: unknown,
    assignmentType: string,
    useHoliday: boolean
  ) => Array<{ start: string; end: string }>;
}): React.JSX.Element => {
  const { assignments, getRouteSlots } = props;

  type RouteStop = {
    assignmentId: string;
    userLabel: string;
    start: string;
    end: string;
    startMinutes: number;
    order: number;
    address?: string | null;
  };

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const isHoliday = new Date().getDay() === 0;

  // Generar paradas de la ruta
  const routeStops: RouteStop[] = assignments.flatMap((a) => {
    const slots = getRouteSlots(a.schedule, a.assignment_type, isHoliday);
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';

    return slots.map((s, index) => {
      const sm = toMinutes(s.start);
      return {
        assignmentId: a.id,
        userLabel: label,
        start: s.start,
        end: s.end,
        startMinutes: sm,
        order: index + 1,
      };
    });
  });

  // Ordenar por hora de inicio
  routeStops.sort((a, b) => a.startMinutes - b.startMinutes);

  // Calcular tiempo estimado entre paradas (30 minutos por defecto)
  const calculateEstimatedTime = (
    currentStop: RouteStop,
    nextStop: RouteStop
  ): string => {
    const timeDiff = nextStop.startMinutes - currentStop.startMinutes;
    const hours = Math.floor(timeDiff / 60);
    const minutes = timeDiff % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div className='space-y-4'>
      {routeStops.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
            <span className='text-2xl'>🏠</span>
          </div>
          <p className='text-gray-600 mb-2 text-sm sm:text-base'>
            No tienes servicios programados para hoy
          </p>
          <p className='text-xs sm:text-sm text-gray-500'>
            Disfruta de tu día libre
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {routeStops.map((stop, index) => (
            <div
              key={`${stop.assignmentId}-${stop.start}-${stop.end}-${index}`}
            >
              {/* Línea conectora */}
              {index > 0 && (
                <div className='flex justify-center mb-4'>
                  <div className='w-0.5 h-8 bg-blue-200'></div>
                </div>
              )}

              {/* Parada */}
              <div className='bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm'>
                <div className='flex items-start space-x-3 sm:space-x-4'>
                  {/* Número de parada */}
                  <div className='flex-shrink-0'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold'>
                      {index + 1}
                    </div>
                  </div>

                  {/* Información de la parada */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0'>
                      <h3 className='text-base sm:text-lg font-semibold text-gray-900 truncate'>
                        {stop.userLabel}
                      </h3>
                      <span className='inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 self-start sm:self-auto'>
                        {stop.start} - {stop.end}
                      </span>
                    </div>

                    <div className='flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600'>
                      <div className='flex items-center space-x-1'>
                        <span>🕐</span>
                        <span>
                          Duración: {calculateDuration(stop.start, stop.end)}
                        </span>
                      </div>

                      {index < routeStops.length - 1 && (
                        <div className='flex items-center space-x-1'>
                          <span>🚗</span>
                          <span>
                            Viaje:{' '}
                            {(() => {
                              const nextStop = routeStops[index + 1];
                              return nextStop
                                ? calculateEstimatedTime(stop, nextStop)
                                : '';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className='flex-shrink-0'>
                    <Link
                      href={`/worker-dashboard/assignment/${stop.assignmentId}?start=${stop.start}&end=${stop.end}`}
                    >
                      <Button
                        size='sm'
                        variant='outline'
                        className='text-xs sm:text-sm'
                      >
                        <span className='hidden sm:inline'>Ver Detalles</span>
                        <span className='sm:hidden'>Ver</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Resumen de la ruta */}
          <div className='bg-blue-50 rounded-xl p-3 sm:p-4 mt-6'>
            <h3 className='text-base sm:text-lg font-semibold text-blue-900 mb-2'>
              📊 Resumen de la Ruta
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm'>
              <div>
                <p className='text-blue-600 font-medium'>Paradas</p>
                <p className='text-blue-900 font-semibold'>
                  {routeStops.length}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Primera Parada</p>
                <p className='text-blue-900 font-semibold'>
                  {routeStops[0]?.start ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Última Parada</p>
                <p className='text-blue-900 font-semibold'>
                  {routeStops[routeStops.length - 1]?.end ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Tiempo Total</p>
                <p className='text-blue-900 font-semibold'>
                  {(() => {
                    if (routeStops.length === 0) return 'N/A';
                    const firstStop = routeStops[0];
                    const lastStop = routeStops[routeStops.length - 1];
                    if (!firstStop || !lastStop) return 'N/A';
                    return calculateDuration(firstStop.start, lastStop.end);
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoutePage(): React.JSX.Element {
  const { user } = useAuth();
  const [todayAssignments, setTodayAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [currentLocation, setCurrentLocation] = useState<{
  //   lat: number;
  //   lng: number;
  // } | null>(null);

  type TimeSlotRange = { start: string; end: string };

  const getRouteSlots = useCallback(
    (
      schedule: unknown,
      _assignmentType: string,
      useHoliday: boolean
    ): TimeSlotRange[] => {
      try {
        const sc =
          typeof schedule === 'string'
            ? (JSON.parse(schedule) as Record<string, unknown>)
            : (schedule as Record<string, unknown>);

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

        if (useHoliday) {
          const holidayDay = (sc?.['holiday'] as Record<string, unknown>) ?? {};
          const holidayEnabled = (holidayDay?.['enabled'] as boolean) ?? false;
          const holidaySlotsRaw = Array.isArray(holidayDay?.['timeSlots'])
            ? (holidayDay['timeSlots'] as unknown[])
            : [];
          return holidayEnabled ? parseSlots(holidaySlotsRaw) : [];
        }

        const today = new Date();
        const dayOfWeek = today.getDay();
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

        const dayConfig = (sc?.[dayName] as Record<string, unknown>) ?? {};
        const enabled = (dayConfig?.['enabled'] as boolean) ?? true;
        const daySlotsRaw = Array.isArray(dayConfig?.['timeSlots'])
          ? (dayConfig['timeSlots'] as unknown[])
          : [];
        return enabled ? parseSlots(daySlotsRaw) : [];
      } catch {
        // Error parsing schedule
        return [];
      }
    },
    []
  );

  const todayKey = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
        setTodayAssignments([]);
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
          setTodayAssignments([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;

        // Verificar si hoy es festivo
        const { data: holidayData } = await supabase
          .from('holidays')
          .select('id')
          .eq('day', new Date().getDate())
          .eq('month', new Date().getMonth() + 1)
          .eq('year', new Date().getFullYear())
          .maybeSingle();

        const useHoliday = holidayData !== null || new Date().getDay() === 0;

        // Obtener asignaciones de hoy
        const { data: rows, error: err } = await supabase
          .from('assignments')
          .select(
            `
            id,
            assignment_type,
            schedule,
            start_date,
            end_date,
            users(name, surname, address)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`);

        if (err === null && rows !== null) {
          const filtered = rows.filter((a) => {
            const slots = getRouteSlots(
              a.schedule,
              a.assignment_type,
              useHoliday
            );
            if (slots.length === 0) return false;
            const t = (a.assignment_type ?? '').toLowerCase();
            if (useHoliday) return t === 'festivos' || t === 'flexible';
            return t === 'laborables' || t === 'flexible';
          });
          setTodayAssignments(filtered);
        } else {
          setTodayAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [getRouteSlots, todayKey, user?.email]);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
                    🗺️ Ruta de Hoy
                  </h1>
                  <p className='text-gray-600'>{todayFormatted}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
          <div className='bg-white rounded-2xl shadow-sm'>
            <div className='p-4 sm:p-6 border-b border-gray-200'>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                📍 Tu Ruta de Servicios
              </h2>
              <p className='text-sm sm:text-base text-gray-600'>
                {loading
                  ? 'Cargando...'
                  : `${todayAssignments.length} servicios programados para hoy`}
              </p>
            </div>

            <div className='p-4 sm:p-6'>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600 text-sm sm:text-base'>
                    Cargando ruta de hoy...
                  </p>
                </div>
              ) : (
                <>
                  <DailyRoute
                    assignments={todayAssignments}
                    getRouteSlots={getRouteSlots}
                  />

                  {/* Componente del Mapa */}
                  <div className='mt-6'>
                    <RouteMap
                      routeStops={(() => {
                        const isHoliday = new Date().getDay() === 0;
                        const routeStops = todayAssignments.flatMap((a) => {
                          const slots = getRouteSlots(
                            a.schedule,
                            a.assignment_type,
                            isHoliday
                          );
                          const label =
                            `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() ||
                            'Servicio';

                          return slots.map((s, index) => {
                            const startParts = s.start.split(':');
                            const startMinutes =
                              parseInt(startParts[0] ?? '0') * 60 +
                              parseInt(startParts[1] ?? '0');
                            return {
                              assignmentId: a.id,
                              userLabel: label,
                              start: s.start,
                              end: s.end,
                              startMinutes,
                              order: index + 1,
                              address: a.users?.address ?? undefined,
                            };
                          });
                        });
                        routeStops.sort(
                          (a, b) => a.startMinutes - b.startMinutes
                        );
                        return routeStops;
                      })()}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
