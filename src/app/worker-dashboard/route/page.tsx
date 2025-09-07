'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteMap from '@/components/route/RouteMap';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import useSimpleRouteSegments from '@/hooks/useSimpleRouteSegments';
import { supabase } from '@/lib/database';
import { formatDistance, formatDuration } from '@/lib/real-travel-time';

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
    postal_code?: string | null;
    city?: string | null;
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
    users?: {
      name: string | null;
      surname: string | null;
      address?: string | null;
      postal_code?: string | null;
      city?: string | null;
    } | null;
  }>;
  getRouteSlots: (
    schedule: unknown,
    assignmentType: string,
    useHoliday: boolean
  ) => Array<{ start: string; end: string }>;
  workerInfo: {
    address: string;
    postalCode?: string;
    city?: string;
  } | null;
}): React.JSX.Element => {
  const { assignments, getRouteSlots, workerInfo } = props;
  const [travelMode, setTravelMode] = useState<
    'DRIVING' | 'WALKING' | 'TRANSIT'
  >('DRIVING');

  type RouteStop = {
    assignmentId: string;
    userLabel: string;
    start: string;
    end: string;
    startMinutes: number;
    order: number;
    address?: string | null;
    postalCode?: string | null;
    city?: string | null;
  };

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const isHoliday = new Date().getDay() === 0;

  // Generar todas las paradas de la ruta (sin optimizar)
  const allRouteStops: RouteStop[] = assignments.flatMap((a) => {
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
        address: a.users?.address,
        postalCode: a.users?.postal_code,
        city: a.users?.city,
      };
    });
  });

  // Ordenar por hora de inicio
  allRouteStops.sort((a, b) => a.startMinutes - b.startMinutes);

  // Generar segmentos de viaje según la lógica de negocio:
  // - Un segmento por cada cambio de ubicación física
  // - Si el trabajador se queda en la misma dirección, segmento de 0 minutos
  // - Si regresa a una dirección anterior, nuevo segmento
  const travelSegments: Array<{
    from: RouteStop;
    to: RouteStop;
    travelTime: number; // en minutos
    isZeroTravel: boolean; // true si es mismo domicilio
  }> = [];

  for (let i = 0; i < allRouteStops.length - 1; i++) {
    const currentStop = allRouteStops[i];
    const nextStop = allRouteStops[i + 1];

    if (currentStop !== undefined && nextStop !== undefined) {
      const currentAddress = currentStop.address?.trim() ?? '';
      const nextAddress = nextStop.address?.trim() ?? '';

      // Calcular tiempo de viaje
      const timeBetweenServices =
        nextStop.startMinutes - toMinutes(currentStop.end);
      const isZeroTravel =
        currentAddress === nextAddress && currentAddress !== '';

      travelSegments.push({
        from: currentStop,
        to: nextStop,
        travelTime: isZeroTravel ? 0 : Math.max(0, timeBetweenServices),
        isZeroTravel,
      });
    }
  }

  // Para la visualización, usar todas las paradas (no optimizadas)
  const optimizedRouteStops = allRouteStops;

  // Usar el hook de tiempo real para obtener segmentos con tiempos reales
  const {
    segments: realTimeSegments,
    isLoading: segmentsLoading,
    error: segmentsError,
  } = useSimpleRouteSegments({
    routeStops: optimizedRouteStops,
    workerInfo,
    travelMode,
  });

  // Calcular tiempo de viaje usando los segmentos calculados (fallback a lógica local)
  const getTravelTimeForStop = (stopIndex: number): string => {
    // Intentar usar tiempo real primero
    if (realTimeSegments?.[stopIndex] != null) {
      const realSegment = realTimeSegments[stopIndex];
      if (realSegment.duration > 0) {
        return formatDuration(realSegment.duration);
      }
    }

    // Fallback a lógica local
    const segment = travelSegments[stopIndex];
    if (segment === undefined) return '';

    if (segment.isZeroTravel) {
      return '0min (mismo domicilio)';
    }

    const minutes = segment.travelTime;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div className='space-y-4'>
      {optimizedRouteStops.length === 0 ? (
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
          {optimizedRouteStops.map((stop, index) => (
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

                      {index < optimizedRouteStops.length - 1 && (
                        <div className='flex items-center space-x-1'>
                          <span>🚗</span>
                          <span>Viaje: {getTravelTimeForStop(index)}</span>
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
                  {optimizedRouteStops.length}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Primera Parada</p>
                <p className='text-blue-900 font-semibold'>
                  {optimizedRouteStops[0]?.start ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Última Parada</p>
                <p className='text-blue-900 font-semibold'>
                  {optimizedRouteStops[optimizedRouteStops.length - 1]?.end ??
                    'N/A'}
                </p>
              </div>
              <div>
                <p className='text-blue-600 font-medium'>Tiempo Total</p>
                <p className='text-blue-900 font-semibold'>
                  {(() => {
                    if (optimizedRouteStops.length === 0) return 'N/A';
                    const firstStop = optimizedRouteStops[0];
                    const lastStop =
                      optimizedRouteStops[optimizedRouteStops.length - 1];
                    if (firstStop === undefined || lastStop === undefined)
                      return 'N/A';
                    return calculateDuration(firstStop.start, lastStop.end);
                  })()}
                </p>
              </div>
            </div>

            {/* Segmentos de Viaje */}
            {travelSegments.length > 0 && (
              <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-200'>
                <div className='flex items-center space-x-2 mb-4 sm:mb-6'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg sm:text-xl'>🚗</span>
                  </div>
                  <h4 className='text-base sm:text-lg font-semibold text-blue-900'>
                    Segmentos de Viaje
                  </h4>
                </div>

                {/* Controles de modo de transporte */}
                <div className='mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                  <h5 className='text-sm font-medium text-blue-900 mb-2'>
                    Modo de transporte:
                  </h5>
                  <div className='flex flex-wrap gap-2'>
                    {(['DRIVING', 'WALKING', 'TRANSIT'] as const).map(
                      (mode) => (
                        <button
                          key={mode}
                          onClick={() => setTravelMode(mode)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            travelMode === mode
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                          }`}
                        >
                          {mode === 'DRIVING' && '🚗 Coche'}
                          {mode === 'WALKING' && '🚶 Andando'}
                          {mode === 'TRANSIT' && '🚌 Transporte público'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4'>
                  {travelSegments.map((segment, index) => {
                    // Obtener tiempo real si está disponible
                    const realSegment = realTimeSegments?.[index];
                    const hasRealTime =
                      realSegment != null && realSegment.duration > 0;
                    const displayTime = hasRealTime
                      ? formatDuration(realSegment.duration)
                      : segment.isZeroTravel
                        ? '0min'
                        : `${segment.travelTime}min`;
                    const displayDistance =
                      hasRealTime && realSegment.distance > 0
                        ? formatDistance(realSegment.distance)
                        : null;

                    return (
                      <div
                        key={index}
                        className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100 shadow-sm'
                      >
                        {/* Encabezado del segmento - Mobile First */}
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center space-x-2 mb-2'>
                              <span className='inline-flex items-center justify-center w-6 h-6 bg-blue-200 text-blue-800 text-xs font-bold rounded-full'>
                                {index + 1}
                              </span>
                              <h5 className='text-sm sm:text-base font-medium text-blue-900 truncate'>
                                {segment.from.userLabel} →{' '}
                                {segment.to.userLabel}
                              </h5>
                            </div>

                            {/* Direcciones - Responsive */}
                            <div className='text-xs sm:text-sm text-blue-600 space-y-1'>
                              <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2'>
                                <span className='font-medium text-blue-700'>
                                  Desde:
                                </span>
                                <span className='break-words'>
                                  {segment.from.address ?? 'Sin dirección'}
                                </span>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2'>
                                <span className='font-medium text-blue-700'>
                                  Hasta:
                                </span>
                                <span className='break-words'>
                                  {segment.to.address ?? 'Sin dirección'}
                                </span>
                              </div>
                              {displayDistance != null &&
                                displayDistance !== '' && (
                                  <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2'>
                                    <span className='font-medium text-blue-700'>
                                      Distancia:
                                    </span>
                                    <span className='text-blue-600'>
                                      {displayDistance}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Información de tiempo - Responsive */}
                          <div className='flex flex-row sm:flex-col items-center sm:items-end space-x-4 sm:space-x-0 sm:space-y-1 mt-2 sm:mt-0'>
                            <div className='text-center sm:text-right'>
                              <div className='text-lg sm:text-xl font-bold text-blue-900'>
                                {segmentsLoading ? '⏳' : displayTime}
                              </div>
                              <div className='text-xs text-blue-600'>
                                {hasRealTime
                                  ? 'Tiempo real'
                                  : 'Tiempo estimado'}
                              </div>
                            </div>
                            <div className='text-center sm:text-right'>
                              <div className='text-sm font-medium text-blue-800'>
                                {segment.from.end} - {segment.to.start}
                              </div>
                              <div className='text-xs text-blue-600'>
                                Horario
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Indicador visual de tiempo cero */}
                        {segment.isZeroTravel && (
                          <div className='mt-2 flex items-center space-x-2 text-xs text-green-700 bg-green-50 rounded-md px-2 py-1'>
                            <span>🏠</span>
                            <span>Mismo domicilio - Sin desplazamiento</span>
                          </div>
                        )}

                        {/* Indicador de error en tiempo real */}
                        {!hasRealTime &&
                          !segment.isZeroTravel &&
                          segmentsError != null &&
                          segmentsError !== '' && (
                            <div className='mt-2 flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1'>
                              <span>⚠️</span>
                              <span>
                                Usando tiempo estimado - Error en cálculo real
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                {/* Resumen total - Mejorado */}
                <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-200'>
                  <div className='bg-blue-900 rounded-lg p-4 sm:p-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-blue-900 font-bold text-lg'>
                            ∑
                          </span>
                        </div>
                        <div>
                          <h5 className='text-white font-semibold text-base sm:text-lg'>
                            Total tiempo de viaje
                          </h5>
                          <p className='text-blue-200 text-xs sm:text-sm'>
                            Tiempo entre servicios
                          </p>
                        </div>
                      </div>
                      <div className='text-right sm:text-left'>
                        <div className='text-2xl sm:text-3xl font-bold text-white'>
                          {(() => {
                            // Usar tiempos reales si están disponibles, sino usar tiempos locales
                            const totalMinutes = travelSegments.reduce(
                              (total, segment, index) => {
                                const realSegment = realTimeSegments?.[index];
                                if (
                                  realSegment != null &&
                                  realSegment.duration > 0
                                ) {
                                  return (
                                    total +
                                    Math.round(realSegment.duration / 60)
                                  );
                                }
                                return total + segment.travelTime;
                              },
                              0
                            );
                            return totalMinutes;
                          })()}
                          min
                        </div>
                        <div className='text-blue-200 text-xs sm:text-sm'>
                          {(() => {
                            const totalMinutes = travelSegments.reduce(
                              (total, segment, index) => {
                                const realSegment = realTimeSegments?.[index];
                                if (
                                  realSegment != null &&
                                  realSegment.duration > 0
                                ) {
                                  return (
                                    total +
                                    Math.round(realSegment.duration / 60)
                                  );
                                }
                                return total + segment.travelTime;
                              },
                              0
                            );
                            return Math.round((totalMinutes / 60) * 10) / 10;
                          })()}
                          h aproximadamente
                        </div>
                        {realTimeSegments != null &&
                          realTimeSegments.some((s) => s.duration > 0) && (
                            <div className='text-blue-200 text-xs mt-1'>
                              ✓ Incluye tiempos reales de{' '}
                              {travelMode === 'DRIVING'
                                ? 'conducir'
                                : travelMode === 'WALKING'
                                  ? 'caminar'
                                  : 'transporte público'}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoutePage(): React.JSX.Element {
  const { user: currentUser } = useAuth();
  const [todayAssignments, setTodayAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerInfo, setWorkerInfo] = useState<{
    name: string;
    address: string;
    postal_code?: string;
    city?: string;
  } | null>(null);

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

  // Memoize routeStops calculation to prevent infinite loops
  const routeStops = useMemo(() => {
    const isHoliday = new Date().getDay() === 0;
    const stops = todayAssignments.flatMap((a) => {
      const slots = getRouteSlots(a.schedule, a.assignment_type, isHoliday);
      const label =
        `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';

      return slots.map((s, index) => {
        const startParts = s.start.split(':');
        const startMinutes =
          parseInt(startParts[0] ?? '0') * 60 + parseInt(startParts[1] ?? '0');
        return {
          assignmentId: a.id,
          userLabel: label,
          start: s.start,
          end: s.end,
          startMinutes,
          order: index + 1,
          address: a.users?.address ?? undefined,
          postalCode: a.users?.postal_code ?? undefined,
          city: a.users?.city ?? undefined,
        };
      });
    });
    stops.sort((a, b) => a.startMinutes - b.startMinutes);

    // Nueva lógica: mantener TODAS las paradas para generar segmentos de viaje correctos
    // No eliminar duplicados - cada servicio es una parada independiente

    return stops;
  }, [todayAssignments, getRouteSlots]);

  const todayKey = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (currentUser?.email === undefined) {
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
          .ilike('email', currentUser?.email)
          .maybeSingle();

        // No usar dirección de la trabajadora - el primer servicio será el punto de referencia
        setWorkerInfo(null);

        if (workerError !== null || workerData === null) {
          setTodayAssignments([]);
          setLoading(false);
          return;
        }

        const workerId = (workerData as { id: string }).id;

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
            users!inner(name, surname, address, postal_code, city)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`);

        if (err !== null) {
          setTodayAssignments([]);
          setLoading(false);
          return;
        }

        if (rows !== null) {
          const filtered = rows.filter((a) => {
            const slots = getRouteSlots(
              a.schedule,
              a.assignment_type,
              useHoliday
            );
            if (slots.length === 0) return false;
            const assignmentType =
              typeof a.assignment_type === 'string' ? a.assignment_type : '';
            const t = assignmentType.toLowerCase();
            if (useHoliday) return t === 'festivos' || t === 'flexible';
            return t === 'laborables' || t === 'flexible';
          });
          setTodayAssignments(filtered as unknown as AssignmentRow[]);
        } else {
          setTodayAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [getRouteSlots, todayKey, currentUser?.email]);

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
                    workerInfo={workerInfo}
                  />

                  {/* Componente del Mapa */}
                  <div className='mt-6'>
                    <RouteMap
                      routeStops={routeStops}
                      workerInfo={
                        workerInfo
                          ? {
                              address: workerInfo.address,
                              postalCode: workerInfo.postal_code,
                              city: workerInfo.city,
                            }
                          : null
                      }
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
