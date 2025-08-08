import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';

export default function WorkerDashboard() {
  return (
    <ProtectedRoute requiredRole='worker'>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>SAD</span>
                </div>
                <span className='text-lg font-semibold text-gray-900'>
                  Mi Dashboard
                </span>
              </div>
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-600'>María García</span>
                <Link href='/auth'>
                  <Button size='sm' variant='outline'>
                    Cerrar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Welcome Section */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white'>
            <h1 className='text-2xl font-bold mb-2'>¡Buenos días, María!</h1>
            <p className='text-blue-100'>
              Tienes 3 servicios programados para hoy
            </p>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Servicios Hoy</p>
                  <p className='text-2xl font-bold text-gray-900'>3</p>
                </div>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>📅</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Horas Esta Semana</p>
                  <p className='text-2xl font-bold text-gray-900'>24</p>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>⏰</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Usuarios Activos</p>
                  <p className='text-2xl font-bold text-gray-900'>5</p>
                </div>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <span className='text-2xl'>👤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className='bg-white rounded-2xl shadow-sm mb-8'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                Horario de Hoy
              </h2>
              <p className='text-gray-600'>Lunes, 30 de Julio</p>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {/* Service 1 */}
                <div className='flex items-center justify-between p-4 bg-blue-50 rounded-xl'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
                      <span className='text-white font-bold'>1</span>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        Sra. López
                      </h3>
                      <p className='text-sm text-gray-600'>Calle Mayor, 123</p>
                      <p className='text-sm text-blue-600'>08:00 - 10:00</p>
                    </div>
                  </div>
                  <Button size='sm' variant='outline'>
                    Ver Detalles
                  </Button>
                </div>

                {/* Service 2 */}
                <div className='flex items-center justify-between p-4 bg-green-50 rounded-xl'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center'>
                      <span className='text-white font-bold'>2</span>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        D. Martínez
                      </h3>
                      <p className='text-sm text-gray-600'>Av. Principal, 45</p>
                      <p className='text-sm text-green-600'>12:00 - 14:00</p>
                    </div>
                  </div>
                  <Button size='sm' variant='outline'>
                    Ver Detalles
                  </Button>
                </div>

                {/* Service 3 */}
                <div className='flex items-center justify-between p-4 bg-purple-50 rounded-xl'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center'>
                      <span className='text-white font-bold'>3</span>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        Sra. García
                      </h3>
                      <p className='text-sm text-gray-600'>Calle Nueva, 78</p>
                      <p className='text-sm text-purple-600'>16:00 - 18:00</p>
                    </div>
                  </div>
                  <Button size='sm' variant='outline'>
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Acciones Rápidas
              </h3>
              <div className='space-y-3'>
                <Button className='w-full justify-start' variant='outline'>
                  📋 Ver Mi Horario Completo
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  📊 Mis Estadísticas
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  📞 Contactar Administración
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  ⚙️ Configuración
                </Button>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Próximos Servicios
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Mañana</p>
                    <p className='text-sm text-gray-600'>
                      2 servicios programados
                    </p>
                  </div>
                  <span className='text-blue-600 font-semibold'>2</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Esta Semana</p>
                    <p className='text-sm text-gray-600'>
                      15 servicios programados
                    </p>
                  </div>
                  <span className='text-green-600 font-semibold'>15</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>Este Mes</p>
                    <p className='text-sm text-gray-600'>
                      68 servicios programados
                    </p>
                  </div>
                  <span className='text-purple-600 font-semibold'>68</span>
                </div>
              </div>
            </div>
          </div>
        </main>

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
    </ProtectedRoute>
  );
}
