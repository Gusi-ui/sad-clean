import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';

import React, { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Row = {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
};

export default function TodayScreen(): React.JSX.Element {
  const { user, session } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const email = user?.email ?? '';
        if (email.trim() === '') {
          setRows([]);
          return;
        }
        const { data: w, error: werr } = await supabase
          .from('workers')
          .select('id')
          .eq('email', email)
          .single();
        const workerId =
          werr === null ? (w?.id as string | undefined) : undefined;
        if (workerId === undefined) {
          // No hay correspondencia de email con una trabajadora registrada
          setRows([]);
          return;
        }
        const { data, error } = await supabase
          .from('assignments')
          .select('id, assignment_type, schedule, start_date, end_date')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`)
          .eq('worker_id', workerId);
        if (error === null) setRows((data as Row[]) ?? []);
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => setLoading(false));
  }, [todayKey, user?.email]);

  const dayKey = useMemo(() => {
    const d = new Date();
    const dow = d.getDay(); // 0..6
    return (
      [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ][dow] ?? 'monday'
    );
  }, []);

  type TimeSlotRange = { start: string; end: string };

  const getTodaySlots = (
    schedule: unknown,
    assignmentType: string
  ): TimeSlotRange[] => {
    try {
      const sc =
        typeof schedule === 'string'
          ? (JSON.parse(schedule) as Record<string, unknown>)
          : (schedule as Record<string, unknown>);

      const isSunday: boolean = new Date().getDay() === 0;
      const type = (assignmentType ?? '').toLowerCase();
      const shouldUseHoliday: boolean = isSunday || type === 'festivos';

      // 1) Intentar leer tramos del día normal
      const dayConfig = (sc?.[dayKey] as Record<string, unknown>) ?? undefined;
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

      // 2) Si es festivo/domingo o no hay tramos del día, intentar festivos
      if (shouldUseHoliday || daySlots.length === 0) {
        // Soportar dos esquemas: holiday_config.holiday_timeSlots y schedule.holiday.timeSlots
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

        if (holidaySlots.length > 0) return holidaySlots;
      }

      return daySlots;
    } catch {
      return [];
    }
  };

  const getStartMinutes = (
    schedule: unknown,
    assignmentType: string
  ): number => {
    const slots = getTodaySlots(schedule, assignmentType);
    if (slots.length > 0) {
      const [hh, mm] = slots[0].start.split(':');
      return Number(hh) * 60 + Number(mm);
    }
    return 24 * 60 + 1;
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aCompleted = completedIds.has(a.id) ? 1 : 0;
      const bCompleted = completedIds.has(b.id) ? 1 : 0;
      if (aCompleted !== bCompleted) return aCompleted - bCompleted; // no completados primero
      const ta = getStartMinutes(a.schedule, a.assignment_type);
      const tb = getStartMinutes(b.schedule, b.assignment_type);
      return ta - tb;
    });
  }, [rows, completedIds]);

  const handleComplete = async (assignmentId: string): Promise<void> => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(assignmentId);
      return next;
    });
    const { error } = await supabase.from('system_activities').insert({
      user_id: session?.user?.id ?? null,
      activity_type: 'service_completed',
      entity_type: 'assignment',
      entity_id: assignmentId,
      description: 'Servicio completado desde app móvil',
    });
    if (error !== null) {
      Alert.alert('Aviso', 'No se pudo registrar la actividad (permisos).');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios de hoy</Text>
      {loading ? (
        <Text>Cargando…</Text>
      ) : (
        <FlatList
          data={sortedRows}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Row }) => {
            const slots = getTodaySlots(item.schedule, item.assignment_type);
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.assignment_type}</Text>
                <Text style={styles.cardMeta}>
                  {item.start_date} → {item.end_date ?? '—'}
                </Text>
                <View style={{ marginTop: 4, gap: 2 }}>
                  {slots.length > 0 ? (
                    slots.map((s, idx) => (
                      <Text key={`${item.id}-slot-${idx}`} style={styles.slot}>
                        {s.start} - {s.end}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.slot}>—</Text>
                  )}
                </View>
                {completedIds.has(item.id) ? (
                  <Text style={{ color: '#16a34a', fontWeight: '600' }}>
                    Completado
                  </Text>
                ) : (
                  <Button
                    title='Marcar completado'
                    onPress={() => {
                      void handleComplete(item.id);
                    }}
                  />
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { color: '#6b7280' },
  slot: { color: '#111827', fontWeight: '500' },
});
