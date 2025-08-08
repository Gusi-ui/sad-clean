'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function BalancesPage() {
  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            ⏰ Balances de Horas
          </h1>
          <p className='text-gray-600'>
            Gestiona los balances mensuales de horas trabajadas
          </p>
        </div>

        {/* Month Selector */}
        <div className='mb-6'>
          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button variant='outline' size='sm'>
                  ← Mes Anterior
                </Button>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Julio 2024
                </h2>
                <Button variant='outline' size='sm'>
                  Mes Siguiente →
                </Button>
              </div>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                📊 Generar Reporte
              </Button>
            </div>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <span className='text-2xl'>⏰</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Horas</p>
                <p className='text-2xl font-bold text-gray-900'>1,248h</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <span className='text-2xl'>✅</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Horas Normales
                </p>
                <p className='text-2xl font-bold text-gray-900'>1,120h</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-yellow-100 rounded-lg'>
                <span className='text-2xl'>🎯</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Horas Extra</p>
                <p className='text-2xl font-bold text-gray-900'>128h</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <span className='text-2xl'>👥</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Trabajadores
                </p>
                <p className='text-2xl font-bold text-gray-900'>12</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Balances Table */}
        <Card className='overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Balances por Trabajador
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Trabajador
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Horas Normales
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Horas Extra
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Total
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
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
                        <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                          <span className='text-sm font-medium text-blue-600'>
                            MG
                          </span>
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          María García
                        </div>
                        <div className='text-sm text-gray-500'>Cuidadora</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    160h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    12h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    172h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                      Completado
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <Button variant='outline' size='sm' className='mr-2'>
                      Ver Detalle
                    </Button>
                    <Button variant='outline' size='sm'>
                      PDF
                    </Button>
                  </td>
                </tr>
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
                        <div className='text-sm text-gray-500'>Enfermera</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    140h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    8h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    148h
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                      Completado
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <Button variant='outline' size='sm' className='mr-2'>
                      Ver Detalle
                    </Button>
                    <Button variant='outline' size='sm'>
                      PDF
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Footer */}
        <footer className='mt-8 md:mt-12 lg:mt-16 border-t border-gray-200 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>
                © 2025 SAD - Sistema de Gestión de Servicios Asistenciales
                Domiciliarios
              </p>
              <p className='text-xs text-gray-500'>
                Hecho con mucho ❤️ por{' '}
                <span className='font-medium text-gray-700'>Gusi</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
