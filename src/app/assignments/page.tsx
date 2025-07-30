'use client';

import React from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AssignmentsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className='p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                📋 Gestión de Asignaciones
              </h1>
              <p className='text-gray-600'>
                Administra las asignaciones entre trabajadores y clientes
              </p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <span className='text-2xl'>📋</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Asignaciones
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>28</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <span className='text-2xl'>✅</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>Activas</p>
                    <p className='text-2xl font-bold text-gray-900'>24</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-yellow-100 rounded-lg'>
                    <span className='text-2xl'>⏰</span>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Pendientes
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>4</p>
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
                      Nuevas Esta Semana
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>6</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className='mb-6'>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                ➕ Nueva Asignación
              </Button>
            </div>

            {/* Assignments Table */}
            <Card className='overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Lista de Asignaciones
                </h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Asignación
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Trabajador
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Cliente
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Estado
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Horario
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    <tr>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          ASG-001
                        </div>
                        <div className='text-sm text-gray-500'>
                          Cuidado Domiciliario
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-8 w-8'>
                            <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                              <span className='text-xs font-medium text-blue-600'>
                                MG
                              </span>
                            </div>
                          </div>
                          <div className='ml-3'>
                            <div className='text-sm font-medium text-gray-900'>
                              María García
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-8 w-8'>
                            <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
                              <span className='text-xs font-medium text-green-600'>
                                AM
                              </span>
                            </div>
                          </div>
                          <div className='ml-3'>
                            <div className='text-sm font-medium text-gray-900'>
                              Ana Martínez
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                          Activa
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        L-V 9:00-13:00
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
