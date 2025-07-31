import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Tipos basados en el esquema real de Supabase
export type Worker = Database['public']['Tables']['workers']['Row'];
export type WorkerInsert = Database['public']['Tables']['workers']['Insert'];
export type WorkerUpdate = Database['public']['Tables']['workers']['Update'];

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert =
  Database['public']['Tables']['assignments']['Insert'];
export type AssignmentUpdate =
  Database['public']['Tables']['assignments']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type HoursBalance =
  Database['public']['Tables']['hours_balances']['Row'];
export type HoursBalanceInsert =
  Database['public']['Tables']['hours_balances']['Insert'];
export type HoursBalanceUpdate =
  Database['public']['Tables']['hours_balances']['Update'];

// Funciones helper para SAD LAS

/**
 * Obtiene todos los workers activos
 */
export const getActiveWorkers = async (): Promise<Worker[]> => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error fetching active workers:', error);
    throw error;
  }

  return data ?? [];
};

/**
 * Obtiene un worker por ID
 */
export const getWorkerById = async (id: string): Promise<Worker | null> => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single();

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error fetching worker:', error);
    throw error;
  }

  return data;
};

/**
 * Crea un nuevo worker
 */
export const createWorker = async (worker: WorkerInsert): Promise<Worker> => {
  const { data, error } = await supabase
    .from('workers')
    .insert(worker)
    .select()
    .single();

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error creating worker:', error);
    throw error;
  }

  return data;
};

/**
 * Actualiza un worker
 */
export const updateWorker = async (
  id: string,
  updates: WorkerUpdate
): Promise<Worker> => {
  const { data, error } = await supabase
    .from('workers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error updating worker:', error);
    throw error;
  }

  return data;
};

/**
 * Obtiene asignaciones de un worker
 */
export const getWorkerAssignments = async (
  workerId: string
): Promise<Assignment[]> => {
  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      *,
      workers (name, surname, email),
      users (name, surname, client_code)
    `
    )
    .eq('worker_id', workerId)
    .order('start_date', { ascending: false });

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error fetching worker assignments:', error);
    throw error;
  }

  return data ?? [];
};

/**
 * Crea una nueva asignación
 */
export const createAssignment = async (
  assignment: AssignmentInsert
): Promise<Assignment> => {
  const { data, error } = await supabase
    .from('assignments')
    .insert(assignment)
    .select()
    .single();

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error creating assignment:', error);
    throw error;
  }

  return data;
};

/**
 * Actualiza una asignación
 */
export const updateAssignment = async (
  id: string,
  updates: AssignmentUpdate
): Promise<Assignment> => {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error updating assignment:', error);
    throw error;
  }

  return data;
};

/**
 * Obtiene estadísticas de un worker
 */
export const getWorkerStats = async (
  workerId: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('weekly_hours, status')
    .eq('worker_id', workerId)
    .gte('start_date', startDate)
    .lte('start_date', endDate);

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error fetching worker stats:', error);
    throw error;
  }

  const totalHours = (data ?? []).reduce(
    (sum, assignment) => sum + (assignment.weekly_hours ?? 0),
    0
  );
  const completedTasks = (data ?? []).filter(
    (a) => a.status === 'completed'
  ).length;
  const totalTasks = (data ?? []).length;

  return {
    totalHours,
    completedTasks,
    totalTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };
};

/**
 * Obtiene todos los usuarios (clientes)
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error('Error fetching users:', error);
    throw error;
  }

  return data ?? [];
};

/**
 * Manejo de errores centralizado
 */
export const handleSupabaseError = (error: unknown, context: string) => {
  // eslint-disable-next-line no-console
  console.error(`Error in ${context}:`, error);

  // Determinar el tipo de error y retornar mensaje apropiado
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorCode = (error as { code: string }).code;

    if (errorCode === '23505') {
      return 'Ya existe un registro con estos datos';
    }

    if (errorCode === '23503') {
      return 'No se puede eliminar este registro porque está siendo usado';
    }

    if (errorCode === '42P01') {
      return 'La tabla no existe';
    }
  }

  return 'Ha ocurrido un error inesperado';
};
