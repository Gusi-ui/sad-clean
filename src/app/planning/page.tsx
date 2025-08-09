'use client';

import { type KeyboardEvent, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useDashboardUrl } from '@/hooks/useDashboardUrl';
import { supabase } from '@/lib/database';
import { type Holiday, getHolidaysForMonth } from '@/lib/holidays-query';
import { logger } from '@/utils/logger';

interface DayTimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: DayTimeSlot[];
}

interface StoredAssignment {
  id: string;
  user_id: string;
  worker_id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date?: string | null;
  status: string;
  notes: string | null;
  user?: { name: string; surname: string };
  worker?: { name: string; surname: string };
}

interface ExpandedEntry {
  assignmentId: string;
  workerName: string;
  userName: string;
  start: string;
  end: string;
  assignmentType: string;
}

interface MonthStats {
  totalAssignments: number;
  totalHours: number;
  activeWorkers: number;
}

type MonthGridCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string | undefined;
  entries: ExpandedEntry[];
};

export default function PlanningPage() {
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(8); // Agosto por defecto
  const [loading, setLoading] = useState<boolean>(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [entriesByDate, setEntriesByDate] = useState<
    Record<string, ExpandedEntry[]>
  >({});
  const [stats, setStats] = useState<MonthStats>({
    totalAssignments: 0,
    totalHours: 0,
    activeWorkers: 0,
  });
  const [showEntryModal, setShowEntryModal] = useState<boolean>(false);
  const [selectedCellDate, setSelectedCellDate] = useState<string>('');
  // Consultas de filtro por texto (mobile-first)
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  const dashboardUrl = useDashboardUrl();

  const firstDayOfMonth = useMemo(
    () => new Date(year, month - 1, 1),
    [year, month]
  );
  const lastDayOfMonth = useMemo(() => new Date(year, month, 0), [year, month]);

  // Helper para formatear clave de fecha en horario LOCAL (evita desfases por UTC)
  const getDateKeyLocal = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper para mostrar día de la semana corto en español (ej. "Lun")
  const getWeekdayShort = (d: Date): string =>
    d
      .toLocaleDateString('es-ES', { weekday: 'short' })
      .replace('.', '')
      .slice(0, 3);

  // Nota: eliminamos opciones predefinidas (selects) y usamos inputs de texto (mobile-first)

  // Aplicar filtros de trabajadora/usuario
  const visibleEntriesByDate = useMemo(() => {
    // Si no hay filtros, mantener el calendario vacío (mejor rendimiento/legibilidad)
    if (selectedWorker.trim() === '' && selectedUser.trim() === '') return {};

    // Si el filtro por trabajadora coincide exactamente con un nombre existente,
    // usamos coincidencia exacta; de lo contrario, coincidencia parcial (includes)
    const allWorkerNames = new Set<string>();
    Object.values(entriesByDate).forEach((list) => {
      list.forEach((e) => {
        const name = e.workerName?.toLowerCase();
        if (name && name.trim() !== '') allWorkerNames.add(name);
      });
    });

    const workerQuery = selectedWorker.trim().toLowerCase();
    const exactWorkerMatch =
      workerQuery !== '' && allWorkerNames.has(workerQuery)
        ? workerQuery
        : undefined;

    const result: Record<string, ExpandedEntry[]> = {};
    Object.entries(entriesByDate).forEach(([key, list]) => {
      result[key] = list.filter((e) => {
        const uq = selectedUser.trim().toLowerCase();
        const okWorker =
          workerQuery === '' ||
          (exactWorkerMatch !== undefined
            ? e.workerName.toLowerCase() === exactWorkerMatch
            : e.workerName.toLowerCase().includes(workerQuery));
        const okUser = uq === '' || e.userName.toLowerCase().includes(uq);
        return okWorker && okUser;
      });
    });
    return result;
  }, [entriesByDate, selectedUser, selectedWorker]);

  // Construir la grilla del mes (6 filas x 7 columnas)
  const monthGrid: MonthGridCell[] = useMemo(() => {
    const start = new Date(firstDayOfMonth);
    const startDay = (start.getDay() + 6) % 7; // 0=Lunes ... 6=Domingo
    start.setDate(start.getDate() - startDay);

    const grid: MonthGridCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = getDateKeyLocal(date);
      const isHoliday: boolean = holidays.some(
        (h) => h.day === date.getDate() && h.month === month && h.year === year
      );
      const holidayName = isHoliday
        ? (holidays.find(
            (h) =>
              h.day === date.getDate() && h.month === month && h.year === year
          )?.name ?? '')
        : undefined;
      grid.push({
        date,
        isCurrentMonth: date.getMonth() === firstDayOfMonth.getMonth(),
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday,
        holidayName,
        entries: visibleEntriesByDate[dateKey] ?? [],
      });
    }
    return grid;
  }, [visibleEntriesByDate, firstDayOfMonth, holidays, month, year]);

  // Utilidad: parsear schedule de la BD en forma segura
  const parseSchedule = (raw: unknown): Record<string, DaySchedule> => {
    if (typeof raw === 'string') {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed !== null && typeof parsed === 'object') {
          return parsed as Record<string, DaySchedule>;
        }
        return {};
      } catch (error: unknown) {
        logger.error('Error parsing assignment schedule:', error);
        return {};
      }
    }
    return (raw as Record<string, DaySchedule>) ?? {};
  };

  // Cargar festivos y asignaciones del mes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Festivos (usamos la tabla existente; los locales deberían estar cargados como type='local')
        const monthHolidays = await getHolidaysForMonth(month, year);
        // eslint-disable-next-line no-console
        console.log(
          'Festivos cargados para agosto 2025:',
          JSON.stringify(monthHolidays, null, 2)
        );

        setHolidays(monthHolidays);

        // Rango de fechas del mes
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        // Asignaciones que intersectan con el mes
        const { data, error } = await supabase
          .from('assignments')
          .select(
            `
            *,
            user:users(name, surname),
            worker:workers(name, surname)
          `
          )
          .lte('start_date', endDate)
          .or(`end_date.is.null,end_date.gte.${startDate}`)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error !== null) {
          logger.error('Error cargando asignaciones para planning:', error);
          setEntriesByDate({});
          setStats({ totalAssignments: 0, totalHours: 0, activeWorkers: 0 });
          return;
        }

        const storedList = (data ?? []) as StoredAssignment[];

        // Expandir a entradas por día del mes
        const byDate: Record<string, ExpandedEntry[]> = {};
        const workerSet = new Set<string>();
        let totalHours = 0;

        for (const a of storedList) {
          const schedule = parseSchedule(a.schedule);
          const scheduleAny = schedule as Record<string, unknown>;
          const holidayConfig = (scheduleAny['holiday_config'] ?? undefined) as
            | {
                has_holiday_service?: boolean;
                holiday_timeSlots?: Array<{
                  id?: string;
                  start?: string;
                  end?: string;
                }>;
              }
            | undefined;
          const userName =
            `${a.user?.name ?? ''} ${a.user?.surname ?? ''}`.trim() ||
            'Sin nombre';
          const workerName =
            `${a.worker?.name ?? ''} ${a.worker?.surname ?? ''}`.trim() ||
            'Sin nombre';
          if (workerName !== '') workerSet.add(workerName);

          // Iterar días del mes
          for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            // Crear fecha en zona horaria local para evitar problemas de UTC
            const date = new Date(year, month - 1, d, 12, 0, 0); // Mediodía para evitar problemas de zona horaria
            const dateKey = getDateKeyLocal(date);

            // Rango de asignación
            const startsOnOrBefore = new Date(a.start_date) <= date;
            const endsOnOrAfter =
              a.end_date === null ||
              a.end_date === undefined ||
              new Date(a.end_date) >= date;
            if (!startsOnOrBefore || !endsOnOrAfter) continue;

            // Día de semana
            const weekDayIndex = date.getDay(); // 0=Domingo ... 6=Sábado
            const dayKeyMap: Record<number, string> = {
              0: 'sunday',
              1: 'monday',
              2: 'tuesday',
              3: 'wednesday',
              4: 'thursday',
              5: 'friday',
              6: 'saturday',
            };
            const dayKey = dayKeyMap[weekDayIndex] ?? 'monday';

            // Determinar si es festivo o fin de semana y filtrar por tipo de asignación
            const isWeekend = weekDayIndex === 0 || weekDayIndex === 6;
            const isHoliday = monthHolidays.some(
              (h) =>
                h.day === date.getDate() && h.month === month && h.year === year
            );
            const onHolidayContext = isHoliday || isWeekend;

            const type = a.assignment_type;
            const allowedOnThisDay = onHolidayContext
              ? type === 'festivos' ||
                type === 'flexible' ||
                type === 'completa'
              : type === 'laborables' ||
                type === 'flexible' ||
                type === 'completa';

            if (!allowedOnThisDay) {
              continue;
            }
            // Determinar los tramos a usar según el contexto
            let slots: DayTimeSlot[] = [];
            if (
              onHolidayContext &&
              holidayConfig?.has_holiday_service === true
            ) {
              const rawSlots = holidayConfig.holiday_timeSlots ?? [];
              slots = rawSlots.map((s, idx) => {
                const safeId =
                  typeof s.id === 'string' ? s.id : `holiday-${idx + 1}`;
                const safeStart =
                  typeof s.start === 'string' ? s.start : '08:00';
                const safeEnd = typeof s.end === 'string' ? s.end : '16:00';
                return { id: safeId, start: safeStart, end: safeEnd };
              });
            } else {
              const dayScheduleRaw = schedule?.[dayKey];
              let daySchedule: DaySchedule | undefined = undefined;
              if (
                dayScheduleRaw !== null &&
                dayScheduleRaw !== undefined &&
                typeof dayScheduleRaw === 'object'
              ) {
                daySchedule = dayScheduleRaw as unknown as DaySchedule;
              }
              if (daySchedule === undefined || daySchedule.enabled !== true) {
                continue;
              }
              slots = Array.isArray(daySchedule.timeSlots)
                ? (daySchedule.timeSlots as unknown[]).map((s: unknown) => {
                    const slot = s as Partial<DayTimeSlot>;
                    const safeId =
                      typeof slot.id === 'string' ? slot.id : `${dayKey}-1`;
                    const safeStart =
                      typeof slot.start === 'string' ? slot.start : '08:00';
                    const safeEnd =
                      typeof slot.end === 'string' ? slot.end : '16:00';
                    const result: DayTimeSlot = {
                      id: safeId,
                      start: safeStart,
                      end: safeEnd,
                    };
                    return result;
                  })
                : [];
            }
            for (const slot of slots) {
              const entry: ExpandedEntry = {
                assignmentId: a.id,
                workerName,
                userName,
                start: slot.start,
                end: slot.end,
                assignmentType: a.assignment_type,
              };
              byDate[dateKey] ??= [];
              byDate[dateKey].push(entry);

              // Calcular horas del tramo
              const startDateTime = new Date(`2000-01-01T${slot.start}`);
              const endDateTime = new Date(`2000-01-01T${slot.end}`);
              const hours =
                (endDateTime.getTime() - startDateTime.getTime()) /
                (1000 * 60 * 60);
              totalHours += hours;
            }
          }
        }

        setEntriesByDate(byDate);
        setStats({
          totalAssignments: Object.values(byDate).reduce(
            (acc, list) => acc + list.length,
            0
          ),
          totalHours: Number(totalHours.toFixed(1)),
          activeWorkers: workerSet.size,
        });
      } catch (error: unknown) {
        logger.error('Error cargando datos del planning:', error);
        setEntriesByDate({});
        setStats({ totalAssignments: 0, totalHours: 0, activeWorkers: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadData().catch((error: unknown) => {
      logger.error('Unhandled error loading planning:', error);
      setLoading(false);
    });
  }, [firstDayOfMonth, lastDayOfMonth, month, year]);

  const formatMonthTitle = (date: Date): string => {
    const monthName = date
      .toLocaleDateString('es-ES', { month: 'long' })
      .replace(' de', '');
    const yearNum = date.getFullYear();
    return `${monthName} ${yearNum}`;
  };

  // Estilo visual para entradas según tipo de asignación
  const getEntryStyle = (
    type: string
  ): { container: string; badge?: string } => {
    switch (type) {
      case 'laborables':
        return {
          container:
            'border-l-4 border-blue-500 bg-blue-50/70 hover:bg-blue-50',
        };
      case 'festivos':
        return {
          container:
            'border-l-4 border-orange-500 bg-orange-50/70 hover:bg-orange-50',
        };
      case 'flexible':
        return {
          container:
            'border-l-4 border-purple-500 bg-purple-50/70 hover:bg-purple-50',
        };
      default:
        return {
          container:
            'border-l-4 border-gray-400 bg-gray-50/70 hover:bg-gray-50',
        };
    }
  };

  const handlePrevMonth = () => {
    const newMonth = month - 1;
    if (newMonth < 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = month + 1;
    if (newMonth > 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth(newMonth);
    }
  };

  const handleOpenCell = (dateKey: string) => {
    setSelectedCellDate(dateKey);
    setShowEntryModal(true);
  };

  const closeModals = () => {
    setShowEntryModal(false);
    setSelectedCellDate('');
  };

  return (
    <ProtectedRoute>
      <div className='bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen flex flex-col'>
        {/* Header - Visible en todos los dispositivos */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
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
                      id='mobilePlanningLogoGradient'
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
                    fill='url(#mobilePlanningLogoGradient)'
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
              href={dashboardUrl}
              className='flex items-center text-gray-600 hover:text-gray-900 transition-colors space-x-2'
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
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              <span className='text-sm font-medium'>Volver al Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Contenido Principal */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex-1'>
          {/* Header Desktop */}
          <div className='hidden lg:block mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  📅 Planificación Mensual
                </h1>
                <p className='text-gray-600 text-lg'>
                  Gestiona la planificación de servicios SAD
                </p>
              </div>
            </div>
          </div>

          {/* Header Mobile */}
          <div className='lg:hidden mb-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              📅 Planificación Mensual
            </h1>
            <p className='text-gray-600 text-sm'>
              Gestiona la planificación de servicios SAD
            </p>
          </div>

          {/* Month Selector */}
          <div className='mb-6'>
            <Card className='p-4 lg:p-6'>
              <div className='flex flex-col lg:flex-row lg:flex-nowrap items-center justify-between gap-4'>
                <div className='flex items-center space-x-2 lg:space-x-4 h-10 flex-none'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handlePrevMonth}
                    className='text-xs lg:text-sm h-10'
                  >
                    ← Mes Anterior
                  </Button>
                  <h2 className='text-base lg:text-lg font-semibold text-gray-900 text-center flex items-center h-10'>
                    {formatMonthTitle(firstDayOfMonth)}
                  </h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleNextMonth}
                    className='text-xs lg:text-sm h-10'
                  >
                    Mes Siguiente →
                  </Button>
                </div>
                <div className='w-full lg:flex-1 lg:min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:flex lg:space-x-2 lg:items-center'>
                  {/* Input Trabajadora - sin label visible, con placeholder */}
                  <input
                    id='filter-worker'
                    aria-label='Buscar trabajadora'
                    type='text'
                    className='w-full px-3 py-2 h-10 border border-gray-400 rounded-md placeholder-gray-300 bg-white text-gray-900'
                    placeholder='Buscar trabajadora'
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                  />
                  {/* Input Usuario - sin label visible, con placeholder */}
                  <input
                    id='filter-user'
                    aria-label='Buscar usuario'
                    type='text'
                    className='w-full px-3 py-2 h-10 border border-gray-400 rounded-md placeholder-gray-300 bg-white text-gray-900'
                    placeholder='Buscar usuario'
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-10'
                    onClick={() => {
                      setSelectedWorker('');
                      setSelectedUser('');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                  {/* Botón Nueva Entrada oculto de momento */}
                </div>
              </div>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando planificación...</p>
            </div>
          )}

          {/* Month Grid */}
          {!loading && (
            <div className='mb-8'>
              {/* Cabecera de días solo en desktop grande */}
              <div className='hidden lg:grid grid-cols-7 gap-2 sm:gap-3 mb-2'>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                  <div
                    key={d}
                    className='text-center text-sm font-semibold text-gray-700'
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid responsive mobile-first */}
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3'>
                {monthGrid.map((cell, idx) => {
                  const dateKey = getDateKeyLocal(cell.date);
                  const headerClasses = cell.isCurrentMonth
                    ? 'text-gray-900'
                    : 'text-gray-400';
                  const borderHighlight =
                    cell.isHoliday || cell.isWeekend
                      ? 'border-red-300'
                      : 'border-gray-200';
                  const todayRing = cell.isToday ? 'ring-2 ring-blue-500' : '';
                  return (
                    <Card
                      key={idx}
                      role='button'
                      tabIndex={0}
                      aria-label={`Día ${cell.date.getDate()} ${cell.isHoliday ? `festivo ${cell.holidayName ?? ''}` : ''}`}
                      className={`p-2 sm:p-3 border ${borderHighlight} bg-white min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 ${todayRing}`}
                      onClick={() => handleOpenCell(dateKey)}
                      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleOpenCell(dateKey);
                      }}
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          {/* Etiqueta de día de la semana en móvil/tablet */}
                          <span className='lg:hidden inline-block text-[10px] font-semibold text-gray-700 bg-gray-100 rounded px-1.5 py-0.5'>
                            {getWeekdayShort(cell.date)}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium ${headerClasses}`}
                          >
                            {cell.date.getDate()}
                          </span>
                        </div>
                        {cell.isHoliday && (
                          <span
                            className='text-[10px] sm:text-xs text-red-600 font-medium'
                            title={cell.holidayName}
                          >
                            🎉
                          </span>
                        )}
                      </div>
                      <div className='space-y-1 max-h-36 sm:max-h-40 overflow-y-auto pr-0.5'>
                        {(cell.entries ?? []).slice(0, 4).map((e, i) => (
                          <div
                            key={`${dateKey}-${i}`}
                            className={`rounded px-1.5 py-1 ${getEntryStyle(e.assignmentType).container}`}
                          >
                            <div className='text-[10px] sm:text-[11px] font-medium text-gray-700 truncate'>
                              {e.workerName}
                            </div>
                            <div className='flex items-center gap-1 text-[10px] sm:text-[11px] text-blue-700 font-semibold'>
                              <span
                                className='hidden md:inline'
                                aria-hidden='true'
                              >
                                ⏰
                              </span>
                              <span>
                                {e.start}–{e.end}
                              </span>
                            </div>
                            <div className='text-[10px] sm:text-[11px] text-gray-700 truncate'>
                              {e.userName}
                            </div>
                          </div>
                        ))}
                        {cell.entries.length > 4 && (
                          <button
                            type='button'
                            className='w-full text-[10px] sm:text-xs text-blue-700 hover:underline text-left'
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleOpenCell(dateKey);
                            }}
                          >
                            Ver {cell.entries.length - 4} más
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Schedule - Tablet Layout (oculto temporalmente en modo mensual) */}
          {/* !loading && (
            <div className='hidden md:block lg:hidden mb-8'>
              <div className='grid grid-cols-2 gap-4'>
                {weekDates.map((date, index) => {
                  const dayAssignments = getAssignmentsForDate(date);
                  return (
                    <Card
                      key={index}
                      className='p-4 shadow-lg hover:shadow-xl transition-all duration-200'
                    >
                      <div className='text-center mb-4'>
                        <h3 className='font-semibold text-gray-900'>
                          {formatWeekday(date)}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {formatDate(date)}
                        </p>
                      </div>

                      {dayAssignments.length > 0 ? (
                        <div className='space-y-2'>
                          {dayAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`p-2 rounded border-l-4 ${getAssignmentColor(assignment.type)} cursor-pointer hover:shadow-md transition-shadow`}
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              <div className='flex items-center justify-between mb-1'>
                                <p className='text-xs font-medium truncate'>
                                  {assignment.workerName}
                                </p>
                                <span
                                  className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                                >
                                  {assignment.status === 'confirmed'
                                    ? '✓'
                                    : assignment.status === 'completed'
                                      ? '✓'
                                      : assignment.status === 'cancelled'
                                        ? '✗'
                                        : '⏳'}
                                </span>
                              </div>
                              <p className='text-xs text-gray-700 truncate'>
                                {assignment.userName} - {assignment.hours}h
                              </p>
                              {assignment.type === 'urgent' && (
                                <span className='inline-block mt-1 text-xs text-red-700 font-medium'>
                                  🚨
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-4'>
                          <div className='text-2xl mb-1'>📅</div>
                          <p className='text-xs text-gray-500'>
                            Sin asignaciones
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) */}

          {/* Weekly Schedule - Desktop Layout (oculto temporalmente en modo mensual) */}
          {/* !loading && (
            <div className='hidden lg:grid grid-cols-7 gap-4 mb-8'>
              {weekDates.map((date, index) => {
                const dayAssignments = getAssignmentsForDate(date);
                return (
                  <Card key={index} className='p-4'>
                    <div className='text-center mb-4'>
                      <h3 className='font-semibold text-gray-900'>
                        {formatWeekday(date)}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {formatDate(date)}
                      </p>
                    </div>

                    {dayAssignments.length > 0 ? (
                      <div className='space-y-2'>
                        {dayAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={`p-2 rounded border-l-4 ${getAssignmentColor(assignment.type)} cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={() => handleViewAssignment(assignment)}
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <p className='text-xs font-medium truncate'>
                                {assignment.workerName}
                              </p>
                              <span
                                className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
                              >
                                {assignment.status === 'confirmed'
                                  ? '✓'
                                  : assignment.status === 'completed'
                                    ? '✓'
                                    : assignment.status === 'cancelled'
                                      ? '✗'
                                      : '⏳'}
                              </span>
                            </div>
                            <p className='text-xs text-gray-700 truncate'>
                              {assignment.userName} - {assignment.hours}h
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-4'>
                        <div className='text-2xl mb-1'>📅</div>
                        <p className='text-xs text-gray-500'>
                          Sin asignaciones
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) */}

          {/* Summary Stats */}
          {!loading && (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card className='p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>👥</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Trabajadores Activos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.activeWorkers}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏰</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Horas Programadas
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalHours}h
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>📋</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Asignaciones
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalAssignments}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏳</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Pendientes
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      {stats.totalAssignments}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!loading && Object.keys(entriesByDate).length === 0 && (
            <Card className='p-8 text-center'>
              <div className='text-6xl mb-4'>📅</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay asignaciones programadas este mes
              </h3>
              <p className='text-gray-600 mb-4'>
                Comienza creando tu primera asignación para este mes
              </p>
              <Button
                onClick={() => setShowEntryModal(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                ➕ Nueva Entrada
              </Button>
            </Card>
          )}
        </div>

        {/* Entries Modal */}
        <Modal
          isOpen={showEntryModal}
          onClose={closeModals}
          title='Entradas del día'
        >
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              {selectedCellDate
                ? new Date(selectedCellDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </p>
            <div className='space-y-2'>
              {(entriesByDate[selectedCellDate ?? ''] ?? []).map((e, idx) => (
                <Card key={`${selectedCellDate}-${idx}`} className='p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-sm font-semibold text-gray-900'>
                        {e.workerName}
                      </div>
                      <div className='text-xs text-gray-600'>{e.userName}</div>
                    </div>
                    <div className='text-sm font-medium text-gray-800'>
                      {e.start}–{e.end}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className='flex justify-end'>
              <Button variant='outline' onClick={closeModals}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Assignment Modal (no usado en vista mensual actual) */}

        {/* Footer */}
        <footer className='border-t border-gray-200 bg-white py-8 mt-auto mb-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2 font-medium'>
                © 2025 SAD - Sistema de Gestión de Servicios Asistenciales
                Domiciliarios
              </p>
              <p className='text-xs text-gray-500'>
                Hecho con mucho ❤️ por{' '}
                <span className='font-bold text-gray-700'>Gusi</span>
              </p>
            </div>
          </div>
        </footer>

        {/* Navegación Móvil */}
        <Navigation variant='mobile' />
      </div>
    </ProtectedRoute>
  );
}
