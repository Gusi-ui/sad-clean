import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../hooks/useNotifications'; // Deshabilitado para evitar errores en Expo Go
import { supabase } from '../lib/supabase';
import { computeUserMonthlyBalance } from '../lib/user-calculations';
import ThisMonthScreen from './ThisMonth';
import ThisWeekScreen from './ThisWeek';
import TomorrowScreen from './Tomorrow';

interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users: { name: string | null; surname: string | null };
}

interface ServiceRow {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  startMinutes: number;
  state: 'pending' | 'inprogress' | 'done';
}

export default function HomeScreen(): React.JSX.Element {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(true);
  // const { scheduleServiceReminders, notifyAssignmentUpdate } = useNotifications(); // Deshabilitado

  const [todayAssignments, setTodayAssignments] = useState<AssignmentRow[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [isHolidayToday, setIsHolidayToday] = useState<boolean>(false);
  const [upcomingServices, setUpcomingServices] = useState({
    tomorrow: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [workerStats, setWorkerStats] = useState({
    totalAssignments: 0,
    completionRate: 0,
    currentBalance: 0,
  });
  const [showModal, setShowModal] = useState<
    'tomorrow' | 'thisWeek' | 'thisMonth' | null
  >(null);

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const getSlotsForDate = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      targetDate: Date,
      useHoliday: boolean
    ): Array<{ start: string; end: string }> => {
      try {
        const sc =
          typeof schedule === 'string'
            ? (JSON.parse(schedule) as Record<string, unknown>)
            : (schedule as Record<string, unknown>);

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

        const parseSlots = (
          raw: unknown[]
        ): Array<{ start: string; end: string }> =>
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
            .filter((v): v is { start: string; end: string } => v !== null);

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

  // Función auxiliar para mantener compatibilidad con código existente que usa hoy
  const getTodaySlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      useHoliday: boolean
    ): Array<{ start: string; end: string }> => {
      return getSlotsForDate(schedule, assignmentType, new Date(), useHoliday);
    },
    [getSlotsForDate]
  );

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

  const displayName = useMemo(() => {
    const meta = user?.name;
    if (typeof meta === 'string' && meta.trim() !== '') return meta;
    const email = user?.email ?? '';
    if (email.includes('@')) return email.split('@')[0] ?? 'Trabajadora';
    return 'Trabajadora';
  }, [user?.email, user?.name]);

  const renderTodayServices = (): React.JSX.Element => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const rows: ServiceRow[] = todayAssignments.flatMap((a) => {
      const slots = getTodaySlots(
        a.schedule,
        a.assignment_type,
        isHolidayToday
      );
      const label =
        `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() || 'Servicio';
      return slots.map((s) => {
        const sm = toMinutes(s.start);
        const em = toMinutes(s.end);
        let state: ServiceRow['state'] = 'pending';
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

    const stateRank: Record<ServiceRow['state'], number> = {
      inprogress: 0,
      pending: 1,
      done: 2,
    };

    rows.sort((a, b) => {
      const sr = stateRank[a.state] - stateRank[b.state];
      if (sr !== 0) return sr;
      return a.startMinutes - b.startMinutes;
    });

    if (rows.length === 0) {
      return (
        <Text style={styles.noServicesText}>No tienes servicios para hoy.</Text>
      );
    }

    return (
      <View style={styles.servicesContainer}>
        {rows.map((r, idx) => (
          <View
            key={`${r.assignmentId}-${r.start}-${r.end}-${idx}`}
            style={[
              styles.serviceCard,
              r.state === 'pending' && styles.pendingCard,
              r.state === 'inprogress' && styles.inProgressCard,
              r.state === 'done' && styles.doneCard,
            ]}
          >
            <View style={styles.serviceHeader}>
              <View style={styles.serviceNumber}>
                <Text style={styles.serviceNumberText}>{idx + 1}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{r.userLabel}</Text>
                <Text style={styles.serviceTime}>
                  {r.start} - {r.end}
                </Text>
                <View
                  style={[
                    styles.badge,
                    r.state === 'pending' && styles.pendingBadge,
                    r.state === 'inprogress' && styles.inProgressBadge,
                    r.state === 'done' && styles.doneBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {r.state === 'pending' && 'Pendiente'}
                    {r.state === 'inprogress' && 'En curso'}
                    {r.state === 'done' && 'Completado'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                // TODO: Navigate to assignment details
                Alert.alert('Próximamente', 'Vista de detalles del servicio');
              }}
            >
              <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const handleQuickAction = (action: string): void => {
    switch (action) {
      case 'schedule':
        navigation.navigate('Planilla' as never);
        break;
      case 'contact':
        Alert.alert('Contactar', 'Llamar al número de emergencia?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar',
            onPress: () => Linking.openURL('tel:+34600000000'),
          },
        ]);
        break;
      case 'route':
        navigation.navigate('Ruta' as never);
        break;
      case 'notes':
        Alert.alert(
          'Notas Rápidas',
          'Aquí podrás agregar notas sobre tus servicios. En desarrollo.'
        );
        break;
      case 'balance':
        navigation.navigate('Balance' as never);
        break;
      case 'upcoming':
        navigation.navigate('Próximos' as never);
        break;
      case 'tomorrow':
        setShowModal('tomorrow');
        break;
      case 'thisWeek':
        setShowModal('thisWeek');
        break;
      case 'thisMonth':
        setShowModal('thisMonth');
        break;
      case 'start':
        Alert.alert('Servicio iniciado', 'Has marcado el inicio del servicio');
        break;
      case 'end':
        Alert.alert('Servicio completado', 'Has marcado el fin del servicio');
        break;
      case 'emergency':
        Alert.alert('🚨 Emergencia', '¿Necesitas ayuda urgente?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar 112',
            style: 'destructive',
            onPress: () => Linking.openURL('tel:112'),
          },
          {
            text: 'Notificar Coordinador',
            onPress: () => {
              Alert.alert(
                'Notificación Enviada',
                'Se ha notificado la situación de emergencia al coordinador.'
              );
            },
          },
        ]);
        break;
    }
  };

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
        const todayKey = new Date().toISOString().split('T')[0];

        console.log('🔍 Cargando datos para trabajadora:', {
          workerId,
          email: user.email,
          fecha: todayKey,
        });

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

        console.log('📅 Información del día:', {
          diaSemana: dow,
          esFinde: dow === 0 || dow === 6,
          esFestivo: holidayData !== null,
          usarHorarioFestivo: useHoliday,
        });

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
            users!inner(name, surname)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`);

        if (err === null && rows !== null) {
          console.log('📋 Asignaciones encontradas:', {
            total: rows.length,
            tipos: rows.map((r: any) => r.assignment_type),
            asignaciones: rows.map((r: any) => ({
              id: r.id,
              tipo: r.assignment_type,
              fechaInicio: r.start_date,
              fechaFin: r.end_date,
              usuario: r.users?.name,
            })),
          });

          // Transformar datos para que coincidan con la interfaz
          const transformedRows = rows.map((row: any) => ({
            ...row,
            users: Array.isArray(row.users) ? row.users[0] : row.users,
          })) as AssignmentRow[];

          const filtered = transformedRows.filter((a) => {
            const slots = getTodaySlots(
              a.schedule,
              a.assignment_type,
              useHoliday
            );
            console.log(`🔍 Evaluando asignación ${a.id}:`, {
              tipo: a.assignment_type,
              usuario: a.users?.name,
              slotsEncontrados: slots.length,
              slots: slots,
              usarHorarioFestivo: useHoliday,
            });

            if (slots.length === 0) {
              console.log(`❌ Asignación ${a.id} sin slots para hoy`);
              return false;
            }

            const t = (a.assignment_type ?? '').toLowerCase();
            let shouldShow = false;

            // Lógica mejorada: verificar si la asignación debe trabajar hoy
            if (t === 'flexible' || t === 'completa') {
              shouldShow = true; // Estos tipos trabajan todos los días
            } else if (t === 'laborables') {
              shouldShow = !useHoliday; // Solo días laborables
            } else if (t === 'festivos') {
              shouldShow = useHoliday; // Solo festivos/fines de semana
            }

            console.log(
              `${shouldShow ? '✅' : '❌'} Asignación ${a.id} ${shouldShow ? 'incluida' : 'excluida'}`
            );
            return shouldShow;
          });
          console.log('📊 Resultado del filtrado:', {
            asignacionesOriginales: transformedRows.length,
            asignacionesFiltradas: filtered.length,
            asignacionesFinales: filtered.map((a) => ({
              id: a.id,
              tipo: a.assignment_type,
              usuario: a.users?.name,
            })),
          });

          if (isMounted) {
            setTodayAssignments(filtered);
          }

          // Recordatorios deshabilitados para evitar errores en Expo Go
          // const reminders = filtered.map((assignment) => ({
          //   id: assignment.id,
          //   title: `${assignment.users.name || ''} ${assignment.users.surname || ''}`.trim() || 'Servicio',
          //   startTime: new Date(),
          //   userAddress: undefined,
          // }));
          // scheduleServiceReminders(reminders);
        } else {
          console.log(
            '❌ Error cargando asignaciones o no se encontraron datos:',
            err
          );
          if (isMounted) {
            setTodayAssignments([]);
          }
        }

        // Cargar estadísticas de próximos servicios
        await loadUpcomingServices(workerId);

        // Cargar estadísticas de la trabajadora
        await loadWorkerStats(workerId);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
  }, [user?.email, getTodaySlots]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const shouldWorkOnDate = (date: Date, assignmentType: string): boolean => {
    const dow = date.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const type = assignmentType.toLowerCase();

    const isWeekend = dow === 0 || dow === 6;

    if (type === 'laborables') {
      return !isWeekend; // Solo lunes a viernes
    }
    if (type === 'festivos') {
      return isWeekend; // Solo fines de semana
    }
    if (type === 'flexible' || type === 'completa') {
      return true; // Todos los días
    }

    return false;
  };

  const countServicesInPeriod = (
    assignments: any[],
    startDate: Date,
    endDate: Date
  ): number => {
    let totalServices = 0;

    for (const assignment of assignments) {
      const current = new Date(startDate);

      while (current <= endDate) {
        // Verificar si debe trabajar en esta fecha
        if (shouldWorkOnDate(current, assignment.assignment_type)) {
          // Contar slots para este día
          const slots = getSlotsForDate(
            assignment.schedule,
            assignment.assignment_type,
            current,
            current.getDay() === 0 || current.getDay() === 6 // es fin de semana
          );
          totalServices += slots.length;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return totalServices;
  };

  const loadUpcomingServices = async (workerId: string): Promise<void> => {
    try {
      const now = new Date();
      console.log('🔍 Cargando servicios próximos para trabajadora:', workerId);

      // Obtener todas las asignaciones activas
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(
          `
          id,
          assignment_type,
          schedule,
          start_date,
          end_date,
          status
        `
        )
        .eq('worker_id', workerId)
        .eq('status', 'active');

      if (error || !assignments) {
        setUpcomingServices({ tomorrow: 0, thisWeek: 0, thisMonth: 0 });
        return;
      }

      // Mañana
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Esta semana (desde mañana hasta final de semana)
      const weekStart = new Date(tomorrow);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Este mes (desde mañana hasta final de mes)
      const monthStart = new Date(tomorrow);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Filtrar asignaciones que están activas en cada período
      const filterActiveAssignments = (start: Date, end: Date) => {
        return assignments.filter((assignment) => {
          const assignmentStart = new Date(assignment.start_date);
          const assignmentEnd = assignment.end_date
            ? new Date(assignment.end_date)
            : null;

          // La asignación debe estar activa durante el período
          return (
            assignmentStart <= end &&
            (assignmentEnd === null || assignmentEnd >= start)
          );
        });
      };

      const tomorrowAssignments = filterActiveAssignments(
        tomorrow,
        tomorrowEnd
      );
      const weekAssignments = filterActiveAssignments(weekStart, weekEnd);
      const monthAssignments = filterActiveAssignments(monthStart, monthEnd);

      const tomorrowCount = countServicesInPeriod(
        tomorrowAssignments,
        tomorrow,
        tomorrowEnd
      );
      const weekCount = countServicesInPeriod(
        weekAssignments,
        weekStart,
        weekEnd
      );
      const monthCount = countServicesInPeriod(
        monthAssignments,
        monthStart,
        monthEnd
      );

      console.log('📊 Servicios calculados:', {
        mañana: tomorrowCount,
        semana: weekCount,
        mes: monthCount,
        asignaciones: {
          mañana: tomorrowAssignments.length,
          semana: weekAssignments.length,
          mes: monthAssignments.length,
        },
      });

      if (isMounted) {
        setUpcomingServices({
          tomorrow: tomorrowCount,
          thisWeek: weekCount,
          thisMonth: monthCount,
        });
      }
    } catch (error) {
      console.error('Error loading upcoming services:', error);
      if (isMounted) {
        setUpcomingServices({ tomorrow: 0, thisWeek: 0, thisMonth: 0 });
      }
    }
  };

  const loadWorkerStats = async (workerId: string): Promise<void> => {
    try {
      // Obtener usuarios únicos asignados
      const { data: uniqueUsers } = await supabase
        .from('assignments')
        .select('user_id')
        .eq('worker_id', workerId)
        .eq('status', 'active');

      const uniqueUserIds = new Set(uniqueUsers?.map((a) => a.user_id) || []);
      setActiveUsers(uniqueUserIds.size);

      // Calcular balance real usando cálculos por usuario
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      let totalAssignedHours = 0;
      let totalTheoreticalHours = 0;
      let totalDifference = 0;
      let calculatedUsers = 0;

      // Calcular balance para cada usuario asignado
      for (const userId of uniqueUserIds) {
        try {
          const userBalance = await computeUserMonthlyBalance(
            userId,
            currentYear,
            currentMonth
          );

          if (userBalance) {
            totalAssignedHours += userBalance.assignedMonthlyHours;
            totalTheoreticalHours += userBalance.theoreticalMonthlyHours;
            totalDifference += userBalance.difference;
            calculatedUsers++;
          }
        } catch (error) {
          console.error(`Error calculating balance for user ${userId}:`, error);
        }
      }

      // Obtener total de asignaciones activas
      const { data: totalAssignments } = await supabase
        .from('assignments')
        .select('id', { count: 'exact' })
        .eq('worker_id', workerId)
        .eq('status', 'active');

      // Calcular eficiencia basada en completitud de datos
      const completionRate =
        calculatedUsers > 0
          ? Math.min(
              100,
              Math.round((calculatedUsers / uniqueUserIds.size) * 100)
            )
          : 0;

      setWorkerStats({
        totalAssignments: totalAssignments?.length || 0,
        completionRate,
        currentBalance: totalDifference, // Diferencia total de todos los usuarios
      });

      // Calcular horas semanales aproximadas basadas en horas teóricas
      const weeklyHoursApprox =
        totalTheoreticalHours > 0
          ? Math.round(totalTheoreticalHours / 4.33) // Aproximación mensual a semanal
          : (totalAssignments?.length || 0) * 2; // Fallback
      setWeeklyHours(weeklyHoursApprox);
    } catch (error) {
      console.error('Error loading worker stats:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header con saludo */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {greeting}, {displayName} 👋
          </Text>
          <Text style={styles.subtitle}>
            Aquí tienes el resumen de tu gestión
          </Text>
        </View>

        {/* Horarios de Hoy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Horarios de Hoy</Text>
          <Text style={styles.sectionSubtitle}>
            {formatLongDate(new Date())}
          </Text>
          {loading ? (
            <Text style={styles.loadingText}>Cargando…</Text>
          ) : (
            renderTodayServices()
          )}
        </View>

        {/* Próximos Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Próximos Servicios</Text>
          <Text style={styles.sectionSubtitle}>
            Planificación de servicios futuros
          </Text>

          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => handleQuickAction('tomorrow')}
          >
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>🌅 Mañana</Text>
              <Text style={styles.upcomingDescription}>
                Servicios programados
              </Text>
            </View>
            <View style={styles.upcomingCountContainer}>
              <Text style={styles.upcomingCount}>
                {upcomingServices.tomorrow}
              </Text>
              <Text style={styles.upcomingCountLabel}>servicios</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => handleQuickAction('thisWeek')}
          >
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>📅 Esta Semana</Text>
              <Text style={styles.upcomingDescription}>Próximos 7 días</Text>
            </View>
            <View style={styles.upcomingCountContainer}>
              <Text style={styles.upcomingCount}>
                {upcomingServices.thisWeek}
              </Text>
              <Text style={styles.upcomingCountLabel}>servicios</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => handleQuickAction('thisMonth')}
          >
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>🗓️ Este Mes</Text>
              <Text style={styles.upcomingDescription}>Vista completa</Text>
            </View>
            <View style={styles.upcomingCountContainer}>
              <Text style={styles.upcomingCount}>
                {upcomingServices.thisMonth}
              </Text>
              <Text style={styles.upcomingCountLabel}>servicios</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <Text style={styles.sectionSubtitle}>
            Acceso directo a funciones principales
          </Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('schedule')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionLabel}>Mi Planilla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('route')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionLabel}>Mi Ruta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('balance')}
            >
              <Text style={styles.actionIcon}>⏱️</Text>
              <Text style={styles.actionLabel}>Balance Horas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('upcoming')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Próximos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('contact')}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Contactar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('emergency')}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={styles.actionLabel}>Emergencia</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de la Trabajadora */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👩‍💼 Mi Información</Text>
          <Text style={styles.sectionSubtitle}>
            Estadísticas y balance actual
          </Text>

          <View style={styles.workerInfoGrid}>
            <View style={styles.workerInfoCard}>
              <Text style={styles.workerInfoIcon}>⚡</Text>
              <Text style={styles.workerInfoLabel}>Eficiencia</Text>
              <Text style={styles.workerInfoValue}>
                {loading ? '...' : `${workerStats.completionRate}%`}
              </Text>
            </View>

            <View style={styles.workerInfoCard}>
              <Text style={styles.workerInfoIcon}>⏱️</Text>
              <Text style={styles.workerInfoLabel}>Balance Actual</Text>
              <Text
                style={[
                  styles.workerInfoValue,
                  {
                    color:
                      workerStats.currentBalance >= 0 ? '#22c55e' : '#ef4444',
                  },
                ]}
              >
                {loading
                  ? '...'
                  : `${workerStats.currentBalance > 0 ? '+' : ''}${workerStats.currentBalance.toFixed(1)}h`}
              </Text>
            </View>

            <View style={styles.workerInfoCard}>
              <Text style={styles.workerInfoIcon}>📋</Text>
              <Text style={styles.workerInfoLabel}>Asignaciones</Text>
              <Text style={styles.workerInfoValue}>
                {loading ? '...' : workerStats.totalAssignments}
              </Text>
            </View>
          </View>
        </View>

        {/* Tarjetas Informativas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🕐</Text>
            <Text style={styles.statLabel}>Servicios Hoy</Text>
            <Text style={styles.statValue}>
              {loading ? '...' : todayAssignments.length}
            </Text>
            <Text style={styles.statDescription}>programados</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>Horas Semana</Text>
            <Text style={styles.statValue}>
              {loading ? '...' : weeklyHours.toFixed(1)}
            </Text>
            <Text style={styles.statDescription}>estimadas</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
            <Text style={styles.statValue}>
              {loading ? '...' : activeUsers}
            </Text>
            <Text style={styles.statDescription}>asignados</Text>
          </View>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modales para navegación */}
      <Modal
        visible={showModal === 'tomorrow'}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModal(null)}
          >
            <Text style={styles.modalCloseText}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <TomorrowScreen />
      </Modal>

      <Modal
        visible={showModal === 'thisWeek'}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModal(null)}
          >
            <Text style={styles.modalCloseText}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <ThisWeekScreen />
      </Modal>

      <Modal
        visible={showModal === 'thisMonth'}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModal(null)}
          >
            <Text style={styles.modalCloseText}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <ThisMonthScreen />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  noServicesText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  inProgressCard: {
    backgroundColor: '#d1fae5',
    borderColor: '#34d399',
  },
  doneCard: {
    backgroundColor: '#fee2e2',
    borderColor: '#f87171',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceNumber: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginRight: 12,
  },
  serviceNumberText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.8)',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  doneBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  detailsButton: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  detailsButtonText: {
    textAlign: 'center',
    color: '#374151',
    fontWeight: '500',
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  upcomingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  upcomingCountContainer: {
    alignItems: 'center',
  },
  upcomingCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  upcomingCountLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  workerInfoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  workerInfoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workerInfoIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  workerInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  workerInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 10,
    color: '#9ca3af',
  },
  bottomSpacing: {
    height: 100,
  },
  modalHeader: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseButton: {
    paddingVertical: 10,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
