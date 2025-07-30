'use client';

import React, { useState } from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
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
    <ProtectedRoute>
      <Layout>
        <div className='p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-6 lg:mb-8'>
              <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
                👥 Gestión de Trabajadores
              </h1>
              <p className='text-gray-600 text-sm lg:text-base'>
                Administra los trabajadores del servicio SAD
              </p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8'>
              <Card className='p-4 lg:p-6'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>👥</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Total Trabajadores
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      12
                    </p>
                  </div>
                </div>
              </Card>
              <Card className='p-4 lg:p-6'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>✅</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Activos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      10
                    </p>
                  </div>
                </div>
              </Card>
              <Card className='p-4 lg:p-6'>
                <div className='flex items-center'>
                  <div className='text-2xl lg:text-3xl mr-3'>⏸️</div>
                  <div>
                    <p className='text-sm lg:text-base font-medium text-gray-600'>
                      Inactivos
                    </p>
                    <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                      2
                    </p>
                  </div>
                </div>
              </Card>
              <Card className='p-4 lg:p-6'>
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
                className='bg-blue-600 hover:bg-blue-700 text-white'
                onClick={handleAddWorker}
              >
                ➕ Agregar Trabajador
              </Button>
            </div>

            {/* Workers Table */}
            <Card className='overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Trabajador
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
                    <tr>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                            <span className='text-sm font-medium text-blue-600'>
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
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                          Activo
                        </span>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                        <button
                          className='text-blue-600 hover:text-blue-900'
                          onClick={() =>
                            handleViewWorker({
                              name: 'María García',
                              email: 'maria.garcia@email.com',
                              phone: '+34 600 123 456',
                              dni: '12345678A',
                              type: 'Cuidadora',
                              status: 'Activo',
                            })
                          }
                        >
                          👁️ Ver
                        </button>
                        <button
                          className='text-indigo-600 hover:text-indigo-900'
                          onClick={() =>
                            handleEditWorker({
                              name: 'María García',
                              email: 'maria.garcia@email.com',
                              phone: '+34 600 123 456',
                              dni: '12345678A',
                              type: 'Cuidadora',
                              status: 'Activo',
                            })
                          }
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                            <span className='text-sm font-medium text-green-600'>
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
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                          Activo
                        </span>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                        <button
                          className='text-blue-600 hover:text-blue-900'
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
                          className='text-indigo-600 hover:text-indigo-900'
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

          {/* Add Worker Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title='Agregar Nuevo Trabajador'
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
                  <Input
                    className='w-full'
                    placeholder='12345678A'
                    type='text'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tipo de Trabajador
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
                    <option value='activo'>Activo</option>
                    <option value='inactivo'>Inactivo</option>
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
                  Guardar Trabajador
                </Button>
              </div>
            </div>
          </Modal>

          {/* Edit Worker Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title='Editar Trabajador'
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
                    Tipo de Trabajador
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
                    <option value='activo'>Activo</option>
                    <option value='inactivo'>Inactivo</option>
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
                  Actualizar Trabajador
                </Button>
              </div>
            </div>
          </Modal>

          {/* View Worker Modal */}
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title='Detalles del Trabajador'
            size='md'
          >
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-2xl font-bold text-blue-600'>
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
                  <p className='text-sm text-gray-900'>
                    {selectedWorker?.name}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedWorker?.email}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Teléfono
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedWorker?.phone}
                  </p>
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
                  <p className='text-sm text-gray-900'>
                    {selectedWorker?.type}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Estado
                  </label>
                  <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
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
      </Layout>
    </ProtectedRoute>
  );
}
