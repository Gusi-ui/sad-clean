import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-2xl'>SAD</span>
            </div>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>SAD LAS</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Sistema de gestión de horas y asignaciones para servicios de cuidado
            a domicilio
          </p>
        </div>

        {/* Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>👥</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Gestión de Trabajadores
            </h3>
            <p className='text-gray-600'>
              Administra cuidadores, auxiliares y enfermeras de manera eficiente
            </p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>📋</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Asignaciones Inteligentes
            </h3>
            <p className='text-gray-600'>
              Crea y gestiona asignaciones con horarios flexibles
            </p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>⏰</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Control de Horas
            </h3>
            <p className='text-gray-600'>
              Seguimiento preciso de horas trabajadas y balances
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center'>
          <div className='space-y-4'>
            <Link href='/dashboard'>
              <Button className='mr-4' size='lg'>
                🚀 Acceder al Sistema
              </Button>
            </Link>
            <Link href='/test-supabase'>
              <Button size='lg' variant='outline'>
                🔧 Test de Conexión
              </Button>
            </Link>
          </div>
          <p className='text-sm text-gray-500 mt-4'>
            Sistema desarrollado con Next.js, TypeScript y Supabase
          </p>
        </div>

        {/* Footer */}
        <div className='mt-16 text-center'>
          <p className='text-gray-500'>
            © 2024 SAD LAS - Sistema de Gestión de Horas y Asignaciones
          </p>
        </div>
      </div>
    </div>
  );
}
