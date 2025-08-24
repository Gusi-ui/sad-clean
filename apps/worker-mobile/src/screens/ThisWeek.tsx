import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import React, { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ServiceRow {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  date: string;
  dayName: string;
  startMinutes: number;
}

export default function ThisWeekScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getWeekRange = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      start: tomorrow.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
    };
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

  const getWeekSlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      date: Date
    ): Array<{ start: string; end: string }> => {
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
        const dayName = dayNames[date.getDay()] ?? 'monday';

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

        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const type = (assignmentType ?? '').toLowerCase();

        // Verificar si debe trabajar en esta fecha
        if (type === 'laborables' && isWeekend) return [];
        if (type === 'festivos' && !isWeekend) return [];

        if (daySlots.length > 0) return daySlots;

        // Fallback para festivos
        const holidayDay = (sc?.['holiday'] as Record<string, unknown>) ?? {};
        const holidayDayRaw = Array.isArray(holidayDay?.['timeSlots'])
          ? (holidayDay['timeSlots'] as unknown[])
          : [];
        return parseSlots(holidayDayRaw);
      } catch {
        return [];
      }
    },
    []
  );

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
        setServices([]);
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
          setServices([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;
        const weekRange = getWeekRange();

        // Obtener asignaciones para la semana
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
          .lte('start_date', weekRange.end)
          .or(`end_date.is.null,end_date.gte.${weekRange.start}`);

        if (err === null && rows !== null) {
          const transformedRows = rows.map((row: any) => ({
            ...row,
            users: Array.isArray(row.users) ? row.users[0] : row.users,
          }));

          const serviceRows: ServiceRow[] = [];

          for (const assignment of transformedRows) {
            const label =
              `${assignment.users?.name ?? ''} ${assignment.users?.surname ?? ''}`.trim() ||
              'Servicio';

            // Generar servicios para cada día de la semana
            const weekStart = new Date(weekRange.start);
            const weekEnd = new Date(weekRange.end);
            const current = new Date(weekStart);

            while (current <= weekEnd) {
              const currentDate = new Date(current);
              const slots = getWeekSlots(
                assignment.schedule,
                assignment.assignment_type,
                currentDate
              );

              if (slots.length > 0) {
                slots.forEach((s) => {
                  const sm = toMinutes(s.start);
                  const dateStr = currentDate.toISOString().split('T')[0] ?? '';
                  serviceRows.push({
                    assignmentId: assignment.id,
                    userLabel: label,
                    start: s.start,
                    end: s.end,
                    startMinutes: sm,
                    date: dateStr,
                    dayName: formatDate(dateStr),
                  });
                });
              }

              current.setDate(current.getDate() + 1);
            }
          }

          // Ordenar por fecha y luego por hora
          serviceRows.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.startMinutes - b.startMinutes;
          });

          setServices(serviceRows);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error loading week services:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email, getWeekSlots]);

  const groupServicesByDay = () => {
    const grouped: Record<string, ServiceRow[]> = {};
    services.forEach((service) => {
      if (!grouped[service.date]) {
        grouped[service.date] = [];
      }
      grouped[service.date].push(service);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📅 Esta Semana</Text>
          <Text style={styles.subtitle}>Próximos 7 días</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#3b82f6' />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      </View>
    );
  }

  const groupedServices = groupServicesByDay();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Esta Semana</Text>
        <Text style={styles.subtitle}>Próximos 7 días</Text>
      </View>

      <View style={styles.content}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              No tienes servicios programados para esta semana
            </Text>
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>
              📋 {services.length} servicio{services.length !== 1 ? 's' : ''}{' '}
              programado{services.length !== 1 ? 's' : ''}
            </Text>

            {Object.entries(groupedServices).map(([date, dayServices]) => (
              <View key={date} style={styles.daySection}>
                <Text style={styles.dayTitle}>{dayServices[0].dayName}</Text>
                {dayServices.map((service, index) => (
                  <View
                    key={`${service.assignmentId}-${service.start}-${index}`}
                    style={styles.serviceCard}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceTime}>
                        <Text style={styles.serviceTimeText}>
                          {service.start} - {service.end}
                        </Text>
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>
                          {service.userLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTime: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  serviceTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
