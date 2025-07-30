'use client';

import React from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className='p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                👤 Gestión de Clientes
              </h1>
              <p className='text-gray-600'>
                Administra los clientes del servicio SAD
              </p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <span className='text-2xl'>👤</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Clientes
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>45</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <span className='text-2xl'>✅</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>Activos</p>
                    <p className='text-2xl font-bold text-gray-900'>38</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-yellow-100 rounded-lg'>
                    <span className='text-2xl'>📋</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Con Asignación
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>32</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-purple-100 rounded-lg'>
                    <span className='text-2xl'>🆕</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Nuevos Este Mes
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>7</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className='mb-6'>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                ➕ Agregar Cliente
              </Button>
            </div>

            {/* Users Table */}
            <Card className='overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Lista de Clientes
                </h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Cliente
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Estado
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Asignaciones
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Última Visita
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    <tr>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10'>
                            <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
                              <span className='text-sm font-medium text-green-600'>
                                AM
                              </span>
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              Ana Martínez
                            </div>
                            <div className='text-sm text-gray-500'>
                              ana.martinez@email.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                          Activo
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        2 asignaciones
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        Ayer
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <Button variant='outline' size='sm' className='mr-2'>
                          Editar
                        </Button>
                        <Button variant='outline' size='sm'>
                          Ver
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
