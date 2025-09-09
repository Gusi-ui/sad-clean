'use client';

import { AlertCircle, Bell, CheckCircle, Send, Users } from 'lucide-react';

import { useEffect, useState } from 'react';

interface Worker {
  id: string;
  name: string;
  surname: string;
  email: string;
}

interface NotificationResult {
  success: boolean;
  workerId: string;
  notification?: {
    id: string;
    title: string;
    body: string;
    type: string;
  };
  error?: string;
}

const NOTIFICATION_TYPES = [
  { value: 'system_message', label: 'Mensaje del Sistema', emoji: '📢' },
  { value: 'assignment_change', label: 'Cambio de Asignación', emoji: '🔄' },
  { value: 'new_user', label: 'Nuevo Usuario', emoji: '👤' },
  { value: 'schedule_change', label: 'Cambio de Horario', emoji: '⏰' },
  { value: 'urgent', label: 'Urgente', emoji: '🚨' },
  { value: 'reminder', label: 'Recordatorio', emoji: '📝' },
];

const QUICK_MESSAGES = [
  {
    title: 'Bienvenida al Sistema',
    body: '¡Bienvenido/a al sistema SAD LAS! Tu cuenta ha sido activada correctamente.',
    type: 'system_message',
  },
  {
    title: 'Cambio de Horario',
    body: 'Tu horario de trabajo ha sido actualizado. Revisa tus nuevas asignaciones.',
    type: 'schedule_change',
  },
  {
    title: 'Nueva Asignación',
    body: 'Se te ha asignado un nuevo usuario. Revisa los detalles en tu dashboard.',
    type: 'assignment_change',
  },
  {
    title: 'Recordatorio Importante',
    body: 'Recuerda completar los informes pendientes antes del fin del día.',
    type: 'reminder',
  },
  {
    title: 'Actualización Urgente',
    body: 'Hay cambios importantes en tu ruta de hoy. Revisa inmediatamente.',
    type: 'urgent',
  },
];

export default function CreateNotificationPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('system_message');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NotificationResult[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string>(''); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Cargar workers disponibles
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const response = await fetch('/api/workers');
        const data = (await response.json()) as { workers?: Worker[] };

        if (
          (data as { workers?: unknown }).workers &&
          Array.isArray((data as { workers?: unknown[] }).workers)
        ) {
          setWorkers((data as { workers: Worker[] }).workers);
        } else {
          console.error('No se pudieron cargar los workers');
        }
      } catch (loadError) {
        console.error('Error cargando workers:', loadError);
      }
    };

    loadWorkers().catch((loadWorkersError) => {
      console.error('Error loading workers:', loadWorkersError);
    });
  }, []);

  // Manejar selección de todos los workers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(workers.map((w) => w.id));
    }
    setSelectAll(!selectAll);
  };

  // Manejar selección individual de workers
  const handleWorkerToggle = (workerId: string) => {
    setSelectedWorkers((prev) => {
      const newSelection = prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId];

      setSelectAll(newSelection.length === workers.length);
      return newSelection;
    });
  };

  // Aplicar mensaje rápido
  const applyQuickMessage = (message: (typeof QUICK_MESSAGES)[0]) => {
    setTitle(message.title);
    setBody(message.body);
    setType(message.type);
  };

  // Enviar notificaciones
  const sendNotifications = async () => {
    if (selectedWorkers.length === 0 || !title.trim() || !body.trim()) {
      setError(
        'Por favor completa todos los campos y selecciona al menos un trabajador'
      );
      return;
    }

    setLoading(true);
    setResults([]);

    const notificationPromises = selectedWorkers.map(async (workerId) => {
      try {
        const response = await fetch('/api/test-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId,
            title: title.trim(),
            body: body.trim(),
            type,
          }),
        });

        const data = (await response.json()) as {
          success?: boolean;
          notification?: unknown;
          error?: string;
        };

        return {
          workerId,
          success:
            response.ok && (data as { success?: boolean }).success === true,
          notification: (data as { notification?: unknown }).notification as
            | {
                id: string;
                title: string;
                body: string;
                type: string;
              }
            | undefined,
          error: (data as { error?: string }).error,
        };
      } catch (notificationError) {
        return {
          workerId,
          success: false,
          error:
            notificationError instanceof Error
              ? notificationError.message
              : 'Error desconocido',
        };
      }
    });

    const notificationResults = await Promise.all(notificationPromises);
    setResults(notificationResults);
    setLoading(false);
  };

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Panel de Creación de Notificaciones */}
          <div className='space-y-6'>
            <div className='bg-white rounded-2xl shadow-lg p-8'>
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                    <Bell className='h-8 w-8 text-blue-600' />
                    Crear Notificación
                  </h1>
                  <div className='text-sm text-gray-500'>
                    {workers.length} trabajadores disponibles
                  </div>
                </div>
                <p className='text-gray-600'>
                  Envía notificaciones personalizadas a los trabajadores
                  seleccionados
                </p>
              </div>

              {/* Mensajes Rápidos */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  💡 Mensajes Rápidos
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {QUICK_MESSAGES.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => applyQuickMessage(msg)}
                      className='text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                    >
                      <div className='font-medium text-sm text-gray-900'>
                        {msg.title}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {msg.body.substring(0, 40)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de Notificación */}
              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    📝 Título *
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Ej: Actualización Importante'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    📄 Mensaje *
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Escribe el contenido de la notificación...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    🏷️ Tipo de Notificación
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {NOTIFICATION_TYPES.map((nt) => (
                      <option key={nt.value} value={nt.value}>
                        {nt.emoji} {nt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resultados de Envío */}
            {results.length > 0 && (
              <div className='bg-white rounded-2xl shadow-lg p-8'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    📊 Resultados del Envío
                  </h2>
                  <div className='flex gap-4 text-sm'>
                    <span className='text-green-600 font-medium'>
                      ✅ {successCount} exitosas
                    </span>
                    {errorCount > 0 && (
                      <span className='text-red-600 font-medium'>
                        ❌ {errorCount} errores
                      </span>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  {results.map((result, index) => {
                    const worker = workers.find(
                      (w) => w.id === result.workerId
                    );
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            {result.success ? (
                              <CheckCircle className='h-5 w-5 text-green-600' />
                            ) : (
                              <AlertCircle className='h-5 w-5 text-red-600' />
                            )}
                            <div>
                              <div className='font-medium text-gray-900'>
                                {worker?.name} {worker?.surname}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {worker?.email}
                              </div>
                            </div>
                          </div>
                          <div className='text-xs text-gray-500'>
                            {result.success ? 'Enviada' : 'Error'}
                          </div>
                        </div>
                        {result.error && (
                          <div className='mt-2 text-sm text-red-600'>
                            {result.error}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Panel de Selección de Trabajadores */}
          <div className='space-y-6'>
            <div className='bg-white rounded-2xl shadow-lg p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
                  <Users className='h-6 w-6 text-blue-600' />
                  Seleccionar Trabajadores
                </h2>
                <span className='text-sm text-gray-500'>
                  {selectedWorkers.length} de {workers.length} seleccionados
                </span>
              </div>

              {/* Botón Seleccionar Todos */}
              <div className='mb-6'>
                <button
                  onClick={handleSelectAll}
                  className='w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-colors'
                >
                  {selectAll
                    ? '❌ Deseleccionar Todos'
                    : '✅ Seleccionar Todos'}
                </button>
              </div>

              {/* Lista de Trabajadores */}
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {workers.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>No hay trabajadores disponibles</p>
                    <p className='text-sm'>Verifica la conexión con Supabase</p>
                  </div>
                ) : (
                  workers.map((worker) => (
                    <div
                      key={worker.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedWorkers.includes(worker.id)
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleWorkerToggle(worker.id)}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={selectedWorkers.includes(worker.id)}
                            onChange={() => handleWorkerToggle(worker.id)}
                            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                          />
                          <div>
                            <div className='font-medium text-gray-900'>
                              {worker.name} {worker.surname}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {worker.email}
                            </div>
                          </div>
                        </div>
                        <div className='text-xs text-gray-400'>
                          ID: {worker.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón de Envío */}
              <div className='mt-8'>
                <button
                  onClick={() => {
                    sendNotifications().catch((sendError) => {
                      console.error('Error sending notifications:', sendError);
                    });
                  }}
                  disabled={
                    loading ||
                    selectedWorkers.length === 0 ||
                    !title.trim() ||
                    !body.trim()
                  }
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3'
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      Enviando Notificaciones...
                    </>
                  ) : (
                    <>
                      <Send className='h-5 w-5' />
                      🚀 Enviar a {selectedWorkers.length} Trabajador
                      {selectedWorkers.length !== 1 ? 'es' : ''}
                    </>
                  )}
                </button>

                {selectedWorkers.length === 0 && (
                  <p className='text-sm text-gray-500 mt-2 text-center'>
                    Selecciona al menos un trabajador
                  </p>
                )}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className='bg-white rounded-2xl shadow-lg p-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                📋 Información del Sistema
              </h3>

              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Estado de Supabase</span>
                  <span className='font-medium text-green-600'>
                    ✅ Conectado
                  </span>
                </div>

                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Workers Disponibles</span>
                  <span className='font-medium text-blue-600'>
                    {workers.length}
                  </span>
                </div>

                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Workers Seleccionados</span>
                  <span className='font-medium text-purple-600'>
                    {selectedWorkers.length}
                  </span>
                </div>

                <div className='flex justify-between items-center py-2'>
                  <span className='text-gray-600'>Tipo de Notificación</span>
                  <span className='font-medium text-orange-600'>
                    {NOTIFICATION_TYPES.find((nt) => nt.value === type)?.label}
                  </span>
                </div>
              </div>

              <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h4 className='font-medium text-blue-900 mb-2'>
                  💡 Consejos para Pruebas Efectivas
                </h4>
                <ul className='text-sm text-blue-800 space-y-1'>
                  <li>• Abre el dashboard de trabajadores en otra pestaña</li>
                  <li>
                    • Verifica que aparezcan las notificaciones en tiempo real
                  </li>
                  <li>• Prueba diferentes tipos de notificaciones</li>
                  <li>
                    • Revisa la consola del navegador para logs detallados
                  </li>
                  <li>• Asegúrate de que los workers estén autenticados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
