import { type Worker, supabase } from './database';

/**
 * Consulta todos los workers de la base de datos
 */
export const getAllWorkers = async (): Promise<Worker[]> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error fetching workers:', error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getAllWorkers:', error);
    throw error;
  }
};

/**
 * Consulta workers activos
 */
export const getActiveWorkers = async (): Promise<Worker[]> => {
  try {
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getActiveWorkers:', error);
    throw error;
  }
};

/**
 * Consulta workers por tipo
 */
export const getWorkersByType = async (
  workerType: 'cuidadora' | 'auxiliar' | 'enfermera'
): Promise<Worker[]> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('worker_type', workerType)
      .eq('is_active', true)
      .order('name');

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error fetching workers by type:', error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getWorkersByType:', error);
    throw error;
  }
};

interface WorkersStats {
  total: number;
  active: number;
  inactive: number;
  cuidadoras: number;
  auxiliares: number;
  enfermeras: number;
}

/**
 * Obtiene estadísticas de workers
 */
export const getWorkersStats = async (): Promise<WorkersStats> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('worker_type, is_active');

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error fetching workers stats:', error);
      throw error;
    }

    const stats = {
      total: (data ?? []).length,
      active: (data ?? []).filter((w) => w.is_active === true).length,
      inactive: (data ?? []).filter((w) => w.is_active !== true).length,
      cuidadoras: (data ?? []).filter(
        (w) => w.worker_type === 'cuidadora' && w.is_active === true
      ).length,
      auxiliares: (data ?? []).filter(
        (w) => w.worker_type === 'auxiliar' && w.is_active === true
      ).length,
      enfermeras: (data ?? []).filter(
        (w) => w.worker_type === 'enfermera' && w.is_active === true
      ).length,
    };

    return stats;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getWorkersStats:', error);
    throw error;
  }
};

/**
 * Busca workers por nombre o email
 */
export const searchWorkers = async (searchTerm: string): Promise<Worker[]> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .or(
        `name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .eq('is_active', true)
      .order('name');

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error searching workers:', error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in searchWorkers:', error);
    throw error;
  }
};

/**
 * Obtiene un worker por ID
 */
export const getWorkerById = async (id: string): Promise<Worker | null> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error fetching worker by ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getWorkerById:', error);
    throw error;
  }
};
