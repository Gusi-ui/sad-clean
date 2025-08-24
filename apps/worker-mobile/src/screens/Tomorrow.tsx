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
  startMinutes: number;
  state: 'pending' | 'inprogress' | 'done';
}

export default function TomorrowScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':');
    return Number(h) * 60 + Number(m);
  };

  const getTomorrowSlots = useCallback(
    (
      schedule: unknown,
      assignmentType: string,
      isHoliday: boolean
    ): Array<{ start: string; end: string }> => {
      try {
        const sc =
          typeof schedule === 'string'
            ? (JSON.parse(schedule) as Record<string, unknown>)
            : (schedule as Record<string, unknown>);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayNames = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
        const dayName = dayNames[tomorrow.getDay()] ?? 'monday';

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

  const shouldWorkTomorrow = (assignmentType: string): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dow = tomorrow.getDay();
    const type = assignmentType.toLowerCase();

    const isWeekend = dow === 0 || dow === 6;

    if (type === 'laborables') {
      return !isWeekend;
    }
    if (type === 'festivos') {
      return isWeekend;
    }
    if (type === 'flexible' || type === 'completa') {
      return true;
    }

    return false;
  };

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
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowKey = tomorrow.toISOString().split('T')[0];

        // Verificar si mañana es festivo
        const { data: holidayData } = await supabase
          .from('holidays')
          .select('id')
          .eq('day', tomorrow.getDate())
          .eq('month', tomorrow.getMonth() + 1)
          .eq('year', tomorrow.getFullYear())
          .maybeSingle();

        const dow = tomorrow.getDay();
        const isHoliday = holidayData !== null || dow === 0 || dow === 6;

        // Obtener asignaciones para mañana
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
          .lte('start_date', tomorrowKey)
          .or(`end_date.is.null,end_date.gte.${tomorrowKey}`);

        if (err === null && rows !== null) {
          const transformedRows = rows.map((row: any) => ({
            ...row,
            users: Array.isArray(row.users) ? row.users[0] : row.users,
          }));

          const serviceRows: ServiceRow[] = transformedRows.flatMap((a) => {
            if (!shouldWorkTomorrow(a.assignment_type)) {
              return [];
            }

            const slots = getTomorrowSlots(
              a.schedule,
              a.assignment_type,
              isHoliday
            );
            const label =
              `${a.users?.name ?? ''} ${a.users?.surname ?? ''}`.trim() ||
              'Servicio';

            return slots.map((s) => {
              const sm = toMinutes(s.start);
              return {
                assignmentId: a.id,
                userLabel: label,
                start: s.start,
                end: s.end,
                startMinutes: sm,
                state: 'pending' as const,
              };
            });
          });

          serviceRows.sort((a, b) => a.startMinutes - b.startMinutes);
          setServices(serviceRows);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error loading tomorrow services:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email, getTomorrowSlots]);

  const formatDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🌅 Servicios de Mañana</Text>
          <Text style={styles.subtitle}>{formatDate()}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#3b82f6' />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌅 Servicios de Mañana</Text>
        <Text style={styles.subtitle}>{formatDate()}</Text>
      </View>

      <View style={styles.content}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏖️</Text>
            <Text style={styles.emptyText}>
              No tienes servicios programados para mañana
            </Text>
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>
              📋 {services.length} servicio{services.length !== 1 ? 's' : ''}{' '}
              programado{services.length !== 1 ? 's' : ''}
            </Text>
            {services.map((service, index) => (
              <View
                key={`${service.assignmentId}-${service.start}-${index}`}
                style={styles.serviceCard}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceNumber}>
                    <Text style={styles.serviceNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.userLabel}</Text>
                    <Text style={styles.serviceTime}>
                      {service.start} - {service.end}
                    </Text>
                  </View>
                </View>
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
    textTransform: 'capitalize',
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceNumberText: {
    fontWeight: 'bold',
    color: '#3b82f6',
    fontSize: 16,
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
  },
});
