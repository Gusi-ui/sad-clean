'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';

interface Holiday {
  id: string;
  day: number;
  month: number;
  year: number;
  name: string;
  type: 'national' | 'regional' | 'local';
  created_at: string;
  updated_at: string;
}

interface CreateHolidayData {
  day: number;
  month: number;
  year: number;
  name: string;
  type: 'national' | 'regional' | 'local';
}

export default function HolidaysPage(): React.JSX.Element {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [newHoliday, setNewHoliday] = useState<CreateHolidayData>({
    day: 1,
    month: 1,
    year: new Date().getFullYear(),
    name: '',
    type: 'national',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Cargar festivos
  const loadHolidays = async (year: number): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('year', year)
        .order('month', { ascending: true })
        .order('day', { ascending: true });

      if (error !== null && error !== undefined) {
        // console.error('Error cargando festivos:', error);
        setToastMessage({ message: 'Error cargando festivos', type: 'error' });
        return;
      }

      setHolidays((data as Holiday[]) ?? []);
    } catch (err: unknown) {
      // console.error('Error:', err);
      setToastMessage({
        message: `Error inesperado al cargar festivos: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo festivo
  const createHoliday = async (): Promise<void> => {
    try {
      const { error } = await supabase.from('holidays').insert([newHoliday]);

      if (error !== null && error !== undefined) {
        // console.error('Error creando festivo:', error);
        setToastMessage({ message: 'Error creando festivo', type: 'error' });
        return;
      }

      setNewHoliday({
        day: 1,
        month: 1,
        year: selectedYear,
        name: '',
        type: 'national',
      });
      setShowAddForm(false);
      await loadHolidays(selectedYear);
      setToastMessage({
        message: 'Festivo creado exitosamente',
        type: 'success',
      });
    } catch (err: unknown) {
      // console.error('Error:', err);
      setToastMessage({
        message: `Error inesperado al crear festivo: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    }
  };

  // Actualizar festivo
  const updateHoliday = async (): Promise<void> => {
    if (!editingHoliday) return;

    try {
      const { error } = await supabase
        .from('holidays')
        .update({
          day: editingHoliday.day,
          month: editingHoliday.month,
          year: editingHoliday.year,
          name: editingHoliday.name,
          type: editingHoliday.type,
        })
        .eq('id', editingHoliday.id);

      if (error !== null && error !== undefined) {
        // console.error('Error actualizando festivo:', error);
        setToastMessage({
          message: 'Error actualizando festivo',
          type: 'error',
        });
        return;
      }

      setEditingHoliday(null);
      await loadHolidays(selectedYear);
      setToastMessage({
        message: 'Festivo actualizado exitosamente',
        type: 'success',
      });
    } catch (err: unknown) {
      // console.error('Error:', err);
      setToastMessage({
        message: `Error inesperado al actualizar festivo: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    }
  };

  // Eliminar festivo
  const deleteHoliday = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error !== null && error !== undefined) {
        // console.error('Error eliminando festivo:', error);
        setToastMessage({ message: 'Error eliminando festivo', type: 'error' });
        return;
      }
      await loadHolidays(selectedYear);
      setToastMessage({
        message: 'Festivo eliminado exitosamente',
        type: 'success',
      });
    } catch (err: unknown) {
      // console.error('Error inesperado al eliminar festivo:', err);
      setToastMessage({
        message: `Error inesperado al eliminar festivo: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    } finally {
      setShowDeleteModal(false);
      setHolidayToDelete(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setHolidayToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (holidayToDelete !== null && holidayToDelete !== undefined) {
      deleteHoliday(holidayToDelete).catch((err) =>
        setToastMessage({
          message: `Error al confirmar la eliminación: ${err instanceof Error ? err.message : String(err)}`,
          type: 'error',
        })
      );
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setHolidayToDelete(null);
  };

  // Importar festivos desde web oficial
  const importFromWeb = async (): Promise<void> => {
    try {
      const response = await fetch('/api/holidays/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: selectedYear }),
      });

      if (!response.ok) {
        throw new Error('Error en la importación');
      }

      await loadHolidays(selectedYear);
      setToastMessage({
        message: 'Festivos importados exitosamente',
        type: 'success',
      });
    } catch (err: unknown) {
      // console.error('Error importando festivos:', err);
      setToastMessage({
        message: `Error al importar festivos: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    }
  };

  // Validar festivos
  const validateHolidays = async (): Promise<void> => {
    try {
      const response = await fetch('/api/holidays/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: selectedYear }),
      });

      if (!response.ok) {
        throw new Error('Error en la validación');
      }

      const result = (await response.json()) as {
        summary: { totalHolidays: number };
      };
      setToastMessage({
        message: `Validación completada: ${result.summary.totalHolidays ?? 0} festivos encontrados`,
        type: 'info',
      });
    } catch (err: unknown) {
      // console.error('Error validando festivos:', err);
      setToastMessage({
        message: `Error al validar festivos: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (user !== null && user !== undefined) {
      loadHolidays(selectedYear).catch((err) =>
        setToastMessage({
          message: `Error al cargar festivos en useEffect: ${err instanceof Error ? err.message : String(err)}`,
          type: 'error',
        })
      );
    }
  }, [user, selectedYear]);

  const getMonthName = (month: number): string => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month - 1] ?? '';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'national':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regional':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'local':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'national':
        return 'Nacional';
      case 'regional':
        return 'Regional';
      case 'local':
        return 'Local';
      default:
        return type;
    }
  };

  const groupedHolidays = holidays.reduce<Record<number, Holiday[]>>(
    (acc, holiday) => {
      const month = holiday.month;
      acc[month] ??= [];
      acc[month].push(holiday);
      return acc;
    },
    {}
  );

  return (
    <ProtectedRoute requiredRole='admin'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center space-x-4'>
                  <Link
                    href='/dashboard'
                    className='text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 transition-colors'
                  >
                    <span>←</span>
                    <span>Volver al Dashboard</span>
                  </Link>
                </div>
                <h1 className='text-3xl font-bold text-gray-900 mt-2'>
                  🎯 Administración de Festivos
                </h1>
                <p className='mt-2 text-gray-600'>
                  Gestiona los festivos oficiales de Mataró
                </p>
              </div>
              <div className='flex items-center space-x-4'>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                  }}
                  className='bg-green-600 hover:bg-green-700'
                >
                  ➕ Añadir Festivo
                </Button>
                <Button
                  onClick={() => {
                    importFromWeb().catch((err) =>
                      setToastMessage({
                        message: `Error al importar desde la web: ${err instanceof Error ? err.message : String(err)}`,
                        type: 'error',
                      })
                    );
                  }}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  🔄 Importar desde Web
                </Button>
                <Button
                  onClick={() => {
                    validateHolidays().catch((err) =>
                      setToastMessage({
                        message: `Error al validar: ${err instanceof Error ? err.message : String(err)}`,
                        type: 'error',
                      })
                    );
                  }}
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  ✅ Validar
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Selector de año */}
          <div className='mb-8'>
            <div className='flex items-center space-x-4'>
              <label className='text-lg font-semibold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm'>
                Año:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className='bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors'
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className='text-gray-700 font-medium bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm'>
                {holidays.length} festivos encontrados
              </span>
            </div>
          </div>

          {/* Formulario para añadir festivo */}
          {showAddForm && (
            <Card className='mb-8 p-6'>
              <h3 className='text-lg font-semibold mb-4'>
                ➕ Añadir Nuevo Festivo
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Día
                  </label>
                  <Input
                    type='number'
                    min='1'
                    max='31'
                    value={newHoliday.day}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewHoliday({
                        ...newHoliday,
                        day: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Mes
                  </label>
                  <select
                    value={newHoliday.month}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewHoliday({
                        ...newHoliday,
                        month: Number(e.target.value),
                      })
                    }
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Año
                  </label>
                  <Input
                    type='number'
                    value={newHoliday.year}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewHoliday({
                        ...newHoliday,
                        year: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nombre
                  </label>
                  <Input
                    type='text'
                    value={newHoliday.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewHoliday({ ...newHoliday, name: e.target.value })
                    }
                    placeholder="Ej: Cap d'Any"
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tipo
                  </label>
                  <select
                    value={newHoliday.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewHoliday({
                        ...newHoliday,
                        type: e.target.value as
                          | 'national'
                          | 'regional'
                          | 'local',
                      })
                    }
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='national'>Nacional</option>
                    <option value='regional'>Regional</option>
                    <option value='local'>Local</option>
                  </select>
                </div>
              </div>
              <div className='flex space-x-4 mt-4'>
                <Button
                  onClick={() => {
                    createHoliday().catch((err) =>
                      setToastMessage({
                        message: `Error al crear festivo: ${err instanceof Error ? err.message : String(err)}`,
                        type: 'error',
                      })
                    );
                  }}
                  className='bg-green-600 hover:bg-green-700'
                >
                  ✅ Guardar
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  className='bg-gray-600 hover:bg-gray-700'
                >
                  ❌ Cancelar
                </Button>
              </div>
            </Card>
          )}

          {/* Lista de festivos por mes */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Cargando festivos...</p>
            </div>
          ) : (
            <div className='space-y-8'>
              {Object.keys(groupedHolidays).length === 0 ? (
                <Card className='p-8 text-center'>
                  <div className='text-6xl mb-4'>📅</div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No hay festivos para {selectedYear}
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    No se han encontrado festivos registrados para este año.
                  </p>
                  <Button
                    onClick={() => {
                      importFromWeb().catch((err) =>
                        setToastMessage({
                          message: `Error al importar desde la web: ${err instanceof Error ? err.message : String(err)}`,
                          type: 'error',
                        })
                      );
                    }}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    🔄 Importar desde Web Oficial
                  </Button>
                </Card>
              ) : (
                Object.entries(groupedHolidays).map(
                  ([month, monthHolidays]) => (
                    <Card key={month} className='p-6'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                        📅 {getMonthName(Number(month))}
                      </h3>
                      <div className='grid gap-4'>
                        {monthHolidays.map((holiday) => (
                          <div
                            key={holiday.id}
                            className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'
                          >
                            <div className='flex items-center space-x-4'>
                              <div className='text-2xl font-bold text-gray-900 min-w-[3rem]'>
                                {holiday.day}
                              </div>
                              <div className='flex-1'>
                                <h4 className='font-medium text-gray-900'>
                                  {holiday.name}
                                </h4>
                                <p className='text-sm text-gray-500'>
                                  {holiday.day} de {getMonthName(holiday.month)}{' '}
                                  de {holiday.year}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                                  holiday.type
                                )}`}
                              >
                                {getTypeLabel(holiday.type)}
                              </span>
                            </div>
                            <div className='flex space-x-2'>
                              <Button
                                onClick={() => setEditingHoliday(holiday)}
                                className='bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm'
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(holiday.id)}
                                className='bg-red-600 hover:bg-red-700 px-3 py-1 text-sm'
                              >
                                🗑️ Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                )
              )}
            </div>
          )}
        </div>

        {/* Modal de edición */}
        {editingHoliday && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <Card className='p-6 w-full max-w-md mx-4'>
              <h3 className='text-lg font-semibold mb-4'>✏️ Editar Festivo</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Día
                  </label>
                  <Input
                    type='number'
                    min='1'
                    max='31'
                    value={editingHoliday.day}
                    onChange={(e) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        day: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Mes
                  </label>
                  <select
                    value={editingHoliday.month}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        month: Number(e.target.value),
                      })
                    }
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Año
                  </label>
                  <Input
                    type='number'
                    value={editingHoliday.year}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        year: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nombre
                  </label>
                  <Input
                    type='text'
                    value={editingHoliday.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tipo
                  </label>
                  <select
                    value={editingHoliday.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        type: e.target.value as
                          | 'national'
                          | 'regional'
                          | 'local',
                      })
                    }
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='national'>Nacional</option>
                    <option value='regional'>Regional</option>
                    <option value='local'>Local</option>
                  </select>
                </div>
              </div>
              <div className='flex space-x-4 mt-6'>
                <Button
                  onClick={() => {
                    updateHoliday().catch((err) =>
                      setToastMessage({
                        message: `Error al actualizar festivo: ${err instanceof Error ? err.message : String(err)}`,
                        type: 'error',
                      })
                    );
                  }}
                  className='bg-green-600 hover:bg-green-700'
                >
                  ✅ Guardar
                </Button>
                <Button
                  onClick={() => setEditingHoliday(null)}
                  className='bg-gray-600 hover:bg-gray-700'
                >
                  ❌ Cancelar
                </Button>
              </div>
            </Card>
          </div>
        )}
        {toastMessage && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${toastMessage.type === 'success' ? 'bg-green-500' : toastMessage.type === 'error' ? 'bg-red-500' : toastMessage.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'}`}
            role='alert'
          >
            {toastMessage.message}
          </div>
        )}

        <Modal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          title='Confirmar Eliminación'
        >
          <p className='text-gray-700 mb-4'>
            ¿Estás seguro de que quieres eliminar este festivo? Esta acción no
            se puede deshacer.
          </p>
          <div className='flex justify-end space-x-4'>
            <Button
              onClick={cancelDelete}
              className='bg-gray-500 hover:bg-gray-600'
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Eliminar
            </Button>
          </div>
        </Modal>

        {/* Footer - Mobile First */}
        <footer className='border-t border-gray-200 bg-white py-6 md:py-8 mt-auto mb-16 md:mb-0'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <p className='text-xs md:text-sm text-gray-600 mb-1 md:mb-2 font-medium'>
                © 2025 SAD - Sistema de Gestión
              </p>
              <p className='text-xs text-gray-500'>
                Administración de Festivos - Mataró
              </p>
            </div>
          </div>
        </footer>

        {/* Navegación móvil fija */}
        <Navigation variant='mobile' />
      </div>
    </ProtectedRoute>
  );
}
