'use client';

import React from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function WorkerBalancesPage(): React.JSX.Element {
  return (
    <ProtectedRoute requiredRole='worker'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16 sm:pb-0'>
        <header className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Link
                  href='/worker-dashboard'
                  className='text-gray-600 hover:text-gray-900'
                >
                  ←
                </Link>
                <h1 className='text-lg sm:text-xl font-bold text-gray-900'>
                  ⏱️ Balance de horas
                </h1>
              </div>
              <span className='text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded'>
                Próximamente
              </span>
            </div>
          </div>
        </header>

        <main className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6'>
            <p className='text-gray-700 text-sm'>
              Aquí podrás consultar, por cada usuario asignado, el exceso o
              defecto de horas acumuladas. Esta sección se encuentra en
              desarrollo.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
