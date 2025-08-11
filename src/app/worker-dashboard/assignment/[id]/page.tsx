'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import { isHoliday } from '@/lib/holidays-query';

interface AssignmentDetailRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users?: { name: string | null; surname: string | null } | null;
}

export default function WorkerAssignmentDetail(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [row, setRow] = useState<AssignmentDetailRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const id = params?.id;
        if (!id || typeof id !== 'string') return;
        const email = user?.email ?? '';
        if (email.trim() === '') return;

        const { data: w, error: werr } = await supabase
          .from('workers')
          .select('id')
          .ilike('email', email)
          .maybeSingle();
        if (werr !== null || w === null) return;

        const { data, error } = await supabase
          .from('assignments')
          .select(
            'id, assignment_type, schedule, start_date, end_date, users(name, surname)'
          )
          .eq('id', id)
          .eq('worker_id', w.id)
          .single();
        if (error === null) setRow(data as AssignmentDetailRow);
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [params?.id, user?.email]);

  // Removed prettySchedule (no longer shown)

  const dayKey = useMemo(() => {
    const d = new Date();
    const dow = d.getDay();
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

  const [useHolidayDay, setUseHolidayDay] = useState<boolean>(false);
  useEffect(() => {
    const check = async (): Promise<void> => {
      const now = new Date();
      const dow = now.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const holiday = await isHoliday(
        now.getDate(),
        now.getMonth() + 1,
        now.getFullYear()
      );
      setUseHolidayDay(isWeekend || holiday);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    check();
  }, []);

  const getFirstSlot = (
    schedule: unknown
  ): { start: string; end: string } | null => {
    try {
      const sc =
        typeof schedule === 'string'
          ? (JSON.parse(schedule) as Record<string, unknown>)
          : (schedule as Record<string, unknown>);
      const dayObj = (sc?.[dayKey] as Record<string, unknown>) ?? undefined;
      const enabled = (dayObj?.['enabled'] as boolean | undefined) ?? false;
      if (!enabled) return null;
      const slots = (
        Array.isArray(dayObj?.['timeSlots'])
          ? (dayObj?.['timeSlots'] as unknown[])
          : []
      ) as Array<Record<string, unknown>>;
      const first = slots[0];
      const startRaw = (first?.['start'] as string | undefined) ?? '';
      const endRaw = (first?.['end'] as string | undefined) ?? '';
      const timeOk = (t: string): boolean => /^\d{1,2}:\d{2}$/.test(t);
      if (timeOk(startRaw) && timeOk(endRaw)) {
        const pad = (t: string) =>
          t
            .split(':')
            .map((p, i) => (i === 0 ? p.padStart(2, '0') : p))
            .join(':');
        return { start: pad(startRaw), end: pad(endRaw) };
      }
    } catch {
      // noop
    }
    return null;
  };

  const getSlotForToday = (
    schedule: unknown
  ): { start: string; end: string } | null => {
    const primary = getFirstSlot(schedule);
    if (primary !== null) return primary;
    if (!useHolidayDay) return null;
    try {
      const sc =
        typeof schedule === 'string'
          ? (JSON.parse(schedule) as Record<string, unknown>)
          : (schedule as Record<string, unknown>);
      const hcfg = (sc?.['holiday_config'] as Record<string, unknown>) ?? {};
      const slots = (
        Array.isArray(hcfg?.['holiday_timeSlots'])
          ? (hcfg['holiday_timeSlots'] as unknown[])
          : []
      ) as Array<Record<string, unknown>>;
      const first = slots[0];
      const startRaw = (first?.['start'] as string | undefined) ?? '';
      const endRaw = (first?.['end'] as string | undefined) ?? '';
      const timeOk = (t: string): boolean => /^\d{1,2}:\d{2}$/.test(t);
      if (timeOk(startRaw) && timeOk(endRaw)) {
        const pad = (t: string) =>
          t
            .split(':')
            .map((p, i) => (i === 0 ? p.padStart(2, '0') : p))
            .join(':');
        return { start: pad(startRaw), end: pad(endRaw) };
      }
    } catch {
      // noop
    }
    return null;
  };

  return (
    <ProtectedRoute requiredRole='worker'>
      <div className='max-w-3xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-xl font-bold text-gray-900'>
            Detalle del Servicio
          </h1>
          <Button variant='outline' onClick={() => router.back()}>
            Volver
          </Button>
        </div>

        {loading ? (
          <p className='text-gray-600'>Cargando…</p>
        ) : row === null ? (
          <p className='text-gray-600'>No se encontró el servicio.</p>
        ) : (
          <div className='space-y-4'>
            <div className='bg-white rounded-xl p-4 shadow-sm'>
              <p className='text-sm text-gray-600'>Usuario</p>
              <p className='font-semibold text-gray-900'>
                {`${row.users?.name ?? ''} ${row.users?.surname ?? ''}`.trim() ||
                  '—'}
              </p>
            </div>
            {/* Encabezado con usuario y horario de hoy si aplica */}
            <div className='bg-white rounded-xl p-4 shadow-sm'>
              <p className='text-sm text-gray-600'>Hoy</p>
              {(() => {
                const slot = getSlotForToday(row.schedule);
                if (slot === null) return <p className='text-gray-900'>—</p>;
                return (
                  <p className='font-semibold text-gray-900'>
                    {slot.start} - {slot.end}
                  </p>
                );
              })()}
            </div>
            <div className='bg-white rounded-xl p-4 shadow-sm'>
              <p className='text-sm text-gray-600'>Tipo</p>
              <p className='font-semibold text-gray-900'>
                {row.assignment_type}
              </p>
            </div>
            <div className='bg-white rounded-xl p-4 shadow-sm'>
              <p className='text-sm text-gray-600'>Rango</p>
              <p className='font-semibold text-gray-900'>
                {row.start_date} → {row.end_date ?? '—'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
