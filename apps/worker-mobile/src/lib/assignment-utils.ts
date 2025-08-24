import { supabase } from './supabase';

export interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  status: string;
  worker_id: string;
  user_id: string;
  users?: {
    name: string;
    surname: string;
    address?: string;
  };
}

export interface FilteredAssignment {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  user_name: string;
  user_address?: string;
  slots: TimeSlotRange[];
}

export interface TimeSlotRange {
  start: string;
  end: string;
}

/**
 * Filtra asignaciones activas para una trabajadora en una fecha específica
 */
export async function getFilteredAssignments(
  workerId: string,
  targetDate: Date,
  includeInactive: boolean = false
): Promise<FilteredAssignment[]> {
  try {
    const targetKey = targetDate.toISOString().split('T')[0];

    // Verificar si la fecha objetivo es festivo
    const { data: holidayData } = await supabase
      .from('holidays')
      .select('id')
      .eq('day', targetDate.getDate())
      .eq('month', targetDate.getMonth() + 1)
      .eq('year', targetDate.getFullYear())
      .maybeSingle();

    const dow = targetDate.getDay();
    const isHoliday = holidayData !== null || dow === 0 || dow === 6;

    console.log(`📅 Filtrado para fecha ${targetKey}:`, {
      diaSemana: dow,
      esFestivo: holidayData !== null,
      esFinde: dow === 0 || dow === 6,
      usarHorarioFestivo: isHoliday,
    });

    // Cargar asignaciones activas
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(
        `
        id,
        assignment_type,
        schedule,
        start_date,
        end_date,
        status,
        worker_id,
        user_id,
        users!inner(name, surname, address)
      `
      )
      .eq('worker_id', workerId)
      .eq('status', 'active')
      .lte('start_date', targetKey)
      .or(`end_date.is.null,end_date.gte.${targetKey}`);

    if (error || !assignments) {
      console.error('❌ Error cargando asignaciones:', error);
      return [];
    }

    console.log(`📋 Asignaciones encontradas:`, {
      total: assignments.length,
      tipos: assignments.map((a) => a.assignment_type),
      asignaciones: assignments.map((a) => ({
        id: a.id,
        tipo: a.assignment_type,
        usuario: a.users?.name,
        fechaInicio: a.start_date,
        fechaFin: a.end_date,
      })),
    });

    // Filtrar asignaciones que deben trabajar en la fecha objetivo
    const filteredAssignments: FilteredAssignment[] = [];

    for (const assignment of assignments) {
      const slots = getTimeSlotsForDate(
        assignment.schedule,
        assignment.assignment_type,
        targetDate,
        isHoliday
      );

      console.log(`🔍 Evaluando asignación ${assignment.id}:`, {
        tipo: assignment.assignment_type,
        usuario: assignment.users?.name,
        slotsEncontrados: slots.length,
        slots: slots,
        usarHorarioFestivo: isHoliday,
      });

      if (slots.length === 0) {
        console.log(
          `❌ Asignación ${assignment.id} sin slots para ${targetKey}`
        );
        continue;
      }

      // Lógica de filtrado mejorada
      const assignmentType = (assignment.assignment_type ?? '').toLowerCase();
      let shouldShow = false;

      if (assignmentType === 'flexible' || assignmentType === 'completa') {
        shouldShow = true; // Estos tipos trabajan todos los días
      } else if (assignmentType === 'laborables') {
        shouldShow = !isHoliday; // Solo días laborables
      } else if (assignmentType === 'festivos') {
        shouldShow = isHoliday; // Solo festivos/fines de semana
      }

      console.log(
        `${shouldShow ? '✅' : '❌'} Asignación ${assignment.id} ${shouldShow ? 'incluida' : 'excluida'}`
      );

      if (shouldShow) {
        filteredAssignments.push({
          id: assignment.id,
          assignment_type: assignment.assignment_type,
          schedule: assignment.schedule,
          start_date: assignment.start_date,
          end_date: assignment.end_date,
          user_name:
            `${assignment.users?.name ?? ''} ${assignment.users?.surname ?? ''}`.trim(),
          user_address: assignment.users?.address,
          slots: slots,
        });
      }
    }

    console.log(`📊 Resultado del filtrado:`, {
      asignacionesOriginales: assignments.length,
      asignacionesFiltradas: filteredAssignments.length,
      asignacionesFinales: filteredAssignments.map((a) => ({
        id: a.id,
        tipo: a.assignment_type,
        usuario: a.user_name,
      })),
    });

    return filteredAssignments;
  } catch (error) {
    console.error('❌ Error en getFilteredAssignments:', error);
    return [];
  }
}

/**
 * Obtiene los slots de tiempo para una fecha específica
 */
export function getTimeSlotsForDate(
  schedule: unknown,
  assignmentType: string,
  targetDate: Date,
  isHoliday?: boolean
): TimeSlotRange[] {
  try {
    const sc =
      typeof schedule === 'string'
        ? (JSON.parse(schedule) as Record<string, unknown>)
        : (schedule as Record<string, unknown>);

    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayKey = dayNames[targetDate.getDay()] ?? 'monday';

    const type = (assignmentType ?? '').toLowerCase();
    const shouldUseHoliday: boolean =
      isHoliday ?? (targetDate.getDay() === 0 || type === 'festivos');

    // Obtener slots del día normal
    const dayConfig = (sc?.[dayKey] as Record<string, unknown>) ?? {};
    const enabled = (dayConfig?.['enabled'] as boolean) ?? true;
    const daySlotsRaw = Array.isArray(dayConfig?.['timeSlots'])
      ? (dayConfig?.['timeSlots'] as unknown[])
      : [];

    const daySlots: TimeSlotRange[] = daySlotsRaw
      .map((slot: unknown) => {
        const s = slot as Record<string, unknown>;
        const start = (s?.['start'] as string | undefined) ?? '';
        const end = (s?.['end'] as string | undefined) ?? '';
        if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
          return { start, end };
        }
        return null;
      })
      .filter((v): v is TimeSlotRange => v !== null);

    // Si debe usar horario festivo o no hay slots del día, buscar slots festivos
    if (shouldUseHoliday || (enabled && daySlots.length === 0)) {
      const holidayConfig =
        (sc?.['holiday_config'] as Record<string, unknown> | undefined) ??
        undefined;
      const holidayFromConfig = Array.isArray(
        holidayConfig?.['holiday_timeSlots']
      )
        ? (holidayConfig?.['holiday_timeSlots'] as unknown[])
        : [];

      const holidayDay = (sc?.['holiday'] as Record<string, unknown>) ?? {};
      const holidayFromDay = Array.isArray(holidayDay?.['timeSlots'])
        ? (holidayDay?.['timeSlots'] as unknown[])
        : [];

      const rawHoliday =
        holidayFromConfig.length > 0 ? holidayFromConfig : holidayFromDay;

      const holidaySlots: TimeSlotRange[] = rawHoliday
        .map((slot: unknown) => {
          const s = slot as Record<string, unknown>;
          const start = (s?.['start'] as string | undefined) ?? '';
          const end = (s?.['end'] as string | undefined) ?? '';
          if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
            return { start, end };
          }
          return null;
        })
        .filter((v): v is TimeSlotRange => v !== null);

      if (holidaySlots.length > 0) {
        console.log(`🎉 Usando slots festivos para ${dayKey}:`, holidaySlots);
        return holidaySlots;
      }
    }

    // Retornar slots del día normal si están habilitados
    if (enabled && daySlots.length > 0) {
      console.log(`📅 Usando slots normales para ${dayKey}:`, daySlots);
      return daySlots;
    }

    return [];
  } catch (error) {
    console.error('❌ Error parsing schedule:', error);
    return [];
  }
}

/**
 * Calcula las horas totales de una lista de slots
 */
export function calculateTotalHours(slots: TimeSlotRange[]): number {
  return slots.reduce((total, slot) => {
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    return total + (endH * 60 + endM - (startH * 60 + startM)) / 60;
  }, 0);
}
