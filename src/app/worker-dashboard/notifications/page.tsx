'use client';

import { Bell, Monitor, Settings, Smartphone, Volume2 } from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import type { NotificationType } from '@/types';

const NOTIFICATION_TYPES: {
  type: NotificationType;
  label: string;
  description: string;
}[] = [
  {
    type: 'new_user',
    label: 'Usuario Añadido',
    description: 'Cuando se te asigna un nuevo usuario',
  },
  {
    type: 'user_removed',
    label: 'Usuario Eliminado',
    description: 'Cuando se elimina un usuario de tu lista',
  },
  {
    type: 'schedule_change',
    label: 'Cambio de Horario',
    description: 'Cuando se modifica tu horario de trabajo',
  },
  {
    type: 'assignment_change',
    label: 'Cambio de Asignación',
    description: 'Cuando se modifica tu asignación de usuarios',
  },
  {
    type: 'system_message',
    label: 'Sistema',
    description: 'Notificaciones importantes del sistema',
  },
  {
    type: 'reminder',
    label: 'Recordatorios',
    description: 'Recordatorios de tareas y eventos',
  },
];

export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    push_enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
    new_user_notifications: true,
    schedule_change_notifications: true,
    assignment_notifications: true,
    system_notifications: true,
    quiet_hours_start: undefined as string | undefined,
    quiet_hours_end: undefined as string | undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Funciones auxiliares para manejar configuraciones de notificación
  const getNotificationSetting = (type: NotificationType): boolean => {
    switch (type) {
      case 'new_user':
        return settings.new_user_notifications;
      case 'user_removed':
        return settings.new_user_notifications; // Usar la misma configuración que new_user
      case 'schedule_change':
        return settings.schedule_change_notifications;
      case 'assignment_change':
        return settings.assignment_notifications;
      case 'route_update':
        return settings.assignment_notifications; // Usar la misma configuración que assignment_change
      case 'system_message':
        return settings.system_notifications;
      case 'reminder':
        return settings.system_notifications; // Usar la misma configuración que system_message
      case 'urgent':
        return settings.system_notifications; // Usar la misma configuración que system_message
      case 'holiday_update':
        return settings.system_notifications; // Usar la misma configuración que system_message
      default:
        return true;
    }
  };

  const updateNotificationSetting = (
    type: NotificationType,
    enabled: boolean
  ) => {
    switch (type) {
      case 'new_user':
      case 'user_removed':
        setSettings((prev) => ({ ...prev, new_user_notifications: enabled }));
        break;
      case 'schedule_change':
        setSettings((prev) => ({
          ...prev,
          schedule_change_notifications: enabled,
        }));
        break;
      case 'assignment_change':
      case 'route_update':
        setSettings((prev) => ({ ...prev, assignment_notifications: enabled }));
        break;
      case 'system_message':
      case 'reminder':
      case 'urgent':
      case 'holiday_update':
        setSettings((prev) => ({ ...prev, system_notifications: enabled }));
        break;
    }
  };

  // Cargar configuración actual
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id == null) return;

      try {
        const response = await fetch(
          `/api/workers/${user.id}/notification-settings`
        );
        if (response.ok) {
          const data = (await response.json()) as {
            settings?: {
              push_enabled?: boolean;
              sound_enabled?: boolean;
              vibration_enabled?: boolean;
              new_user_notifications?: boolean;
              schedule_change_notifications?: boolean;
              assignment_notifications?: boolean;
              system_notifications?: boolean;
              quiet_hours_start?: string;
              quiet_hours_end?: string;
            };
          };
          if (data.settings != null) {
            setSettings((prevSettings) => ({
              ...prevSettings,
              ...data.settings,
            }));
          }
        }
      } catch {
        // Error loading notification settings
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, [user?.id]);

  // Guardar configuración
  const saveSettings = async () => {
    if (user?.id == null) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/workers/${user.id}/notification-settings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        }
      );

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Configuración guardada correctamente',
        });
      } else {
        throw new Error('Error al guardar la configuración');
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  // Probar sonido de notificación
  const testNotificationSound = (type: NotificationType) => {
    try {
      const audio = new Audio(`/sounds/notification-${type}.mp3`);
      audio.volume = 0.5;
      void audio.play().catch(() => {
        const defaultAudio = new Audio('/sounds/notification-default.mp3');
        defaultAudio.volume = 0.5;
        void defaultAudio.play().catch(() => {
          // Silently fail if audio cannot be played
        });
      });
    } catch {
      // Error playing test sound
    }
  };

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings((prev) => ({ ...prev, browser_notifications: true }));
        setMessage({
          type: 'success',
          text: 'Permisos de notificación concedidos',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Permisos de notificación denegados',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <Settings className='h-6 w-6 text-blue-600' />
            <h1 className='text-2xl font-bold text-gray-900'>
              Configuración de Notificaciones
            </h1>
          </div>
          <p className='text-gray-600'>
            Personaliza cómo y cuándo recibir notificaciones
          </p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Configuración General */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Configuración General
          </h2>
          <div className='space-y-4'>
            {/* Notificaciones habilitadas */}
            <div className='flex items-center justify-between'>
              <div>
                <label className='text-sm font-medium text-gray-900'>
                  Notificaciones Habilitadas
                </label>
                <p className='text-sm text-gray-500'>
                  Activar o desactivar todas las notificaciones
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.push_enabled}
                  onChange={(e) =>
                    void setSettings((prev) => ({
                      ...prev,
                      push_enabled: e.target.checked,
                    }))
                  }
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sonido */}
            <div className='flex items-center justify-between'>
              <div>
                <label className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                  <Volume2 className='h-4 w-4' />
                  Sonido
                </label>
                <p className='text-sm text-gray-500'>
                  Reproducir sonido al recibir notificaciones
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.sound_enabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    void setSettings((prev) => ({
                      ...prev,
                      sound_enabled: checked,
                    }));
                    if (checked) {
                      void testNotificationSound('system_message');
                    }
                  }}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Vibración */}
            <div className='flex items-center justify-between'>
              <div>
                <label className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                  <Smartphone className='h-4 w-4' />
                  Vibración
                </label>
                <p className='text-sm text-gray-500'>
                  Vibrar el dispositivo al recibir notificaciones
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.vibration_enabled}
                  onChange={(e) =>
                    void setSettings((prev) => ({
                      ...prev,
                      vibration_enabled: e.target.checked,
                    }))
                  }
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Notificaciones del navegador */}
            <div className='flex items-center justify-between'>
              <div>
                <label className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                  <Monitor className='h-4 w-4' />
                  Notificaciones del Navegador
                </label>
                <p className='text-sm text-gray-500'>
                  Mostrar notificaciones en el navegador
                </p>
              </div>
              <div className='flex items-center gap-2'>
                {!('Notification' in window) ||
                Notification.permission === 'denied' ? (
                  <span className='text-xs text-red-600'>No disponible</span>
                ) : Notification.permission === 'default' ? (
                  <button
                    onClick={() => void requestNotificationPermission()}
                    className='text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700'
                  >
                    Permitir
                  </button>
                ) : (
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={
                        Boolean(settings.push_enabled) &&
                        Notification.permission === 'granted'
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          push_enabled: e.target.checked,
                        }))
                      }
                      disabled={
                        !('Notification' in window) ||
                        Notification.permission !== 'granted'
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tipos de Notificaciones */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Tipos de Notificaciones
          </h2>
          <div className='space-y-4'>
            {NOTIFICATION_TYPES.map((notifType) => (
              <div
                key={notifType.type}
                className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <label className='text-sm font-medium text-gray-900'>
                      {notifType.label}
                    </label>
                    {Boolean(settings.sound_enabled) && (
                      <button
                        onClick={() => testNotificationSound(notifType.type)}
                        className='text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1'
                        title='Probar sonido'
                      >
                        <Volume2 className='h-3 w-3' />
                        Probar
                      </button>
                    )}
                  </div>
                  <p className='text-sm text-gray-500'>
                    {notifType.description}
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={getNotificationSetting(notifType.type)}
                    onChange={(e) =>
                      void updateNotificationSetting(
                        notifType.type,
                        e.target.checked
                      )
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Horario Silencioso */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Horario Silencioso
          </h2>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <label className='text-sm font-medium text-gray-900'>
                  Activar Horario Silencioso
                </label>
                <p className='text-sm text-gray-500'>
                  No recibir notificaciones durante ciertas horas
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={
                    settings.quiet_hours_start != null &&
                    settings.quiet_hours_end != null
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings((prev) => ({
                        ...prev,
                        quiet_hours_start: '22:00',
                        quiet_hours_end: '08:00',
                      }));
                    } else {
                      setSettings((prev) => ({
                        ...prev,
                        quiet_hours_start: undefined,
                        quiet_hours_end: undefined,
                      }));
                    }
                  }}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.quiet_hours_start != null &&
              settings.quiet_hours_end != null && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Hora de Inicio
                    </label>
                    <input
                      type='time'
                      value={settings.quiet_hours_start ?? '22:00'}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          quiet_hours_start: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Hora de Fin
                    </label>
                    <input
                      type='time'
                      value={settings.quiet_hours_end ?? '08:00'}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          quiet_hours_end: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <button
            onClick={() => void saveSettings()}
            disabled={saving}
            className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {saving ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
