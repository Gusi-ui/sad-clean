import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      {/* Header/Navigation */}
      <header className='relative z-10'>
        <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
                <span className='text-white font-bold text-lg'>SAD</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>
                Sistema de Ayuda a Domicilio
              </span>
            </div>
            <div className='hidden md:flex items-center space-x-6'>
              <Link href='/auth'>
                <Button size='sm' variant='outline'>
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20'>
          <div className='text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center'>
            <div className='mb-12 lg:mb-0'>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
                Gestión Inteligente de{' '}
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                  Servicios de Ayuda a Domicilio
                </span>
              </h1>
              <p className='text-lg md:text-xl text-gray-600 mb-8 leading-relaxed'>
                Optimiza la gestión de trabajadoras, usuarios y planificaciones
                personalizadas para servicios asistenciales domiciliarios con
                tecnología moderna y eficiente.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Link href='/auth'>
                  <Button size='lg' className='w-full sm:w-auto'>
                    🔐 Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className='relative'>
              <div className='bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-2xl'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-white rounded-2xl p-6 shadow-lg'>
                    <div className='text-3xl mb-3'>👥</div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Trabajadoras
                    </h3>
                    <p className='text-sm text-gray-600'>Gestión completa</p>
                  </div>
                  <div className='bg-white rounded-2xl p-6 shadow-lg'>
                    <div className='text-3xl mb-3'>👤</div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Usuarios
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Asistencia personalizada
                    </p>
                  </div>
                  <div className='bg-white rounded-2xl p-6 shadow-lg'>
                    <div className='text-3xl mb-3'>📅</div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Planificación
                    </h3>
                    <p className='text-sm text-gray-600'>Horarios flexibles</p>
                  </div>
                  <div className='bg-white rounded-2xl p-6 shadow-lg'>
                    <div className='text-3xl mb-3'>⏰</div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Control
                    </h3>
                    <p className='text-sm text-gray-600'>Gestión de horas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              ¿Por qué elegir SAD?
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              Nuestra plataforma está diseñada específicamente para optimizar la
              gestión de servicios asistenciales domiciliarios con las mejores
              prácticas del sector.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Gestión de Trabajadoras */}
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>👥</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Gestión de Trabajadoras
              </h3>
              <p className='text-gray-600 mb-6'>
                Administra cuidadoras, auxiliares y enfermeras con perfiles
                detallados, horarios flexibles y seguimiento de rendimiento.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Perfiles completos con especializaciones</li>
                <li>• Gestión de disponibilidad y horarios</li>
                <li>• Seguimiento de rendimiento y calidad</li>
              </ul>
            </div>

            {/* Gestión de Usuarios */}
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>👤</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Gestión de Usuarios
              </h3>
              <p className='text-gray-600 mb-6'>
                Gestiona usuarios con necesidades específicas, historial médico
                y contactos de emergencia para atención personalizada.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Perfiles médicos detallados</li>
                <li>• Contactos de emergencia</li>
                <li>• Historial de servicios</li>
              </ul>
            </div>

            {/* Planificación Personalizada */}
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>📅</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Planificación Personalizada
              </h3>
              <p className='text-gray-600 mb-6'>
                Crea asignaciones inteligentes con horarios flexibles,
                prioridades y seguimiento en tiempo real.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Horarios flexibles y adaptables</li>
                <li>• Sistema de prioridades</li>
                <li>• Seguimiento en tiempo real</li>
              </ul>
            </div>

            {/* Control de Horas */}
            <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>⏰</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Control de Horas
              </h3>
              <p className='text-gray-600 mb-6'>
                Seguimiento preciso de horas trabajadas, balances mensuales y
                gestión de festivos y vacaciones.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Control preciso de horas</li>
                <li>• Balances mensuales</li>
                <li>• Gestión de festivos</li>
              </ul>
            </div>

            {/* Acceso Seguro */}
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>🔒</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Acceso Seguro
              </h3>
              <p className='text-gray-600 mb-6'>
                Sistema de autenticación robusto con roles diferenciados y
                acceso controlado a la información.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Roles diferenciados</li>
                <li>• Acceso controlado</li>
                <li>• Datos protegidos</li>
              </ul>
            </div>

            {/* Tecnología Moderna */}
            <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6'>
                <span className='text-3xl'>💻</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Tecnología Moderna
              </h3>
              <p className='text-gray-600 mb-6'>
                Desarrollado con las últimas tecnologías para garantizar
                rendimiento, seguridad y escalabilidad.
              </p>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Interfaz responsive</li>
                <li>• Actualizaciones automáticas</li>
                <li>• Soporte técnico</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-indigo-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
            ¿Listo para optimizar tu gestión?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Únete a organizaciones que ya confían en SAD para gestionar sus
            servicios asistenciales domiciliarios de manera eficiente.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/auth'>
              <Button
                size='lg'
                className='bg-white text-blue-600 hover:bg-gray-100'
              >
                🔐 Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='col-span-1 md:col-span-2'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>SAD</span>
                </div>
                <span className='text-xl font-bold'>
                  Sistema de Ayuda a Domicilio
                </span>
              </div>
              <p className='text-gray-400 mb-4 max-w-md'>
                Sistema de gestión inteligente para servicios asistenciales
                domiciliarios. Optimiza tu organización con tecnología moderna.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-4'>Funcionalidades</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>• Gestión de Trabajadoras</li>
                <li>• Gestión de Usuarios</li>
                <li>• Planificación Personalizada</li>
                <li>• Control de Horas</li>
              </ul>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-4'>Acceso</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link
                    href='/auth'
                    className='hover:text-white transition-colors'
                  >
                    • Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href='/test-supabase'
                    className='hover:text-white transition-colors'
                  >
                    • Test de Conexión
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
            <p className='text-gray-400'>
              © 2024 SAD - Sistema de Gestión de Servicios Asistenciales
              Domiciliarios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
