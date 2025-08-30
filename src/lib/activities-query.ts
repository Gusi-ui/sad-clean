import type { Activity, ActivityInsert } from '@/types';
import { logger } from '@/utils/logger';

import { supabase } from './database';

/**
 * Convierte una fecha a formato "time ago"
 */
const toTimeAgo = (dateString: string | null): string => {
  if (dateString === null) return 'Reciente';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600)
    return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400)
    return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000)
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  if (diffInSeconds < 31536000)
    return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `Hace ${Math.floor(diffInSeconds / 31536000)} años`;
};

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
  p_ip_address?: string | undefined;
  p_user_agent?: string | undefined;
};

export const logActivity = async (
  activity: ActivityInsert
): Promise<string> => {
  try {
    const params: LogParams = {
      p_activity_type: activity.activity_type,
      p_entity_type: activity.entity_type,
      p_description: activity.description,
      p_user_id: activity.user_id,
      p_user_email: activity.user_email,
      p_user_name: activity.user_name,
      p_entity_id: activity.entity_id,
      p_entity_name: activity.entity_name,
      p_details: activity.details as Json,
      p_ip_address: activity.ip_address ?? undefined,
      p_user_agent: activity.user_agent ?? undefined,
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
      throw new Error('No se pudo obtener el ID de la actividad insertada');
    }

    return insertData.id;
  } catch (error) {
    logger.error('Error al registrar actividad', error);
    throw error;
  }
};

/**
 * Obtiene las actividades del sistema con información de usuario
 */
export const getActivities = async (): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from('system_activities')
      .select(
        `
        id,
        user_name,
        activity_type,
        entity_type,
        entity_name,
        description,
        created_at
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error !== null) {
      logger.error('Error al obtener actividades', error);
      throw error;
    }

    // Agregar time_ago a cada actividad
    const activitiesWithTimeAgo = (data ?? []).map((activity) => ({
      id: activity.id,
      user_name: activity.user_name,
      activity_type: activity.activity_type,
      entity_type: activity.entity_type,
      entity_name: activity.entity_name,
      description: activity.description,
      created_at: activity.created_at,
      time_ago: toTimeAgo(activity.created_at),
    }));

    return activitiesWithTimeAgo as Activity[];
  } catch (error) {
    logger.error('Error al obtener actividades', error);
    throw error;
  }
};

// Funciones específicas para diferentes tipos de actividades
export const logWorkerActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  workerName: string,
  workerId: string
): Promise<void> => {
  await logActivity({
    user_id: workerId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'worker_management',
    entity_type: 'worker',
    entity_id: workerId,
    entity_name: workerName,
    description: `${action} trabajador: ${workerName}`,
    details: {
      action,
      entity: 'worker',
      worker_name: workerName,
      worker_id: workerId,
    },
  });
};

export const logUserActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  userName: string,
  userId: string
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'user_management',
    entity_type: 'user',
    entity_id: userId,
    entity_name: userName,
    description: `${action} usuario: ${userName}`,
    details: {
      action,
      entity: 'user',
      user_name: userName,
      user_id: userId,
    },
  });
};

export const logAssignmentActivity = async (
  createdBy: string,
  action: string,
  assignmentType: string,
  workerName: string,
  userName: string
): Promise<void> => {
  await logActivity({
    user_id: '', // No tenemos user_id específico aquí
    user_name: createdBy,
    user_email: '', // No tenemos user_email específico aquí
    activity_type: 'assignment_management',
    entity_type: 'assignment',
    entity_id: '', // No tenemos entity_id específico aquí
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      action,
      entity: 'assignment',
      admin_name: createdBy,
      admin_email: '', // No tenemos admin_email específico aquí
      created_by: createdBy,
    },
  });
};

export const logAssignmentUpdateActivity = async (
  updatedBy: string,
  action: string,
  assignmentType: string,
  workerName: string,
  userName: string
): Promise<void> => {
  await logActivity({
    user_id: '', // No tenemos user_id específico aquí
    user_name: updatedBy,
    user_email: '', // No tenemos user_email específico aquí
    activity_type: 'assignment_management',
    entity_type: 'assignment',
    entity_id: '', // No tenemos entity_id específico aquí
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      action,
      entity: 'assignment',
      admin_name: updatedBy,
      admin_email: '', // No tenemos admin_email específico aquí
      updated_by: updatedBy,
    },
  });
};

export const logAssignmentDeleteActivity = async (
  deletedBy: string,
  action: string,
  assignmentType: string,
  workerName: string,
  userName: string
): Promise<void> => {
  await logActivity({
    user_id: '', // No tenemos user_id específico aquí
    user_name: deletedBy,
    user_email: '', // No tenemos user_email específico aquí
    activity_type: 'assignment_management',
    entity_type: 'assignment',
    entity_id: '', // No tenemos entity_id específico aquí
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      action,
      entity: 'assignment',
      admin_name: deletedBy,
      admin_email: '', // No tenemos admin_email específico aquí
      deleted_by: deletedBy,
    },
  });
};

export const logAssignmentCreationActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  assignmentType: string,
  workerName: string,
  workerId: string,
  userName: string,
  userId: string,
  startDate: string,
  endDate: string,
  weeklyHours: number
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'assignment_creation',
    entity_type: 'assignment',
    entity_id: '', // No tenemos entity_id específico aquí
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      assignment_type: assignmentType,
      worker_name: workerName,
      worker_id: workerId,
      user_name: userName,
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      weekly_hours: weeklyHours,
      entity: 'assignment',
    },
  });
};

export const logAssignmentUpdateActivityDetailed = async (
  adminName: string,
  adminEmail: string,
  action: string,
  assignmentId: string,
  assignmentType: string,
  workerName: string,
  workerId: string,
  userName: string,
  userId: string,
  startDate: string,
  endDate: string,
  weeklyHours: number
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'assignment_update',
    entity_type: 'assignment',
    entity_id: assignmentId,
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      assignment_id: assignmentId,
      assignment_type: assignmentType,
      worker_name: workerName,
      worker_id: workerId,
      user_name: userName,
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      weekly_hours: weeklyHours,
      action,
      entity: 'assignment',
    },
  });
};

export const logAssignmentStatusChangeActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  assignmentId: string,
  assignmentType: string,
  workerName: string,
  workerId: string,
  userName: string,
  userId: string
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'assignment_status_change',
    entity_type: 'assignment',
    entity_id: assignmentId,
    entity_name: `${assignmentType} - ${workerName} - ${userName}`,
    description: `${action} asignación: ${assignmentType} para ${workerName} y ${userName}`,
    details: {
      assignment_id: assignmentId,
      assignment_type: assignmentType,
      worker_name: workerName,
      worker_id: workerId,
      user_name: userName,
      user_id: userId,
      action,
      entity: 'assignment',
    },
  });
};

export const logUserManagementActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  userName: string,
  userId: string
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'user_management',
    entity_type: 'user',
    entity_id: userId,
    entity_name: userName,
    description: `${action} usuario: ${userName}`,
    details: {
      action,
      entity: 'user',
      user_name: userName,
      user_id: userId,
    },
  });
};

export const logUserUpdateActivity = async (
  adminName: string,
  adminEmail: string,
  action: string,
  userName: string,
  userId: string
): Promise<void> => {
  await logActivity({
    user_id: userId,
    user_name: adminName,
    user_email: adminEmail,
    activity_type: 'user_update',
    entity_type: 'user',
    entity_id: userId,
    entity_name: userName,
    description: `${action} usuario: ${userName}`,
    details: {
      action,
      entity: 'user',
      user_name: userName,
      user_id: userId,
    },
  });
};
