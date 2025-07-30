'use client';

import React, { useState } from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import { Badge, Button, Card, Modal } from '@/components/ui';

const DashboardPage: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Datos de ejemplo - en el futuro vendrán de Supabase
  const stats = [
    {
      change: '+2',
      changeType: 'positive',
      icon: '👥',
      name: 'Trabajadores Activos',
      value: '12',
    },
    {
      change: '+5',
      changeType: 'positive',
      icon: '👤',
      name: 'Clientes Activos',
      value: '45',
    },
    {
      change: '+3',
      changeType: 'positive',
      icon: '📋',
      name: 'Asignaciones Activas',
      value: '28',
    },
    {
      change: '+120',
      changeType: 'positive',
      icon: '⏰',
      name: 'Horas Este Mes',
      value: '1,240',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      message: 'Nueva asignación creada para María García',
      status: 'success',
      time: 'Hace 2 horas',
      type: 'assignment',
    },
    {
      id: 2,
      message: 'Trabajador Juan López registrado',
      status: 'info',
      time: 'Hace 4 horas',
      type: 'worker',
    },
    {
      id: 3,
      message: 'Cliente Ana Martínez actualizado',
      status: 'info',
      time: 'Hace 6 horas',
      type: 'client',
    },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-worker':
        window.location.href = '/workers';
        break;
      case 'new-assignment':
        window.location.href = '/assignments';
        break;
      case 'add-client':
        window.location.href = '/users';
        break;
      case 'planning':
        window.location.href = '/planning';
        break;
      default:
        break;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className='p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm p-4 lg:p-6'>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
                🏥 Dashboard SAD
              </h1>
              <p className='text-gray-600 text-sm md:text-base'>
                Resumen general del sistema de gestión de servicios
                asistenciales
              </p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {stats.map((stat) => (
                <Card key={stat.name} className='p-4 md:p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs md:text-sm font-medium text-gray-600 truncate'>
                        {stat.name}
                      </p>
                      <p className='text-xl md:text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                    </div>
                    <div className='text-2xl md:text-3xl ml-2 flex-shrink-0'>
                      {stat.icon}
                    </div>
                  </div>
                  <div className='mt-3 md:mt-4 flex items-center'>
                    <Badge
                      size='sm'
                      variant={
                        stat.changeType === 'positive' ? 'success' : 'error'
                      }
                    >
                      {stat.change}
                    </Badge>
                    <span className='text-xs text-gray-500 ml-2'>
                      vs mes anterior
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
              {/* Recent Activities */}
              <Card className='p-4 md:p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    📊 Actividad Reciente
                  </h3>
                  <button className='text-sm text-blue-600 hover:text-blue-800'>
                    Ver todo
                  </button>
                </div>
                <div className='space-y-3'>
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex-shrink-0'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-gray-900 truncate'>
                          {activity.message}
                        </p>
                        <p className='text-xs text-gray-500'>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className='p-4 md:p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  ⚡ Acciones Rápidas
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <button
                    className='flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                    onClick={() => handleQuickAction('add-worker')}
                  >
                    <span className='text-lg mr-3'>👥</span>
                    <span className='text-sm font-medium text-blue-900'>
                      Agregar Trabajador
                    </span>
                  </button>
                  <button
                    className='flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors'
                    onClick={() => handleQuickAction('new-assignment')}
                  >
                    <span className='text-lg mr-3'>📋</span>
                    <span className='text-sm font-medium text-green-900'>
                      Nueva Asignación
                    </span>
                  </button>
                  <button
                    className='flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
                    onClick={() => handleQuickAction('add-client')}
                  >
                    <span className='text-lg mr-3'>👤</span>
                    <span className='text-sm font-medium text-purple-900'>
                      Agregar Cliente
                    </span>
                  </button>
                  <button
                    className='flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors'
                    onClick={() => handleQuickAction('planning')}
                  >
                    <span className='text-lg mr-3'>📅</span>
                    <span className='text-sm font-medium text-yellow-900'>
                      Ver Planificación
                    </span>
                  </button>
                </div>
              </Card>
            </div>

            {/* System Status */}
            <Card className='p-4 md:p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                🔧 Estado del Sistema
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='flex items-center p-3 bg-green-50 rounded-lg'>
                  <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                  <div>
                    <p className='text-sm font-medium text-green-900'>
                      Base de Datos
                    </p>
                    <p className='text-xs text-green-700'>Conectado</p>
                  </div>
                </div>
                <div className='flex items-center p-3 bg-green-50 rounded-lg'>
                  <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                  <div>
                    <p className='text-sm font-medium text-green-900'>
                      Autenticación
                    </p>
                    <p className='text-xs text-green-700'>Activa</p>
                  </div>
                </div>
                <div className='flex items-center p-3 bg-green-50 rounded-lg'>
                  <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                  <div>
                    <p className='text-sm font-medium text-green-900'>API</p>
                    <p className='text-xs text-green-700'>Funcionando</p>
                  </div>
                </div>
                <div className='flex items-center p-3 bg-green-50 rounded-lg'>
                  <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                  <div>
                    <p className='text-sm font-medium text-green-900'>
                      Sistema
                    </p>
                    <p className='text-xs text-green-700'>Estable</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Profile Modal */}
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title='Mi Perfil'
          size='md'
        >
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-2xl font-bold text-blue-600'>A</span>
              </div>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  Administrador
                </h3>
                <p className='text-gray-500'>admin@sadlas.com</p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre Completo
                </label>
                <input
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  defaultValue='Administrador del Sistema'
                  type='text'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  defaultValue='admin@sadlas.com'
                  type='email'
                  disabled
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Rol
                </label>
                <input
                  className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50'
                  defaultValue='Administrador'
                  type='text'
                  disabled
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsProfileModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
