/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { supabase } from '@/lib/database';
import type { NotificationType, PushNotificationPayload } from '@/types';
import type {
  WorkerNotification,
  WorkerNotificationInsert,
} from '@/types/database-types';

/**
 * Servicio para manejar notificaciones push y en tiempo real
 */
export class NotificationService {
  private static instance: NotificationService;
  private readonly webSocketConnections: Map<string, WebSocket> = new Map();

  static getInstance(): NotificationService {
    NotificationService.instance ??= new NotificationService();
    return NotificationService.instance;
  }

  /**
   * Crear y enviar una notificación a un trabajador
   */
  async createAndSendNotification(
    workerId: string,
    notification: Omit<WorkerNotificationInsert, 'worker_id'>
  ): Promise<WorkerNotification | null> {
    try {
      // Crear notificación en la base de datos
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: createdNotification, error } = await supabase
        .from('worker_notifications')
        .insert({
          worker_id: workerId,
          ...notification,
        } as WorkerNotificationInsert)
        .select()
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating notification:', error);
        return null;
      }

      // Enviar notificación push
      await this.sendPushNotification(createdNotification);

      // Enviar notificación en tiempo real via WebSocket
      await this.sendRealtimeNotification(workerId, createdNotification);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return createdNotification;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in createAndSendNotification:', error);
      return null;
    }
  }

  /**
   * Enviar notificación push usando Service Worker
   */
  private async sendPushNotification(
    notification: WorkerNotification
  ): Promise<void> {
    try {
      // Obtener el token de push del dispositivo del trabajador
      const { data: devices } = await supabase
        .from('worker_devices')
        .select('push_token, platform')
        .eq('worker_id', notification.worker_id)
        .eq('authorized', true)
        .not('push_token', 'is', null);

      if (devices === null || devices.length === 0) {
        // eslint-disable-next-line no-console
        console.log('No push tokens found for worker:', notification.worker_id);
        return;
      }

      const payload: PushNotificationPayload = {
        title: notification.title,
        body: notification.body,
        icon: '/favicon.ico',
        badge: 1,
        sound: this.getNotificationSound(notification.type as NotificationType),
        vibrate: this.getVibrationPattern(notification.priority as string),
        data: {
          notificationId: notification.id,
          type: notification.type as NotificationType,
          workerId: notification.worker_id,
          ...notification.data,
        },
        actions: this.getNotificationActions(
          notification.type as NotificationType
        ),
      };

      // Aquí se integraría con un servicio de push notifications como Firebase FCM
      // Por ahora, usaremos la Web Push API del navegador
      for (const device of devices as {
        push_token: string;
        platform: string;
      }[]) {
        if (
          typeof device.push_token === 'string' &&
          device.push_token.length > 0
        ) {
          await this.sendWebPushNotification(device.push_token, payload);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Enviar notificación en tiempo real via WebSocket
   */
  private async sendRealtimeNotification(
    workerId: string,
    notification: WorkerNotification
  ): Promise<void> {
    try {
      // Usar Supabase Realtime para enviar la notificación
      // Crear canal temporal para broadcast
      const channel = supabase.channel(`worker-${workerId}-notifications`, {
        config: {
          broadcast: { self: false },
        },
      });

      // Suscribirse temporalmente y enviar
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Enviar la notificación por broadcast
          await channel.send({
            type: 'broadcast',
            event: 'notification',
            payload: notification,
          });

          // Desconectar después de enviar
          void supabase.removeChannel(channel);
        }
      });

      // Timeout para evitar que el canal quede abierto
      setTimeout(() => {
        void supabase.removeChannel(channel);
      }, 5000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending realtime notification:', error);
    }
  }

  /**
   * Enviar notificación Web Push
   */
  private async sendWebPushNotification(
    pushToken: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      // Aquí se implementaría la lógica para enviar la notificación
      // usando una librería como web-push o un servicio como Firebase FCM
      // eslint-disable-next-line no-console
      console.log('Sending web push notification:', { pushToken, payload });

      // Ejemplo de implementación con fetch (requiere configuración adicional)
      // await fetch('/api/send-push', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pushToken, payload }),
      // });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending web push notification:', error);
    }
  }

  /**
   * Obtener sonido de notificación según el tipo
   */
  private getNotificationSound(type: NotificationType): string {
    const soundMap: Record<NotificationType, string> = {
      new_user: 'notification-user_added_new.wav',
      user_removed: 'notification-user_removed_new.wav',
      schedule_change: 'notification-schedule_changed_new.wav',
      assignment_change: 'notification-assignment_changed_new.wav',
      route_update: 'notification-route_update_new.wav',
      system_message: 'notification-system_new.wav',
      reminder: 'notification-reminder_new.wav',
      urgent: 'notification-urgent_new.wav',
      holiday_update: 'notification-holiday_update_new.wav',
      service_start: 'notification-service_start_new.wav',
      service_end: 'notification-service_end_new.wav',
    };

    return soundMap[type] || 'notification-default_new.wav';
  }

  /**
   * Obtener patrón de vibración según la prioridad
   */
  private getVibrationPattern(priority: string): number[] {
    const vibrationMap: Record<string, number[]> = {
      low: [100],
      normal: [200, 100, 200],
      high: [300, 100, 300, 100, 300],
      urgent: [500, 200, 500, 200, 500, 200, 500],
    };

    return vibrationMap[priority] ?? [200, 100, 200];
  }

  /**
   * Obtener acciones de notificación según el tipo
   */
  private getNotificationActions(type: NotificationType) {
    const baseActions = [
      { action: 'view', title: 'Ver', icon: '/icons/view.png' },
      { action: 'dismiss', title: 'Descartar', icon: '/icons/dismiss.png' },
    ];

    const typeSpecificActions: Record<NotificationType, typeof baseActions> = {
      new_user: [
        { action: 'view_user', title: 'Ver Usuario', icon: '/icons/user.png' },
        {
          action: 'view_schedule',
          title: 'Ver Horario',
          icon: '/icons/schedule.png',
        },
        ...baseActions,
      ],
      schedule_change: [
        {
          action: 'view_schedule',
          title: 'Ver Horario',
          icon: '/icons/schedule.png',
        },
        { action: 'acknowledge', title: 'Confirmar', icon: '/icons/check.png' },
        ...baseActions,
      ],
      assignment_change: [
        {
          action: 'view_assignment',
          title: 'Ver Asignación',
          icon: '/icons/assignment.png',
        },
        ...baseActions,
      ],
      route_update: [
        { action: 'view_route', title: 'Ver Ruta', icon: '/icons/route.png' },
        ...baseActions,
      ],
      urgent: [
        { action: 'call', title: 'Llamar', icon: '/icons/phone.png' },
        { action: 'respond', title: 'Responder', icon: '/icons/message.png' },
        ...baseActions,
      ],
      user_removed: baseActions,
      system_message: baseActions,
      reminder: baseActions,
      holiday_update: baseActions,
      service_start: [
        {
          action: 'view_service',
          title: 'Ver Servicio',
          icon: '/icons/service.png',
        },
        {
          action: 'start_navigation',
          title: 'Iniciar Ruta',
          icon: '/icons/navigation.png',
        },
        ...baseActions,
      ],
      service_end: [
        {
          action: 'view_service',
          title: 'Ver Servicio',
          icon: '/icons/service.png',
        },
        {
          action: 'complete_service',
          title: 'Marcar Completado',
          icon: '/icons/check.png',
        },
        {
          action: 'next_service',
          title: 'Siguiente Servicio',
          icon: '/icons/next.png',
        },
        ...baseActions,
      ],
    };

    return typeSpecificActions[type] ?? baseActions;
  }

  /**
   * Crear notificaciones automáticas para eventos del sistema
   */
  async createSystemNotifications() {
    // Notificación de nuevo usuario asignado
    const createNewUserNotification = async (
      workerId: string,
      userName: string,
      userAddress: string
    ) => {
      void this.createAndSendNotification(workerId, {
        title: '👤 Nuevo usuario asignado',
        body: `Se te ha asignado un nuevo usuario: ${userName} en ${userAddress}`,
        type: 'new_user',
        priority: 'high',
        data: { userName, userAddress },
      });
    };

    // Notificación de usuario eliminado
    const createUserRemovedNotification = async (
      workerId: string,
      userName: string
    ) => {
      void this.createAndSendNotification(workerId, {
        title: '❌ Usuario eliminado',
        body: `El usuario ${userName} ha sido eliminado de tus asignaciones`,
        type: 'user_removed',
        priority: 'normal',
        data: { userName },
      });
    };

    // Notificación de cambio de horario
    const createScheduleChangeNotification = async (
      workerId: string,
      userName: string,
      oldTime: string,
      newTime: string
    ) => {
      void this.createAndSendNotification(workerId, {
        title: '⏰ Cambio de horario',
        body: `Horario de ${userName} cambiado de ${oldTime} a ${newTime}`,
        type: 'schedule_change',
        priority: 'high',
        data: { userName, oldTime, newTime },
      });
    };

    // Notificación de inicio de servicio
    const createServiceStartNotification = async (
      workerId: string,
      userName: string,
      serviceTime: string,
      serviceAddress: string
    ) => {
      void this.createAndSendNotification(workerId, {
        title: '▶️ Servicio iniciado',
        body: `Servicio con ${userName} a las ${serviceTime} en ${serviceAddress} ha comenzado`,
        type: 'service_start',
        priority: 'high',
        data: { userName, serviceTime, serviceAddress },
      });
    };

    // Notificación de fin de servicio
    const createServiceEndNotification = async (
      workerId: string,
      userName: string,
      serviceTime: string,
      nextServiceInfo?: string
    ) => {
      void this.createAndSendNotification(workerId, {
        title: '⏹️ Servicio finalizado',
        body: `Servicio con ${userName} a las ${serviceTime} ha terminado${nextServiceInfo != null && nextServiceInfo.length > 0 ? `. ${nextServiceInfo}` : ''}`,
        type: 'service_end',
        priority: 'normal',
        data: { userName, serviceTime, nextServiceInfo },
      });
    };

    return {
      createNewUserNotification,
      createUserRemovedNotification,
      createScheduleChangeNotification,
      createServiceStartNotification,
      createServiceEndNotification,
    };
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance();
