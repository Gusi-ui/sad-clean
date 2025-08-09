import type { Activity, ActivityInsert } from '@/types';
import { logger } from '@/utils/logger';

import { supabase } from './database';

/**
 * Registra una actividad en el sistema
 */
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
type LogParams = {
  p_activity_type: string;
  p_entity_type: string;
  p_description: string;
  p_user_id?: string;
  p_user_email?: string;
  p_user_name?: string;
  p_entity_id?: string;
  p_entity_name?: string;
  p_details?: Json;
  p_ip_address?: string;
  p_user_agent?: string;
};

export const logActivity = async (
  activity: ActivityInsert
): Promise<string> => {
  try {
    const params: LogParams = {
      p_activity_type: activity.activity_type,
      p_entity_type: activity.entity_type,
      p_description: activity.description,
      ...(activity.user_id !== undefined
        ? { p_user_id: activity.user_id }
        : {}),
      ...(activity.user_email !== undefined
        ? { p_user_email: activity.user_email }
        : {}),
      ...(activity.user_name !== undefined
        ? { p_user_name: activity.user_name }
        : {}),
      ...(activity.entity_id !== undefined
        ? { p_entity_id: activity.entity_id }
        : {}),
      ...(activity.entity_name !== undefined
        ? { p_entity_name: activity.entity_name }
        : {}),
      ...(activity.details !== undefined
        ? { p_details: activity.details as Json }
        : {}),
      ...(activity.ip_address !== undefined
        ? { p_ip_address: activity.ip_address }
        : {}),
      ...(activity.user_agent !== undefined
        ? { p_user_agent: activity.user_agent }
        : {}),
    };

    const { data, error } = await supabase.rpc('log_system_activity', params);

    if (error === null) {
      return data;
    }

    // Fallback: si el RPC falla (por ejemplo, función no creada), intentamos inserción directa
    logger.error(
      'RPC log_system_activity falló; usando inserción directa',
      error
    );
    const { data: insertData, error: insertError } = await supabase
      .from('system_activities')
      .insert([
        {
          user_id: params.p_user_id ?? null,
          user_email: params.p_user_email ?? null,
          user_name: params.p_user_name ?? null,
          activity_type: params.p_activity_type,
          entity_type: params.p_entity_type,
          entity_id: params.p_entity_id ?? null,
          entity_name: params.p_entity_name ?? null,
          description: params.p_description,
          details: (params.p_details ?? {}) as Json,
          ip_address: params.p_ip_address ?? null,
          user_agent: params.p_user_agent ?? null,
        },
      ])
      .select('id')
      .single();

    if (insertError !== null) {
      logger.error('Inserción directa de actividad falló', insertError);
      throw insertError;
    }

    if (insertData?.id === undefined) {
      throw new Error('No se pudo obtener el id de la actividad insertada');
    }
    // insertData tiene la forma { id: string }
    return String(insertData.id);
  } catch (error) {
    logger.error('Error in logActivity:', error as Error);
    throw error;
  }
};

/**
 * Obtiene las actividades recientes del sistema
 */
export const getRecentActivities = async (limit = 6): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase.rpc('get_recent_activities', {
      limit_count: limit,
    });

    if (error !== null) {
      logger.error('Error fetching recent activities (RPC):', error);
      // Fallback: leer directamente de la tabla y construir time_ago en cliente
      const { data: rows, error: tableError } = await supabase
        .from('system_activities')
        .select(
          'id, user_name, activity_type, entity_type, entity_name, description, created_at'
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (tableError !== null) {
        logger.error('Error fetching recent activities (table):', tableError);
        throw tableError;
      }

      const toTimeAgo = (createdAt: string | null): string => {
        if (createdAt === null) return 'Reciente';
        const diffSeconds = Math.floor(
          (Date.now() - new Date(createdAt).getTime()) / 1000
        );
        if (diffSeconds < 60) return 'Hace menos de 1 min';
        if (diffSeconds < 3600)
          return `Hace ${Math.floor(diffSeconds / 60)} min`;
        if (diffSeconds < 86400)
          return `Hace ${Math.floor(diffSeconds / 3600)}h`;
        return `Hace ${Math.floor(diffSeconds / 86400)} días`;
      };

      const mapped: Activity[] = (rows ?? []).map((r) => {
        const id = String((r as { id: string }).id);
        const userName =
          (r as { user_name?: string | null }).user_name ?? undefined;
        const actType = (r as { activity_type: string }).activity_type;
        const entType = (r as { entity_type: string }).entity_type;
        const entName =
          (r as { entity_name?: string | null }).entity_name ?? undefined;
        const description = (r as { description: string }).description;
        const createdAt =
          (r as { created_at: string | null }).created_at ??
          new Date().toISOString();

        const item: Activity = {
          id,
          activity_type: actType as Activity['activity_type'],
          entity_type: entType as Activity['entity_type'],
          description,
          created_at: createdAt,
          time_ago: toTimeAgo(
            (r as { created_at: string | null }).created_at ?? null
          ),
        };
        if (userName !== undefined) {
          item.user_name = userName;
        }
        if (entName !== undefined) {
          item.entity_name = entName;
        }
        return item;
      });
      return mapped;
    }

    return (data ?? []) as Activity[];
  } catch (error) {
    logger.error('Error in getRecentActivities:', error as Error);
    throw error;
  }
};

/**
 * Registra la creación de una trabajadora
 */
export const logWorkerCreated = async (
  workerName: string,
  workerId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'worker_created',
      entity_type: 'worker',
      entity_id: workerId,
      entity_name: workerName,
      description: `Nueva trabajadora "${workerName}" añadida al sistema`,
      details: {
        action: 'create',
        entity: 'worker',
        worker_name: workerName,
        worker_id: workerId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging worker creation:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Registra la actualización de una trabajadora
 */
export const logWorkerUpdated = async (
  workerName: string,
  workerId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'worker_updated',
      entity_type: 'worker',
      entity_id: workerId,
      entity_name: workerName,
      description: `Trabajadora "${workerName}" actualizada`,
      details: {
        action: 'update',
        entity: 'worker',
        worker_name: workerName,
        worker_id: workerId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging worker update:', error);
  }
};

/**
 * Registra la eliminación de una trabajadora
 */
export const logWorkerDeleted = async (
  workerName: string,
  workerId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'worker_deleted',
      entity_type: 'worker',
      entity_id: workerId,
      entity_name: workerName,
      description: `Trabajadora "${workerName}" eliminada del sistema`,
      details: {
        action: 'delete',
        entity: 'worker',
        worker_name: workerName,
        worker_id: workerId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging worker deletion:', error);
  }
};

/**
 * Registra el inicio de sesión de un usuario
 */
export const logUserLogin = async (
  userName: string,
  userEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: userName,
      user_email: userEmail,
      activity_type: 'login',
      entity_type: 'system',
      description: `${userName} inició sesión`,
      details: {
        action: 'login',
        user_name: userName,
        user_email: userEmail,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging user login:', error);
  }
};

/**
 * Registra la creación de un administrador
 */
export const logAdminCreated = async (
  adminName: string,
  adminEmail: string,
  createdBy: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: createdBy,
      activity_type: 'admin_created',
      entity_type: 'admin',
      entity_name: adminName,
      description: `Nuevo administrador "${adminName}" creado`,
      details: {
        action: 'create',
        entity: 'admin',
        admin_name: adminName,
        admin_email: adminEmail,
        created_by: createdBy,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging admin creation:', error);
  }
};

/**
 * Registra la actualización de un administrador
 */
export const logAdminUpdated = async (
  adminName: string,
  adminEmail: string,
  updatedBy: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: updatedBy,
      activity_type: 'admin_updated',
      entity_type: 'admin',
      entity_name: adminName,
      description: `Administrador "${adminName}" actualizado`,
      details: {
        action: 'update',
        entity: 'admin',
        admin_name: adminName,
        admin_email: adminEmail,
        updated_by: updatedBy,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging admin update:', error);
  }
};

/**
 * Registra la eliminación de un administrador
 */
export const logAdminDeleted = async (
  adminName: string,
  adminEmail: string,
  deletedBy: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: deletedBy,
      activity_type: 'admin_deleted',
      entity_type: 'admin',
      entity_name: adminName,
      description: `Administrador "${adminName}" eliminado del sistema`,
      details: {
        action: 'delete',
        entity: 'admin',
        admin_name: adminName,
        admin_email: adminEmail,
        deleted_by: deletedBy,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging admin deletion:', error);
  }
};

/**
 * Registra creación de una asignación
 */
export const logAssignmentCreated = async (
  adminName: string,
  adminEmail: string,
  details: {
    assignment_type?: string;
    worker_name?: string;
    worker_id?: string;
    user_name?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string | null;
  }
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'assignment_created',
      entity_type: 'assignment',
      description: `Asignación creada${
        typeof details.worker_name === 'string' &&
        details.worker_name.trim() !== ''
          ? ` para ${details.worker_name}`
          : ''
      }${
        typeof details.user_name === 'string' && details.user_name.trim() !== ''
          ? ` y ${details.user_name}`
          : ''
      }`,
      details: {
        action: 'create',
        entity: 'assignment',
        ...details,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging assignment creation:', error);
  }
};

/**
 * Registra actualización de una asignación
 */
export const logAssignmentUpdated = async (
  adminName: string,
  adminEmail: string,
  details: {
    assignment_id?: string;
    assignment_type?: string;
    worker_name?: string;
    worker_id?: string;
    user_name?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string | null;
  }
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'assignment_updated',
      entity_type: 'assignment',
      entity_id: details.assignment_id ?? '',
      description: `Asignación actualizada${
        typeof details.worker_name === 'string' &&
        details.worker_name.trim() !== ''
          ? ` para ${details.worker_name}`
          : ''
      }${
        typeof details.user_name === 'string' && details.user_name.trim() !== ''
          ? ` y ${details.user_name}`
          : ''
      }`,
      details: {
        action: 'update',
        entity: 'assignment',
        ...details,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging assignment update:', error);
  }
};

/**
 * Registra eliminación de una asignación
 */
export const logAssignmentDeleted = async (
  adminName: string,
  adminEmail: string,
  details: {
    assignment_id?: string;
    worker_name?: string;
    worker_id?: string;
    user_name?: string;
    user_id?: string;
  }
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'assignment_cancelled',
      entity_type: 'assignment',
      entity_id: details.assignment_id ?? '',
      description: `Asignación eliminada${
        typeof details.worker_name === 'string' &&
        details.worker_name.trim() !== ''
          ? ` para ${details.worker_name}`
          : ''
      }${
        typeof details.user_name === 'string' && details.user_name.trim() !== ''
          ? ` y ${details.user_name}`
          : ''
      }`,
      details: {
        action: 'delete',
        entity: 'assignment',
        ...details,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging assignment deletion:', error);
  }
};

/**
 * Registra la creación de un usuario
 */
export const logUserCreated = async (
  userName: string,
  userId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'user_created',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      description: `Nuevo usuario "${userName}" añadido al sistema`,
      details: {
        action: 'create',
        entity: 'user',
        user_name: userName,
        user_id: userId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging user creation:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Registra la actualización de un usuario
 */
export const logUserUpdated = async (
  userName: string,
  userId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'user_updated',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      description: `Usuario "${userName}" actualizado`,
      details: {
        action: 'update',
        entity: 'user',
        user_name: userName,
        user_id: userId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging user update:', error);
  }
};

/**
 * Registra la eliminación de un usuario
 */
export const logUserDeleted = async (
  userName: string,
  userId: string,
  adminName: string,
  adminEmail: string
): Promise<void> => {
  try {
    await logActivity({
      user_name: adminName,
      user_email: adminEmail,
      activity_type: 'user_deleted',
      entity_type: 'user',
      entity_id: userId,
      entity_name: userName,
      description: `Usuario "${userName}" eliminado del sistema`,
      details: {
        action: 'delete',
        entity: 'user',
        user_name: userName,
        user_id: userId,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging user deletion:', error);
  }
};
