'use client';

import { useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface Worker {
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  type?: string;
  status?: string;
}

export default function WorkersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const handleAddWorker = () => {
    setIsAddModalOpen(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditModalOpen(true);
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };

  return (
    <ProtectedRoute requiredRole='admin'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
        {/* Header Móvil */}
        <header className='bg-white shadow-sm border-b border-gray-200 lg:hidden'>
          <div className='px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 64 64'
                  width='32'
                  height='32'
                  className='w-full h-full'
                >
                  <defs>
                    <linearGradient
                      id='mobileWorkersLogoGradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='100%'
                    >
                      <stop offset='0%' stopColor='#3b82f6' />
                      <stop offset='100%' stopColor='#22c55e' />
                    </linearGradient>
                  </defs>
                  <circle
                    cx='32'
                    cy='32'
                    r='30'
                    fill='url(#mobileWorkersLogoGradient)'
                  />
                  <path
                    d='M32 50C32 50 12 36.36 12 24.5C12 17.6 17.6 12 24.5 12C28.09 12 31.36 13.94 32 16.35C32.64 13.94 35.91 12 39.5 12C46.4 12 52 17.6 52 24.5C52 36.36 32 50 32 50Z'
                    fill='white'
                    stroke='white'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
              <span className='text-lg font-bold text-gray-900'>SAD</span>
            </div>
            <Link
              href='/dashboard'
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </Link>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          {/* Header Desktop */}
          <div className='hidden lg:block mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  👥 Gestión de Trabajadoras
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administra el equipo de servicios asistenciales domiciliarios
                </p>
              </div>
              <Link
                href='/dashboard'
                className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-4 h-4 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                Volver al Dashboard
              </Link>
            </div>
          </div>

          {/* Header Mobile */}
          <div className='lg:hidden mb-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              👥 Gestión de Trabajadoras
            </h1>
            <p className='text-gray-600 text-sm'>
              Administra el equipo de servicios asistenciales
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <Card className='p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
              <div className='flex items-center'>
                <div className='text-2xl lg:text-3xl mr-3'>👥</div>
                <div>
                  <p className='text-sm lg:text-base font-medium text-gray-600'>
                    Total Trabajadoras
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    12
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
              <div className='flex items-center'>
                <div className='text-2xl lg:text-3xl mr-3'>✅</div>
                <div>
                  <p className='text-sm lg:text-base font-medium text-gray-600'>
                    Activas
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    10
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'>
              <div className='flex items-center'>
                <div className='text-2xl lg:text-3xl mr-3'>⏸️</div>
                <div>
                  <p className='text-sm lg:text-base font-medium text-gray-600'>
                    Inactivas
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    2
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
              <div className='flex items-center'>
                <div className='text-2xl lg:text-3xl mr-3'>📋</div>
                <div>
                  <p className='text-sm lg:text-base font-medium text-gray-600'>
                    Asignaciones
                  </p>
                  <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                    28
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className='mb-6'>
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
              onClick={handleAddWorker}
            >
              ➕ Agregar Trabajadora
            </Button>
          </div>

          {/* Workers Table */}
          <Card className='overflow-hidden shadow-lg'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Trabajadora
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Teléfono
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Estado
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  <tr className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md'>
                          <span className='text-sm font-bold text-white'>
                            MG
                          </span>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            María García
                          </div>
                          <div className='text-sm text-gray-500'>
                            DNI: 12345678A
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                      maria.garcia@email.com
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                      +34 600 123 456
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'>
                        Activa
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      <button
                        className='text-blue-600 hover:text-blue-900 transition-colors'
                        onClick={() =>
                          handleViewWorker({
                            name: 'María García',
                            email: 'maria.garcia@email.com',
                            phone: '+34 600 123 456',
                            dni: '12345678A',
                            type: 'Cuidadora',
                            status: 'Activa',
                          })
                        }
                      >
                        👁️ Ver
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 transition-colors'
                        onClick={() =>
                          handleEditWorker({
                            name: 'María García',
                            email: 'maria.garcia@email.com',
                            phone: '+34 600 123 456',
                            dni: '12345678A',
                            type: 'Cuidadora',
                            status: 'Activa',
                          })
                        }
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-md'>
                          <span className='text-sm font-bold text-white'>
                            JL
                          </span>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            Juan López
                          </div>
                          <div className='text-sm text-gray-500'>
                            DNI: 87654321B
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                      juan.lopez@email.com
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                      +34 600 654 321
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'>
                        Activo
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      <button
                        className='text-blue-600 hover:text-blue-900 transition-colors'
                        onClick={() =>
                          handleViewWorker({
                            name: 'Juan López',
                            email: 'juan.lopez@email.com',
                            phone: '+34 600 654 321',
                            dni: '87654321B',
                            type: 'Cuidador',
                            status: 'Activo',
                          })
                        }
                      >
                        👁️ Ver
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 transition-colors'
                        onClick={() =>
                          handleEditWorker({
                            name: 'Juan López',
                            email: 'juan.lopez@email.com',
                            phone: '+34 600 654 321',
                            dni: '87654321B',
                            type: 'Cuidador',
                            status: 'Activo',
                          })
                        }
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Footer Simplificado */}
        <footer className='mt-12 lg:mt-16 border-t border-gray-200 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-500 mb-2'>
                © {new Date().getFullYear()} SAD - Sistema de Gestión de
                Servicios Asistenciales Domiciliarios
              </p>
              <p className='text-sm text-gray-500'>
                Hecho con mucho ❤️ por Gusi
              </p>
            </div>
          </div>
        </footer>

        {/* Add Worker Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title='Agregar Nueva Trabajadora'
          size='lg'
        >
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre Completo *
                </label>
                <Input
                  className='w-full'
                  placeholder='María García López'
                  type='text'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <Input
                  className='w-full'
                  placeholder='maria.garcia@email.com'
                  type='email'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <Input
                  className='w-full'
                  placeholder='+34 600 123 456'
                  type='tel'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  DNI *
                </label>
                <Input className='w-full' placeholder='12345678A' type='text' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo de Trabajadora
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value=''>Seleccionar tipo</option>
                  <option value='cuidadora'>Cuidadora</option>
                  <option value='cuidador'>Cuidador</option>
                  <option value='auxiliar'>Auxiliar</option>
                  <option value='enfermera'>Enfermera</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='activa'>Activa</option>
                  <option value='inactiva'>Inactiva</option>
                  <option value='vacaciones'>Vacaciones</option>
                </select>
              </div>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                Guardar Trabajadora
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Worker Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title='Editar Trabajadora'
          size='lg'
        >
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre Completo *
                </label>
                <Input
                  className='w-full'
                  defaultValue={selectedWorker?.name}
                  type='text'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <Input
                  className='w-full'
                  defaultValue={selectedWorker?.email}
                  type='email'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <Input
                  className='w-full'
                  defaultValue={selectedWorker?.phone}
                  type='tel'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  DNI *
                </label>
                <Input
                  className='w-full'
                  defaultValue={selectedWorker?.dni}
                  type='text'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo de Trabajadora
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='cuidadora'>Cuidadora</option>
                  <option value='cuidador'>Cuidador</option>
                  <option value='auxiliar'>Auxiliar</option>
                  <option value='enfermera'>Enfermera</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='activa'>Activa</option>
                  <option value='inactiva'>Inactiva</option>
                  <option value='vacaciones'>Vacaciones</option>
                </select>
              </div>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                Actualizar Trabajadora
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Worker Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title='Detalles de la Trabajadora'
          size='md'
        >
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg'>
                <span className='text-2xl font-bold text-white'>
                  {selectedWorker?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  {selectedWorker?.name}
                </h3>
                <p className='text-gray-500'>{selectedWorker?.email}</p>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre Completo
                </label>
                <p className='text-sm text-gray-900'>{selectedWorker?.name}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <p className='text-sm text-gray-900'>{selectedWorker?.email}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <p className='text-sm text-gray-900'>{selectedWorker?.phone}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  DNI
                </label>
                <p className='text-sm text-gray-900'>{selectedWorker?.dni}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo
                </label>
                <p className='text-sm text-gray-900'>{selectedWorker?.type}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <span className='inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'>
                  {selectedWorker?.status}
                </span>
              </div>
            </div>

            <div className='flex justify-end pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
