'use client';

import React from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PlanningPage() {
  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            📅 Planificación Semanal
          </h1>
          <p className='text-gray-600'>
            Gestiona la planificación de servicios SAD
          </p>
        </div>

        {/* Week Selector */}
        <div className='mb-6'>
          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button variant='outline' size='sm'>
                  ← Semana Anterior
                </Button>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Semana del 29 Julio - 4 Agosto 2024
                </h2>
                <Button variant='outline' size='sm'>
                  Semana Siguiente →
                </Button>
              </div>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                📅 Ver Calendario
              </Button>
            </div>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <div className='grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8'>
          {/* Monday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Lunes</h3>
              <p className='text-sm text-gray-500'>29 Julio</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-blue-50 rounded border-l-4 border-blue-500'>
                <p className='text-xs font-medium text-blue-900'>
                  María García
                </p>
                <p className='text-xs text-blue-700'>Juan López - 4h</p>
              </div>
              <div className='p-2 bg-green-50 rounded border-l-4 border-green-500'>
                <p className='text-xs font-medium text-green-900'>
                  Ana Martínez
                </p>
                <p className='text-xs text-green-700'>Carmen Ruiz - 6h</p>
              </div>
            </div>
          </Card>

          {/* Tuesday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Martes</h3>
              <p className='text-sm text-gray-500'>30 Julio</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-blue-50 rounded border-l-4 border-blue-500'>
                <p className='text-xs font-medium text-blue-900'>
                  María García
                </p>
                <p className='text-xs text-blue-700'>Juan López - 4h</p>
              </div>
            </div>
          </Card>

          {/* Wednesday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Miércoles</h3>
              <p className='text-sm text-gray-500'>31 Julio</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-purple-50 rounded border-l-4 border-purple-500'>
                <p className='text-xs font-medium text-purple-900'>
                  Carlos López
                </p>
                <p className='text-xs text-purple-700'>Isabel Torres - 8h</p>
              </div>
            </div>
          </Card>

          {/* Thursday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Jueves</h3>
              <p className='text-sm text-gray-500'>1 Agosto</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-blue-50 rounded border-l-4 border-blue-500'>
                <p className='text-xs font-medium text-blue-900'>
                  María García
                </p>
                <p className='text-xs text-blue-700'>Juan López - 4h</p>
              </div>
            </div>
          </Card>

          {/* Friday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Viernes</h3>
              <p className='text-sm text-gray-500'>2 Agosto</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-green-50 rounded border-l-4 border-green-500'>
                <p className='text-xs font-medium text-green-900'>
                  Ana Martínez
                </p>
                <p className='text-xs text-green-700'>Carmen Ruiz - 6h</p>
              </div>
            </div>
          </Card>

          {/* Saturday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Sábado</h3>
              <p className='text-sm text-gray-500'>3 Agosto</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-yellow-50 rounded border-l-4 border-yellow-500'>
                <p className='text-xs font-medium text-yellow-900'>
                  Laura Sánchez
                </p>
                <p className='text-xs text-yellow-700'>Pedro García - 4h</p>
              </div>
            </div>
          </Card>

          {/* Sunday */}
          <Card className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-900'>Domingo</h3>
              <p className='text-sm text-gray-500'>4 Agosto</p>
            </div>
            <div className='space-y-2'>
              <div className='p-2 bg-red-50 rounded border-l-4 border-red-500'>
                <p className='text-xs font-medium text-red-900'>Urgencia</p>
                <p className='text-xs text-red-700'>María García - 2h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <span className='text-2xl'>👥</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Trabajadores Activos
                </p>
                <p className='text-2xl font-bold text-gray-900'>8</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <span className='text-2xl'>⏰</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Horas Programadas
                </p>
                <p className='text-2xl font-bold text-gray-900'>156h</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <span className='text-2xl'>📋</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Asignaciones
                </p>
                <p className='text-2xl font-bold text-gray-900'>12</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
