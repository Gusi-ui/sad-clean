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

// Lista de servicios por tramos con prioridad por estado y hora
const ServicesTodayList = (props: {
  assignments: Array<{
    id: string;
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    users?: { name: string | null; surname: string | null } | null;
  }>;
  getTodaySlots: (
    schedule: unknown,
    assignmentType: string,
    useHoliday: boolean
  ) => Array<{ start: string; end: string }>;
  isHoliday: boolean;
}): React.JSX.Element => {
  const { assignments, getTodaySlots, isHoliday } = props;
  type Row = {
    assignmentId: string;
    userLabel: string;
    start: string;
    end: string;
    startMinutes: number;
    state: 'pending' | 'inprogress' | 'done';
  };

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const rows: Row[] = assignments.flatMap((a) => {
    const slots = getTodaySlots(a.schedule, a.assignment_type, isHoliday);
    const label =
      `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';
    return slots.map((s) => {
      const sm = toMinutes(s.start);
      const em = toMinutes(s.end);
      let state: Row['state'] = 'pending';
      if (nowMinutes >= sm && nowMinutes < em) state = 'inprogress';
      else if (nowMinutes >= em) state = 'done';
      return {
        assignmentId: a.id,
        userLabel: label,
        start: s.start,
        end: s.end,
        startMinutes: sm,
        state,
      };
    });
  });

  // Orden: inprogress (verde) primero, luego pending (ámbar), luego done (rojo). Dentro, por hora de inicio
  const stateRank: Record<Row['state'], number> = {
    inprogress: 0,
    pending: 1,
    done: 2,
  };
  rows.sort((a, b) => {
    const sr = stateRank[a.state] - stateRank[b.state];
    if (sr !== 0) return sr;
    return a.startMinutes - b.startMinutes;
  });

  const badgeClassByState: Record<Row['state'], string> = {
    pending: 'bg-white/80 text-amber-800 ring-1 ring-amber-300',
    inprogress: 'bg-white/80 text-green-800 ring-1 ring-green-300',
    done: 'bg-white/80 text-rose-800 ring-1 ring-rose-300',
  };
  const containerClassByState: Record<Row['state'], string> = {
    // Colores más intensos para mejor contraste y visibilidad
    pending: 'bg-amber-100 border-amber-300 shadow-sm hover:bg-amber-50',
    inprogress: 'bg-green-100 border-green-300 shadow-sm hover:bg-green-50',
    done: 'bg-rose-100 border-rose-300 shadow-sm hover:bg-rose-50',
  };

  return (
    <div className='space-y-3'>
      {rows.map((r, idx) => (
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
                {r.state === 'pending' && 'Pendiente'}
                {r.state === 'inprogress' && 'En curso'}
                {r.state === 'done' && 'Completado'}
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
  );
};

export default function WorkerDashboard(): React.JSX.Element {
  const { user } = useAuth();
  const [todayAssignments, setTodayAssignments] = useState<AssignmentRow[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeUsers, setActiveUsers] = useState<number>(0);
  const todayRef = useRef<HTMLDivElement | null>(null);
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(
    new Set()
  );
  const [isHolidayToday, setIsHolidayToday] = useState<boolean>(false);
  const [allTodayServicesDone, setAllTodayServicesDone] =
    useState<boolean>(false);
  const [upcomingServices, setUpcomingServices] = useState<{
    tomorrow: number;
    thisWeek: number;
    thisMonth: number;
  }>({
    tomorrow: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

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

  // Obtener tramos para una fecha específica (p. ej., mañana)
  const getSlotsForDate = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      useHoliday: boolean,
      targetDate: Date
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

        const dayOfWeek = targetDate.getDay();
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
        const daySlots = enabled ? parseSlots(daySlotsRaw) : [];

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

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

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

  // Fechas para próximos servicios
  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const currentWeekRange = useMemo(() => getWeekRange(), []);
  const nextWeekRange = useMemo(() => getNextWeekRange(), []);

  const thisMonthRange = useMemo(() => getMonthRange(), []);

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

        const dow = new Date().getDay();
        const useHoliday = holidayData !== null || dow === 0 || dow === 6;
        setIsHolidayToday(useHoliday);

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

          // Calcular automáticamente los servicios completados basándose en el tiempo
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();

          const completedSlots = new Set<string>();

          let pendingExists = false;
          let totalSlotsCount = 0;
          filtered.forEach((assignment) => {
            const slots = getTodaySlots(
              assignment.schedule,
              assignment.assignment_type,
              useHoliday
            );
            totalSlotsCount += slots.length;
            slots.forEach((slot) => {
              const endMinutes = toMinutes(slot.end);
              // Si la hora actual es posterior al final del servicio, está completado
              if (nowMinutes >= endMinutes) {
                // Crear un identificador único para cada tramo horario
                const slotId = `${assignment.id}-${slot.start}-${slot.end}`;
                completedSlots.add(slotId);
              } else {
                pendingExists = true;
              }
            });
          });

          setCompletedTodayIds(completedSlots);

          // Actualizar estado de completado para hoy
          setAllTodayServicesDone(
            totalSlotsCount > 0 && pendingExists === false
          );
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

        // Cargar próximos servicios
        if (workerId) {
          try {
            // Obtener todas las asignaciones activas de la trabajadora
            const { data: allAssignments, error: assignmentsError } =
              await supabase
                .from('assignments')
                .select(
                  'id, start_date, end_date, assignment_type, schedule, user_id'
                )
                .eq('worker_id', workerId)
                .eq('status', 'active');

            if (assignmentsError) {
              return;
            }

            // Tipo para las asignaciones
            type Assignment = {
              id: string;
              start_date: string;
              end_date: string | null;
              assignment_type: string;
              schedule: unknown;
              user_id: string;
            };

            // Construir set de festivos para un rango [startDate, endDate]
            const buildHolidaySet = async (
              startDate: string,
              endDate: string
            ): Promise<Set<string>> => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const startYear = start.getFullYear();
              const endYear = end.getFullYear();

              const { data: holidayRows } = await supabase
                .from('holidays')
                .select('day, month, year')
                .gte('year', startYear)
                .lte('year', endYear);

              const set = new Set<string>();
              (holidayRows ?? []).forEach((row) => {
                const r = row as { day: number; month: number; year: number };
                const key = `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`;
                set.add(key);
              });
              return set;
            };

            // Función para generar servicios de una asignación en un rango de fechas
            const generateServicesForRange = (
              assignment: Assignment,
              startDate: string,
              endDate: string,
              holidays: ReadonlySet<string>
            ): number => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const assignmentStart = new Date(assignment.start_date);
              const assignmentEnd =
                assignment.end_date !== null
                  ? new Date(assignment.end_date)
                  : new Date('2099-12-31');

              // Si la asignación no se solapa con el rango, retornar 0
              if (
                assignmentEnd.getTime() < start.getTime() ||
                assignmentStart.getTime() > end.getTime()
              ) {
                return 0;
              }

              // Para asignaciones de días laborables, contar L-V no festivos
              if (
                assignment.assignment_type === 'working_days' ||
                assignment.assignment_type === 'laborables'
              ) {
                let count = 0;
                const current = new Date(
                  Math.max(start.getTime(), assignmentStart.getTime())
                );
                const rangeEnd = new Date(
                  Math.min(end.getTime(), assignmentEnd.getTime())
                );

                while (current.getTime() <= rangeEnd.getTime()) {
                  const dayOfWeek = current.getDay();
                  const key = current.toISOString().split('T')[0] ?? '';
                  // L-V y no festivo oficial
                  if (
                    dayOfWeek >= 1 &&
                    dayOfWeek <= 5 &&
                    holidays.has(key) === false
                  ) {
                    count++;
                  }
                  current.setDate(current.getDate() + 1);
                }
                return count;
              }

              // Para asignaciones diarias, contar días en el rango
              if (assignment.assignment_type === 'daily') {
                const current = new Date(
                  Math.max(start.getTime(), assignmentStart.getTime())
                );
                const rangeEnd = new Date(
                  Math.min(end.getTime(), assignmentEnd.getTime())
                );
                let count = 0;

                while (current.getTime() <= rangeEnd.getTime()) {
                  count++;
                  current.setDate(current.getDate() + 1);
                }
                return count;
              }

              // Para asignaciones flexibles, contar todos los días (laborables, fines de semana y festivos)
              if (assignment.assignment_type === 'flexible') {
                const current = new Date(
                  Math.max(start.getTime(), assignmentStart.getTime())
                );
                const rangeEnd = new Date(
                  Math.min(end.getTime(), assignmentEnd.getTime())
                );
                let count = 0;

                while (current.getTime() <= rangeEnd.getTime()) {
                  count++;
                  current.setDate(current.getDate() + 1);
                }
                return count;
              }

              // Para asignaciones de festivos, contar fines de semana o festivos oficiales
              if (assignment.assignment_type === 'festivos') {
                const current = new Date(
                  Math.max(start.getTime(), assignmentStart.getTime())
                );
                const rangeEnd = new Date(
                  Math.min(end.getTime(), assignmentEnd.getTime())
                );
                let count = 0;

                while (current.getTime() <= rangeEnd.getTime()) {
                  const dayOfWeek = current.getDay();
                  const key = `${current.getFullYear()}-${String(
                    current.getMonth() + 1
                  ).padStart(2, '0')}-${String(current.getDate()).padStart(
                    2,
                    '0'
                  )}`;
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  if (isWeekend || holidays.has(key)) {
                    count++;
                  }
                  current.setDate(current.getDate() + 1);
                }
                return count;
              }

              // Para asignaciones específicas, verificar si la fecha está en el rango
              if (assignment.assignment_type === 'specific') {
                const assignmentDate = new Date(assignment.start_date);
                if (
                  assignmentDate.getTime() >= start.getTime() &&
                  assignmentDate.getTime() <= end.getTime()
                ) {
                  return 1;
                }
                return 0;
              }

              return 0;
            };

            // Calcular servicios para cada período con festivos cargados por rango
            const [tomorrowHolidays, weekHolidays, monthHolidays] =
              await Promise.all([
                buildHolidaySet(tomorrowKey ?? '', tomorrowKey ?? ''),
                buildHolidaySet(
                  currentWeekRange.start ?? '',
                  currentWeekRange.end ?? ''
                ),
                buildHolidaySet(
                  // Asegurar mes completo local
                  `${new Date().getFullYear()}-${String(
                    new Date().getMonth() + 1
                  ).padStart(2, '0')}-01`,
                  `${new Date().getFullYear()}-${String(
                    new Date().getMonth() + 1
                  ).padStart(2, '0')}-${String(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ).getDate()
                  ).padStart(2, '0')}`
                ),
              ]);

            const tomorrowServices =
              allAssignments?.reduce(
                (total, assignment) =>
                  total +
                  generateServicesForRange(
                    assignment,
                    tomorrowKey ?? '',
                    tomorrowKey ?? '',
                    tomorrowHolidays
                  ),
                0
              ) ?? 0;

            const weekServices = (allAssignments ?? []).reduce(
              (total, assignment) =>
                total +
                generateServicesForRange(
                  assignment,
                  currentWeekRange.start ?? '',
                  currentWeekRange.end ?? '',
                  weekHolidays
                ),
              0
            );

            // Sumar servicios por asignación, evitando doble conteo de fechas repetidas
            const monthServices = (allAssignments ?? []).reduce(
              (total, assignment) =>
                total +
                generateServicesForRange(
                  assignment,
                  `${new Date().getFullYear()}-${String(
                    new Date().getMonth() + 1
                  ).padStart(2, '0')}-01`,
                  `${new Date().getFullYear()}-${String(
                    new Date().getMonth() + 1
                  ).padStart(2, '0')}-${String(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ).getDate()
                  ).padStart(2, '0')}`,
                  monthHolidays
                ),
              0
            );

            setUpcomingServices({
              tomorrow: tomorrowServices,
              thisWeek: weekServices,
              thisMonth: monthServices,
            });
          } catch {
            // Error loading upcoming services
          }
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [
    getTodaySlots,
    todayKey,
    weekRange.end,
    weekRange.start,
    currentWeekRange.end,
    currentWeekRange.start,
    tomorrowKey,
    nextWeekRange.start,
    nextWeekRange.end,
    thisMonthRange.start,
    thisMonthRange.end,
    user?.email,
    user?.id,
    getSlotsForDate,
  ]);

  // Recalcular automáticamente si todos los servicios de hoy han terminado para ocultar lista
  useEffect(() => {
    const recompute = (): void => {
      if (todayAssignments.length === 0) {
        setAllTodayServicesDone(false);
        return;
      }
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      let pendingExists = false;
      let totalSlots = 0;
      for (const a of todayAssignments) {
        const slots = getTodaySlots(
          a.schedule,
          a.assignment_type,
          isHolidayToday
        );
        totalSlots += slots.length;
        for (const s of slots) {
          const [hh, mm] = s.end.split(':');
          const endMin = Number(hh) * 60 + Number(mm);
          if (nowMinutes < endMin) {
            pendingExists = true;
            break;
          }
        }
        if (pendingExists) break;
      }
      setAllTodayServicesDone(totalSlots > 0 && pendingExists === false);
    };
    recompute();
    const id = window.setInterval(recompute, 30000);
    return () => window.clearInterval(id);
  }, [todayAssignments, getTodaySlots, isHolidayToday]);

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
              className='inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors'
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
              <span>Cerrar sesión</span>
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

          {/* 1. Horarios de Hoy - Primera sección */}
          <div className='bg-white rounded-2xl shadow-sm mb-8' ref={todayRef}>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                🕐 Horarios de Hoy
              </h2>
              <p className='text-gray-600'>{formatLongDate(new Date())}</p>
            </div>
            <div className='p-6'>
              {loading ? (
                <p className='text-gray-600'>Cargando…</p>
              ) : todayAssignments.length === 0 ? (
                <p className='text-gray-600'>No tienes servicios para hoy.</p>
              ) : allTodayServicesDone ? (
                <div className='text-center text-green-700 bg-green-50 border border-green-200 rounded-xl p-4'>
                  <p className='font-medium'>
                    Todos los servicios de hoy están completados.
                  </p>
                </div>
              ) : (
                <ServicesTodayList
                  assignments={todayAssignments}
                  getTodaySlots={getTodaySlots}
                  isHoliday={isHolidayToday}
                />
              )}
            </div>
          </div>

          {/* 2. Próximos Servicios - Segunda sección */}
          <div className='bg-white rounded-2xl shadow-sm mb-8'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                📅 Próximos Servicios
              </h2>
              <p className='text-gray-600'>
                Planificación de servicios futuros
              </p>
            </div>
            <div className='p-6'>
              <div className='space-y-3'>
                <Link
                  href='/worker-dashboard/tomorrow'
                  className='block hover:bg-gray-100 transition-colors rounded-lg'
                >
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100'>
                    <div>
                      <p className='font-medium text-gray-900'>Mañana</p>
                      <p className='text-sm text-gray-600'>
                        Servicios programados
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-blue-600 font-semibold'>
                        {upcomingServices.tomorrow}
                      </span>
                      <svg
                        className='w-4 h-4 text-gray-400'
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
                    </div>
                  </div>
                </Link>

                <Link
                  href='/worker-dashboard/this-week'
                  className='block hover:bg-gray-100 transition-colors rounded-lg'
                >
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100'>
                    <div>
                      <p className='font-medium text-gray-900'>Esta Semana</p>
                      <p className='text-sm text-gray-600'>Próximos días</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-green-600 font-semibold'>
                        {upcomingServices.thisWeek}
                      </span>
                      <svg
                        className='w-4 h-4 text-gray-400'
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
                    </div>
                  </div>
                </Link>

                <Link
                  href='/worker-dashboard/this-month'
                  className='block hover:bg-gray-100 transition-colors rounded-lg'
                >
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100'>
                    <div>
                      <p className='font-medium text-gray-900'>Este Mes</p>
                      <p className='text-sm text-gray-600'>Vista general</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-purple-600 font-semibold'>
                        {upcomingServices.thisMonth}
                      </span>
                      <svg
                        className='w-4 h-4 text-gray-400'
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
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Acciones Rápidas - Tercera sección */}
          <div className='bg-white rounded-2xl shadow-sm mb-8'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                ⚡ Acciones Rápidas
              </h2>
              <p className='text-gray-600'>
                Acceso directo a funciones principales
              </p>
            </div>
            <div className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <Link href='/worker-dashboard/schedule'>
                  <Button
                    className='w-full h-16 sm:h-14 justify-start px-4 sm:px-6'
                    variant='outline'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='text-xl sm:text-lg'>📋</span>
                      <div className='text-left'>
                        <div className='font-medium text-sm sm:text-base'>
                          Ver Mi Horario
                        </div>
                        <div className='text-xs text-gray-500 hidden sm:block'>
                          Completo
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Button
                  className='w-full h-16 sm:h-14 justify-start px-4 sm:px-6'
                  variant='outline'
                  onClick={() => window.open('tel:+34600000000', '_blank')}
                >
                  <div className='flex items-center space-x-3'>
                    <span className='text-xl sm:text-lg'>📞</span>
                    <div className='text-left'>
                      <div className='font-medium text-sm sm:text-base'>
                        Contactar
                      </div>
                      <div className='text-xs text-gray-500 hidden sm:block'>
                        Coordinación
                      </div>
                    </div>
                  </div>
                </Button>

                <Link href='/worker-dashboard/route'>
                  <Button
                    className='w-full h-16 sm:h-14 justify-start px-4 sm:px-6'
                    variant='outline'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='text-xl sm:text-lg'>🗺️</span>
                      <div className='text-left'>
                        <div className='font-medium text-sm sm:text-base'>
                          Ruta de Hoy
                        </div>
                        <div className='text-xs text-gray-500 hidden sm:block'>
                          Servicios
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href='/worker-dashboard/notes'>
                  <Button
                    className='w-full h-16 sm:h-14 justify-start px-4 sm:px-6'
                    variant='outline'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='text-xl sm:text-lg'>📝</span>
                      <div className='text-left'>
                        <div className='font-medium text-sm sm:text-base'>
                          Notas Rápidas
                        </div>
                        <div className='text-xs text-gray-500 hidden sm:block'>
                          Por servicio
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Tarjetas Informativas - Cuarta sección */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8'>
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

            <div className='bg-white hover:bg-rose-50 active:bg-rose-100 rounded-2xl shadow-lg hover:shadow-xl p-3 md:p-4 lg:p-6 border border-gray-100 hover:border-rose-200 transition-all duration-200'>
              <div className='flex items-center justify-between'>
                <div className='text-left'>
                  <p className='text-xs md:text-sm text-gray-600 mb-1'>
                    Completados Hoy
                  </p>
                  <p className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>
                    {completedTodayIds.size}
                  </p>
                  <p className='text-xs md:text-xs text-rose-600 mt-1'>
                    Registros de finalización
                  </p>
                </div>
                <div className='w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-rose-100 rounded-full flex items-center justify-center'>
                  <span className='text-base md:text-lg lg:text-2xl'>✅</span>
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
