'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  created_at: string;
}

export default function SuperDashboardPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  // Cargar administradores existentes
  useEffect(() => {
    // Implementar carga desde Supabase
    setAdmins([
      {
        id: '1',
        email: 'admin@sadlas.com',
        name: 'Administrador de Prueba',
        role: 'admin',
        created_at: '2024-01-01',
      },
    ]);
  }, []);

  const handleCreateAdmin = () => {
    setLoading(true);
    try {
      // Implementar creación en Supabase
      const newAdminUser: AdminUser = {
        id: Date.now().toString(),
        email: newAdmin.email,
        name: newAdmin.name,
        role: 'admin',
        created_at: new Date().toISOString(),
      };

      setAdmins([...admins, newAdminUser]);
      setIsCreateAdminModalOpen(false);
      setNewAdmin({ email: '', password: '', name: '' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating admin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole='super_admin'>
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600'>
                  <span className='text-white text-xl font-bold'>👑</span>
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Súper Administrador
                  </h1>
                  <p className='text-gray-600'>Panel de control del sistema</p>
                </div>
              </div>
              <Button
                onClick={() => setIsCreateAdminModalOpen(true)}
                className='bg-purple-600 hover:bg-purple-700 text-white'
              >
                ➕ Crear Administrador
              </Button>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card className='p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
              <div className='flex items-center'>
                <div className='text-3xl mr-4'>👑</div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Súper Admin
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>1</p>
                </div>
              </div>
            </Card>

            <Card className='p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
              <div className='flex items-center'>
                <div className='text-3xl mr-4'>👥</div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Administradores
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {admins.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
              <div className='flex items-center'>
                <div className='text-3xl mr-4'>👷</div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Trabajadoras
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>4</p>
                </div>
              </div>
            </Card>

            <Card className='p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'>
              <div className='flex items-center'>
                <div className='text-3xl mr-4'>👤</div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Usuarios</p>
                  <p className='text-2xl font-bold text-gray-900'>12</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            <Card className='p-6 hover:shadow-lg transition-all duration-200 cursor-pointer'>
              <Link href='/dashboard' className='block'>
                <div className='flex items-center'>
                  <div className='text-3xl mr-4'>📊</div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Dashboard Administrativo
                    </h3>
                    <p className='text-gray-600'>Acceso completo al sistema</p>
                  </div>
                </div>
              </Link>
            </Card>

            <Card className='p-6 hover:shadow-lg transition-all duration-200 cursor-pointer'>
              <Link href='/workers' className='block'>
                <div className='flex items-center'>
                  <div className='text-3xl mr-4'>👥</div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Gestión de Trabajadoras
                    </h3>
                    <p className='text-gray-600'>Administrar equipo</p>
                  </div>
                </div>
              </Link>
            </Card>

            <Card className='p-6 hover:shadow-lg transition-all duration-200 cursor-pointer'>
              <Link href='/users' className='block'>
                <div className='flex items-center'>
                  <div className='text-3xl mr-4'>👤</div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Gestión de Usuarios
                    </h3>
                    <p className='text-gray-600'>Clientes y servicios</p>
                  </div>
                </div>
              </Link>
            </Card>
          </div>

          {/* Administradores List */}
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Administradores del Sistema
              </h2>
              <span className='text-sm text-gray-500'>
                {admins.length} administrador{admins.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div className='space-y-4'>
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center'>
                      <span className='text-white font-bold'>
                        {admin.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        {admin.name}
                      </h3>
                      <p className='text-sm text-gray-500'>{admin.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                      Administrador
                    </span>
                    <span className='text-xs text-gray-500'>
                      Creado: {new Date(admin.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <p>No hay administradores creados</p>
                  <p className='text-sm'>
                    Crea el primer administrador del sistema
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Create Admin Modal */}
        <Modal
          isOpen={isCreateAdminModalOpen}
          onClose={() => setIsCreateAdminModalOpen(false)}
          title='Crear Nuevo Administrador'
          size='md'
        >
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre Completo *
              </label>
              <Input
                className='w-full'
                placeholder='Nombre del administrador'
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email *
              </label>
              <Input
                className='w-full'
                type='email'
                placeholder='admin@empresa.com'
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Contraseña *
              </label>
              <Input
                className='w-full'
                type='password'
                placeholder='Contraseña segura'
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
              />
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsCreateAdminModalOpen(false);
                  setNewAdmin({ email: '', password: '', name: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                className='bg-purple-600 hover:bg-purple-700 text-white'
                onClick={handleCreateAdmin}
                disabled={
                  loading ||
                  !newAdmin.name ||
                  !newAdmin.email ||
                  !newAdmin.password
                }
              >
                {loading ? 'Creando...' : 'Crear Administrador'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
