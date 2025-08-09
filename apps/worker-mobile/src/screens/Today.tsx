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
        const { data: w, error: werr } = await supabase
          .from('workers')
          .select('id')
          .eq('email', email)
          .single();
        const workerId =
          werr === null ? (w?.id as string | undefined) : undefined;
        const base = supabase
          .from('assignments')
          .select('id, assignment_type, schedule, start_date, end_date')
          .lte('start_date', todayKey)
          .or(`end_date.is.null,end_date.gte.${todayKey}`);
        const { data, error } = workerId
          ? await base.eq('worker_id', workerId)
          : await base;
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

  const getStartMinutes = (schedule: unknown): number => {
    try {
      const sc =
        typeof schedule === 'string'
          ? (JSON.parse(schedule) as Record<string, unknown>)
          : (schedule as Record<string, unknown>);
      const dayObj = (sc?.[dayKey] as Record<string, unknown>) ?? undefined;
      const slots = (
        Array.isArray(dayObj?.['timeSlots'])
          ? (dayObj?.['timeSlots'] as unknown[])
          : []
      ) as Array<Record<string, unknown>>;
      const first = slots[0];
      const start = (first?.['start'] as string | undefined) ?? '';
      if (/^\d{2}:\d{2}$/.test(start)) {
        const [hh, mm] = start.split(':');
        return Number(hh) * 60 + Number(mm);
      }
    } catch {
      // ignore
    }
    return 24 * 60 + 1; // al final si no hay hora
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aCompleted = completedIds.has(a.id) ? 1 : 0;
      const bCompleted = completedIds.has(b.id) ? 1 : 0;
      if (aCompleted !== bCompleted) return aCompleted - bCompleted; // no completados primero
      const ta = getStartMinutes(a.schedule);
      const tb = getStartMinutes(b.schedule);
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
          renderItem={({ item }: { item: Row }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.assignment_type}</Text>
              <Text style={styles.cardMeta}>
                {item.start_date} → {item.end_date ?? '—'}
              </Text>
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
          )}
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
});
