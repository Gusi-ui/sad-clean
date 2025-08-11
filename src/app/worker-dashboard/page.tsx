'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

export default function WorkerDashboard(): React.JSX.Element {
  const { user } = useAuth();
  const [todayAssignments, setTodayAssignments] = useState<AssignmentRow[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeUsers, setActiveUsers] = useState<number>(0);
  const todayRef = useRef<HTMLDivElement | null>(null);

  type TimeSlotRange = { start: string; end: string };

  const getTodaySlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      useHoliday: boolean
    ): TimeSlotRange[] => {
      try {
        const sc =
          typeof schedule === 'string'
            ? (JSON.parse(schedule) as Record<string, unknown>)
            : (schedule as Record<string, unknown>);
        const today = new Date().getDay();
        const dayNames = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
        const dayName = dayNames[today] ?? 'monday';

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
        const enabled = (dayConfig?.['enabled'] as boolean) ?? true; // si no viene, asumimos activo
        const daySlotsRaw = Array.isArray(dayConfig?.['timeSlots'])
          ? (dayConfig['timeSlots'] as unknown[])
          : [];
        const daySlots = enabled ? parseSlots(daySlotsRaw) : [];

        // Festivos: soportar schedule.holiday.timeSlots y holiday_config.holiday_timeSlots
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
        const mustUseHoliday = useHoliday || type === 'festivos';
        if (mustUseHoliday && holidaySlots.length > 0) return holidaySlots;
        if (daySlots.length > 0) return daySlots;
        return holidaySlots;
      } catch {
        return [];
      }
    },
    []
  );

  const todayKey = useMemo(() => {
    const toKey = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return toKey(new Date());
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
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
            users(name, surname)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`);

        if (err === null && rows !== null) {
          const filtered = rows.filter((a) => {
            const slots = getTodaySlots(
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

        // Horas esta semana (sumamos weekly_hours de asignaciones activas esta semana)
        const { data: weekData, error: wErr } = await supabase
          .from('assignments')
          .select('weekly_hours, start_date, end_date')
          .lte('start_date', weekRange.end)
          .or(`end_date.is.null,end_date.gte.${weekRange.start}`)
          .eq('worker_id', workerId)
          .eq('status', 'active');
        if (wErr === null) {
          const total = (weekData ?? []).reduce((acc, row) => {
            const v = (row as { weekly_hours: number | null }).weekly_hours;
            return acc + (typeof v === 'number' ? v : 0);
          }, 0);
          setWeeklyHours(Number(total.toFixed(1)));
        } else {
          setWeeklyHours(0);
        }

        // Usuarios activos para esta trabajadora (asignaciones activas)
        const { data: activeAss, error: aErr } = await supabase
          .from('assignments')
          .select('user_id')
          .eq('worker_id', workerId)
          .eq('status', 'active');
        if (aErr === null) {
          const unique = new Set(
            (activeAss ?? [])
              .map((r) => (r as { user_id: string | null }).user_id)
              .filter(
                (id): id is string => typeof id === 'string' && id.length > 0
              )
          );
          setActiveUsers(unique.size);
        } else {
          setActiveUsers(0);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [getTodaySlots, todayKey, weekRange.end, weekRange.start, user?.email]);

  const displayName = useMemo(() => {
    const meta = user?.name;
    if (typeof meta === 'string' && meta.trim() !== '') return meta;
    const email = user?.email ?? '';
    if (email.includes('@')) return email.split('@')[0] ?? 'Trabajadora';
    return 'Trabajadora';
  }, [user?.email, user?.name]);

  const formatLongDate = (d: Date): string =>
    d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const scrollToToday = (): void => {
    if (todayRef.current !== null) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // (Si se requiere ordenación futura por inicio, reutilizar getTodaySlots y calcular minutos)

  return (
    <ProtectedRoute requiredRole='worker'>
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
                      id='mobileLogoGradient'
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
                    fill='url(#mobileLogoGradient)'
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
              href='/auth'
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
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
            </Link>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          {/* Saludo Personalizado */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h1 className='text-2xl lg:text-3xl font-bold text-gray-900'>
                  {greeting}, {displayName} 👋
                </h1>
                <p className='text-gray-600 mt-1'>
                  Aquí tienes el resumen de tu gestión
                </p>
              </div>
              <div className='hidden lg:flex items-center space-x-4'>
                <span className='text-sm text-gray-500'>
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href='/auth'
                  className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
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
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                  <span>Cerrar Sesión</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Estadísticas - Layout responsive mejorado (1 columna en móvil) */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8'>
            <button
              onClick={scrollToToday}
              className='bg-white hover:bg-blue-50 active:bg-blue-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-blue-200 transition-all duration-200 w-full cursor-pointer transform hover:scale-105'
            >
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Servicios Hoy
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : todayAssignments.length}
                  </p>
                  <p className='text-xs md:text-xs text-blue-600 mt-1'>
                    {loading
                      ? 'Cargando...'
                      : `${todayAssignments.length} asignaciones activas`}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>📅</span>
                </div>
              </div>
            </button>

            <div className='bg-white hover:bg-green-50 active:bg-green-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-green-200 transition-all duration-200'>
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Horas Esta Semana
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : `${weeklyHours.toFixed(1)}`}
                  </p>
                  <p className='text-xs md:text-xs text-orange-600 mt-1'>
                    Sin cambios vs semana pasada
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>⏰</span>
                </div>
              </div>
            </div>

            <div className='bg-white hover:bg-purple-50 active:bg-purple-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-purple-200 transition-all duration-200'>
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Usuarios Activos
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {loading ? '...' : activeUsers}
                  </p>
                  <p className='text-xs md:text-xs text-green-600 mt-1'>
                    {loading ? 'Cargando...' : `${activeUsers} registrados`}
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>👤</span>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm mb-8' ref={todayRef}>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                Horario de Hoy
              </h2>
              <p className='text-gray-600'>{formatLongDate(new Date())}</p>
            </div>
            <div className='p-6'>
              {loading ? (
                <p className='text-gray-600'>Cargando…</p>
              ) : todayAssignments.length === 0 ? (
                <p className='text-gray-600'>No tienes servicios para hoy.</p>
              ) : (
                <div className='space-y-4'>
                  {todayAssignments.map((a, idx) => {
                    const slots = getTodaySlots(
                      a.schedule,
                      a.assignment_type,
                      new Date().getDay() === 0
                    );
                    return (
                      <div
                        key={a.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center'>
                            <span className='text-white font-bold'>
                              {idx + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className='font-semibold text-gray-900'>
                              {`${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() ||
                                'Servicio'}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {a.start_date} → {a.end_date ?? '—'}
                            </p>
                            {slots.length > 0 ? (
                              <div className='mt-1 flex flex-wrap gap-2'>
                                {slots.map((s, i) => (
                                  <span
                                    key={`${a.id}-slot-${i}`}
                                    className='inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium'
                                  >
                                    {s.start} - {s.end}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className='text-sm text-gray-500'>—</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/worker-dashboard/assignment/${a.id}`}>
                          <Button size='sm' variant='outline'>
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Acciones Rápidas
              </h3>
              <div className='space-y-3'>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  disabled
                  aria-disabled='true'
                >
                  📋 Ver Mi Horario Completo
                </Button>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  disabled
                  aria-disabled='true'
                >
                  📊 Mis Estadísticas
                </Button>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  disabled
                  aria-disabled='true'
                >
                  📞 Contactar Administración
                </Button>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  disabled
                  aria-disabled='true'
                >
                  ⚙️ Configuración
                </Button>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Próximos Servicios
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Mañana</p>
                    <p className='text-sm text-gray-600'>—</p>
                  </div>
                  <span className='text-blue-600 font-semibold'>—</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Esta Semana</p>
                    <p className='text-sm text-gray-600'>—</p>
                  </div>
                  <span className='text-green-600 font-semibold'>—</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Este Mes</p>
                    <p className='text-sm text-gray-600'>—</p>
                  </div>
                  <span className='text-purple-600 font-semibold'>—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Simplificado */}
        <footer className='mt-12 lg:mt-16 border-t border-gray-200 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>
                © 2025 SAD - Sistema de Gestión de Servicios Asistenciales
                Domiciliarios
              </p>
              <p className='text-xs text-gray-500'>
                Hecho con mucho ❤️ por{' '}
                <span className='font-medium text-gray-700'>Gusi</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
