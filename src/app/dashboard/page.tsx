import React from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole='admin'>
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Panel Administrativo
            </h1>
            <p className='text-gray-600 mt-2'>
              Gestiona trabajadoras, usuarios y servicios
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Total Trabajadoras</p>
                  <p className='text-2xl font-bold text-gray-900'>12</p>
                </div>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>👥</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Usuarios Activos</p>
                  <p className='text-2xl font-bold text-gray-900'>45</p>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>👤</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Servicios Hoy</p>
                  <p className='text-2xl font-bold text-gray-900'>28</p>
                </div>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>📅</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Horas Esta Semana</p>
                  <p className='text-2xl font-bold text-gray-900'>156</p>
                </div>
                <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>⏰</span>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Acciones Rápidas
              </h2>
              <div className='space-y-3'>
                <button className='w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>👥</span>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        Gestionar Trabajadoras
                      </p>
                      <p className='text-sm text-gray-600'>
                        Añadir, editar o eliminar trabajadoras
                      </p>
                    </div>
                  </div>
                </button>

                <button className='w-full text-left p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>👤</span>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        Gestionar Usuarios
                      </p>
                      <p className='text-sm text-gray-600'>
                        Administrar usuarios del servicio
                      </p>
                    </div>
                  </div>
                </button>

                <button className='w-full text-left p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>📅</span>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        Planificar Servicios
                      </p>
                      <p className='text-sm text-gray-600'>
                        Crear y gestionar asignaciones
                      </p>
                    </div>
                  </div>
                </button>

                <button className='w-full text-left p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>⏰</span>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        Control de Horas
                      </p>
                      <p className='text-sm text-gray-600'>
                        Revisar balances y horarios
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Actividad Reciente
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>M</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      María García
                    </p>
                    <p className='text-xs text-gray-600'>
                      Completó servicio en Calle Mayor, 123
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>Hace 2h</span>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>A</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      Ana López
                    </p>
                    <p className='text-xs text-gray-600'>
                      Nuevo usuario registrado
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>Hace 4h</span>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>C</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      Carlos Ruiz
                    </p>
                    <p className='text-xs text-gray-600'>
                      Asignación programada para mañana
                    </p>
                  </div>
                  <span className='text-xs text-gray-500'>Hace 6h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
