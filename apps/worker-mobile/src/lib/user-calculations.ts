// Funciones de cálculo de balance para la aplicación móvil
// Adaptado desde src/lib/user-calculations.ts
import { supabase } from './supabase';

export interface UserMonthlyBalance {
  userId: string;
  month: number; // 1-12
  year: number;
  assignedMonthlyHours: number; // desde perfil del usuario (monthly_assigned_hours)
  theoreticalMonthlyHours: number; // estimación a partir de asignaciones
  difference: number; // theoretical - assigned; >0 exceso, <0 defecto
  laborablesMonthlyHours?: number;
  holidaysMonthlyHours?: number;
}

export interface WorkerUserMonthlyBalanceRow {
  userId: string;
  userName: string;
  userSurname: string;
  assignedMonthlyHours: number; // desde perfil del usuario
  laborablesHours: number;
  holidaysHours: number;
  totalHours: number; // laborables + holidays
  difference: number; // totalHours - assignedMonthlyHours
}

interface ParsedSchedule {
  weekdayHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  holidayHoursPerDay: number;
}

const getMonthDateRange = (year: number, month: number) => {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  return { start, end, daysInMonth };
};

/**
 * Calcula las horas de diferencia entre dos tiempos en formato HH:MM
 * @param start - Hora de inicio (ej: "09:00")
 * @param end - Hora de fin (ej: "13:00")
 * @returns Diferencia en horas (ej: 4)
 */
const calculateHoursFromTimeRange = (start: string, end: string): number => {
  try {
    // Validar formato básico
    if (
      !start ||
      !end ||
      typeof start !== 'string' ||
      typeof end !== 'string'
    ) {
      return 0;
    }

    // Parsear horas y minutos
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    // Validar que son números válidos
    if (
      isNaN(startHour) ||
      isNaN(startMin) ||
      isNaN(endHour) ||
      isNaN(endMin)
    ) {
      return 0;
    }

    // Convertir a minutos desde medianoche
    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    // Calcular diferencia en minutos
    let diffMinutes = endTotalMinutes - startTotalMinutes;

    // Manejar caso de que el fin sea al día siguiente (ej: 23:00 a 01:00)
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Agregar 24 horas en minutos
    }

    // Convertir a horas (decimal)
    const hours = diffMinutes / 60;

    return hours > 0 ? hours : 0;
  } catch (error) {
    console.error('Error calculando horas desde rango de tiempo:', error);
    return 0;
  }
};

const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('monthly_assigned_hours')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

const getHolidaysForMonth = async (month: number, year: number) => {
  const { data, error } = await supabase
    .from('holidays')
    .select('day')
    .eq('month', month)
    .eq('year', year);

  if (error || !data) return [];
  return data;
};

const parseAssignmentSchedule = (schedule: unknown): ParsedSchedule => {
  const defaultSchedule: ParsedSchedule = {
    weekdayHours: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
    holidayHoursPerDay: 0,
  };

  if (schedule === null || schedule === undefined) return defaultSchedule;

  try {
    const parsed =
      typeof schedule === 'string' ? JSON.parse(schedule) : schedule;

    if (typeof parsed !== 'object') return defaultSchedule;

    const weekdayHours = { ...defaultSchedule.weekdayHours };
    let holidayHoursPerDay = 0;

    // Nueva lógica: parsear estructura real de la BD
    // Formato: { "monday": {"enabled": true, "timeSlots": [...]}, ... }
    const dayNames = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    for (const dayName of dayNames) {
      if (parsed[dayName] && typeof parsed[dayName] === 'object') {
        const dayData = parsed[dayName];

        if (dayData.enabled && Array.isArray(dayData.timeSlots)) {
          // Debug: mostrar estructura real de timeSlots
          console.log(
            `🔍 TimeSlots para ${dayName}:`,
            JSON.stringify(dayData.timeSlots, null, 2)
          );

          // Sumar las horas de todos los timeSlots del día
          let totalHours = 0;
          for (const slot of dayData.timeSlots) {
            console.log('🔍 Procesando slot:', slot);

            // Calcular horas desde start y end si no existe slot.hours
            if (slot.hours && typeof slot.hours === 'number') {
              totalHours += slot.hours;
              console.log(`✅ Slot con horas explícitas: ${slot.hours}h`);
            } else if (slot.start && slot.end) {
              const hours = calculateHoursFromTimeRange(slot.start, slot.end);
              if (hours > 0) {
                totalHours += hours;
                console.log(
                  `✅ Horas calculadas desde ${slot.start}-${slot.end}: ${hours}h`
                );
              } else {
                console.log(
                  `❌ Error calculando horas desde ${slot.start}-${slot.end}`
                );
              }
            } else {
              console.log('❌ Slot sin horas válidas ni horarios:', slot);
            }
          }
          weekdayHours[dayName as keyof typeof weekdayHours] = totalHours;
          console.log(`📊 Total horas para ${dayName}: ${totalHours}`);
        }
      }
    }

    // Procesar holiday/festivos
    if (parsed.holiday && typeof parsed.holiday === 'object') {
      const holidayData = parsed.holiday;
      console.log('🔍 Holiday data:', JSON.stringify(holidayData, null, 2));
      if (holidayData.enabled && Array.isArray(holidayData.timeSlots)) {
        for (const slot of holidayData.timeSlots) {
          console.log('🔍 Holiday slot:', slot);
          if (slot.hours && typeof slot.hours === 'number') {
            holidayHoursPerDay += slot.hours;
            console.log(`✅ Holiday slot con horas explícitas: ${slot.hours}h`);
          } else if (slot.start && slot.end) {
            const hours = calculateHoursFromTimeRange(slot.start, slot.end);
            if (hours > 0) {
              holidayHoursPerDay += hours;
              console.log(
                `✅ Holiday horas calculadas desde ${slot.start}-${slot.end}: ${hours}h`
              );
            } else {
              console.log(
                `❌ Error calculando holiday horas desde ${slot.start}-${slot.end}`
              );
            }
          } else {
            console.log('❌ Holiday slot sin horas válidas ni horarios:', slot);
          }
        }
      }
    }

    // También revisar holiday_config por si fuera esa la estructura
    if (parsed.holiday_config && typeof parsed.holiday_config === 'object') {
      const holidayConfig = parsed.holiday_config;
      console.log(
        '🔍 Holiday config data:',
        JSON.stringify(holidayConfig, null, 2)
      );
      if (
        holidayConfig.has_holiday_service &&
        Array.isArray(holidayConfig.holiday_timeSlots)
      ) {
        for (const slot of holidayConfig.holiday_timeSlots) {
          console.log('🔍 Holiday config slot:', slot);
          if (slot.hours && typeof slot.hours === 'number') {
            holidayHoursPerDay += slot.hours;
            console.log(
              `✅ Holiday config con horas explícitas: ${slot.hours}h`
            );
          } else if (slot.start && slot.end) {
            const hours = calculateHoursFromTimeRange(slot.start, slot.end);
            if (hours > 0) {
              holidayHoursPerDay += hours;
              console.log(
                `✅ Holiday config horas calculadas desde ${slot.start}-${slot.end}: ${hours}h`
              );
            } else {
              console.log(
                `❌ Error calculando holiday config horas desde ${slot.start}-${slot.end}`
              );
            }
          } else {
            console.log(
              '❌ Holiday config slot sin horas válidas ni horarios:',
              slot
            );
          }
        }
      }
    }

    // Fallback: intentar estructura antigua por compatibilidad
    if (parsed.weekdayHours && typeof parsed.weekdayHours === 'object') {
      Object.keys(weekdayHours).forEach((day) => {
        const value = parsed.weekdayHours[day];
        if (typeof value === 'number' && !isNaN(value)) {
          weekdayHours[day as keyof typeof weekdayHours] = value;
        }
      });
    }

    if (
      parsed.holidayHoursPerDay &&
      typeof parsed.holidayHoursPerDay === 'number'
    ) {
      holidayHoursPerDay = parsed.holidayHoursPerDay;
    }

    return { weekdayHours, holidayHoursPerDay };
  } catch (error) {
    console.error('Error parsing assignment schedule:', error);
    return defaultSchedule;
  }
};

export const computeUserMonthlyBalance = async (
  userId: string,
  year: number,
  month: number
): Promise<UserMonthlyBalance | null> => {
  const { start, end, daysInMonth } = getMonthDateRange(year, month);

  // 1) Cargar usuario para obtener horas asignadas mensuales
  const user = await getUserById(userId);
  if (user === null || user === undefined) {
    return null;
  }

  const assignedMonthlyHours = user.monthly_assigned_hours ?? 0;

  // 2) Cargar festivos del mes
  const holidays = await getHolidaysForMonth(month, year);
  const holidayDays = new Set(holidays.map((h) => h.day));

  // 3) ✅ CRÍTICO: Cargar TODAS las asignaciones del usuario (sin filtrar por worker_id)
  // Esto permite calcular el balance real del usuario sumando todas las trabajadoras
  const { data: rows, error } = await supabase
    .from('assignments')
    .select(
      'assignment_type, schedule, start_date, end_date, status, worker_id'
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('start_date', end)
    .or(`end_date.is.null,end_date.gte.${start}`);

  if (error !== null) {
    console.error(
      '❌ Error cargando asignaciones para usuario',
      userId,
      ':',
      error
    );
    return {
      userId,
      year,
      month,
      assignedMonthlyHours,
      theoreticalMonthlyHours: 0,
      difference: 0 - assignedMonthlyHours,
    };
  }

  type Row = {
    assignment_type: string;
    schedule: unknown;
    start_date: string;
    end_date: string | null;
    status: string;
    worker_id: string;
  };

  const activeAssignments: Row[] = Array.isArray(rows) ? (rows as Row[]) : [];

  console.log(`🔍 TODAS las asignaciones para usuario ${userId}:`, {
    totalAsignaciones: activeAssignments.length,
    trabajadoras: Array.from(
      new Set(activeAssignments.map((a) => a.worker_id))
    ),
    tipos: activeAssignments.map((a) => a.assignment_type),
  });

  // 4) Sumar horas por día del mes según tipo de día y tipo de asignación
  let theoreticalMonthlyHours = 0;
  let laborablesMonthlyHours = 0;
  let holidaysMonthlyHours = 0;

  // Contadores para debug
  let laborablesDays = 0;
  let holidaysDays = 0;

  console.log(
    `📅 Calculando balance para ${year}-${month} (${daysInMonth} días)`
  );
  console.log(
    `🎯 Festivos del mes:`,
    Array.from(holidayDays).sort((a, b) => a - b)
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay(); // 0=domingo ... 6=sábado
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidayDays.has(day);
    const isHolidayContext = isWeekend || isHoliday;

    let dailyHours = 0;
    let dailyLaborables = 0;
    let dailyHolidays = 0;

    for (const a of activeAssignments) {
      const parsed = parseAssignmentSchedule(a.schedule);
      const type = a.assignment_type as
        | 'laborables'
        | 'festivos'
        | 'flexible'
        | 'completa'
        | 'personalizada';

      if (type === 'laborables' && !isHolidayContext && dow >= 1 && dow <= 5) {
        const weekdayMap = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ] as const;
        const key = weekdayMap[dow];
        const add =
          parsed.weekdayHours[key as keyof ParsedSchedule['weekdayHours']];
        dailyHours += add;
        dailyLaborables += add;
      }

      if (type === 'festivos' && isHolidayContext) {
        dailyHours += parsed.holidayHoursPerDay;
        dailyHolidays += parsed.holidayHoursPerDay;
      }
    }

    // Log detallado solo si hay horas
    if (dailyHours > 0) {
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dow];
      console.log(
        `📆 Día ${day} (${dayName}): ${dailyLaborables}h laborables + ${dailyHolidays}h festivos = ${dailyHours}h total`
      );

      if (dailyLaborables > 0) laborablesDays++;
      if (dailyHolidays > 0) holidaysDays++;
    }

    theoreticalMonthlyHours += dailyHours;
    laborablesMonthlyHours += dailyLaborables;
    holidaysMonthlyHours += dailyHolidays;
  }

  console.log(`📊 Resumen cálculo:`);
  console.log(`   - Días laborables trabajados: ${laborablesDays}`);
  console.log(`   - Días festivos trabajados: ${holidaysDays}`);
  console.log(`   - Total horas laborables: ${laborablesMonthlyHours}`);
  console.log(`   - Total horas festivos: ${holidaysMonthlyHours}`);
  console.log(`   - Total teórico: ${theoreticalMonthlyHours}`);
  console.log(`   - Horas asignadas: ${assignedMonthlyHours}`);
  console.log(
    `   - Diferencia: ${theoreticalMonthlyHours - assignedMonthlyHours}`
  );

  return {
    userId,
    year,
    month,
    assignedMonthlyHours,
    theoreticalMonthlyHours,
    difference: theoreticalMonthlyHours - assignedMonthlyHours,
    laborablesMonthlyHours,
    holidaysMonthlyHours,
  };
};

export const computeWorkerUsersMonthlyBalances = async (
  workerId: string,
  year: number,
  month: number
): Promise<WorkerUserMonthlyBalanceRow[]> => {
  const { start, end } = getMonthDateRange(year, month);

  // 1) Obtener usuarios únicos asignados a esta trabajadora en el mes
  const { data: assignmentRows, error: assignmentError } = await supabase
    .from('assignments')
    .select(
      `
      user_id,
      users!inner(name, surname, monthly_assigned_hours)
    `
    )
    .eq('worker_id', workerId)
    .eq('status', 'active')
    .lte('start_date', end)
    .or(`end_date.is.null,end_date.gte.${start}`);

  if (assignmentError || !assignmentRows) {
    console.error(
      '❌ Error cargando asignaciones del worker:',
      assignmentError
    );
    return [];
  }

  // 2) Obtener usuarios únicos y sus datos básicos
  const userMap = new Map<
    string,
    { name: string; surname: string; assigned: number }
  >();

  for (const row of assignmentRows) {
    const userId = row.user_id;
    if (!userMap.has(userId)) {
      const userData = row.users as any;
      userMap.set(userId, {
        name: userData?.name ?? '',
        surname: userData?.surname ?? '',
        assigned: userData?.monthly_assigned_hours ?? 0,
      });
    }
  }

  console.log(`🔍 Usuarios únicos para trabajadora ${workerId}:`, {
    total: userMap.size,
    usuarios: Array.from(userMap.keys()),
  });

  // 3) ✅ CRÍTICO: Para cada usuario, calcular balance sumando TODAS sus trabajadoras
  const rowsOut: WorkerUserMonthlyBalanceRow[] = [];

  // Usar Array.from para evitar problemas de iteración
  const userEntries = Array.from(userMap.entries());

  for (const [userId, userInfo] of userEntries) {
    console.log(`🔍 Calculando balance completo para usuario ${userId}...`);

    // Usar computeUserMonthlyBalance que ya suma todas las trabajadoras
    const userBalance = await computeUserMonthlyBalance(userId, year, month);

    if (userBalance) {
      rowsOut.push({
        userId: userId,
        userName: userInfo.name,
        userSurname: userInfo.surname,
        assignedMonthlyHours: userBalance.assignedMonthlyHours,
        laborablesHours: userBalance.laborablesMonthlyHours ?? 0,
        holidaysHours: userBalance.holidaysMonthlyHours ?? 0,
        totalHours: userBalance.theoreticalMonthlyHours,
        difference: userBalance.difference,
      });

      console.log(`✅ Balance para ${userInfo.name}:`, {
        asignadas: userBalance.assignedMonthlyHours,
        teoricas: userBalance.theoreticalMonthlyHours,
        laborables: userBalance.laborablesMonthlyHours,
        festivos: userBalance.holidaysMonthlyHours,
        diferencia: userBalance.difference,
      });
    } else {
      console.error(`❌ No se pudo calcular balance para usuario ${userId}`);
    }
  }

  // 4) Ordenar por nombre
  rowsOut.sort((a, b) =>
    `${a.userName} ${a.userSurname}`.localeCompare(
      `${b.userName} ${b.userSurname}`
    )
  );

  console.log(
    `📊 Resumen final: ${rowsOut.length} usuarios con balance calculado`
  );

  return rowsOut;
};
