import type { Activity, ActivityInsert } from '@/types';

import { supabase } from './database';

/**
 * Registra una actividad en el sistema
 */
export const logActivity = async (
  activity: ActivityInsert
): Promise<string> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      p_activity_type: activity.activity_type,
      p_entity_type: activity.entity_type,
      p_description: activity.description,
    };

    // Solo agregar parámetros que no sean undefined
    if (activity.user_id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_user_id = activity.user_id;
    }
    if (activity.user_email !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_user_email = activity.user_email;
    }
    if (activity.user_name !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_user_name = activity.user_name;
    }
    if (activity.entity_id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_entity_id = activity.entity_id;
    }
    if (activity.entity_name !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_entity_name = activity.entity_name;
    }
    if (activity.details !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_details = activity.details;
    }
    if (activity.ip_address !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_ip_address = activity.ip_address;
    }
    if (activity.user_agent !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params.p_user_agent = activity.user_agent;
    }

    const { data, error } = await supabase.rpc('log_system_activity', params);

    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error('Error logging activity:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in logActivity:', error);
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
      // eslint-disable-next-line no-console
      console.error('Error fetching recent activities:', error);
      throw error;
    }

    return (data ?? []) as Activity[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getRecentActivities:', error);
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
