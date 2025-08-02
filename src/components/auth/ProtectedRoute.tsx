'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'worker';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Si no hay usuario, redirigir al login
      if (!user) {
        router.push('/auth');
        return;
      }

      // Si se requiere un rol específico, verificarlo
      if (requiredRole) {
        const userRole = user.role;

        // Permitir que super_admin acceda a páginas de admin
        const hasAccess =
          userRole === requiredRole ||
          (userRole === 'super_admin' && requiredRole === 'admin');

        if (!hasAccess) {
          // Redirigir según el rol del usuario
          let defaultRedirect = '/dashboard';

          if (userRole === 'super_admin') {
            defaultRedirect = '/super-dashboard';
          } else if (userRole === 'admin') {
            defaultRedirect = '/dashboard';
          } else if (userRole === 'worker') {
            defaultRedirect = '/worker-dashboard';
          }

          router.push(redirectTo ?? defaultRedirect);
          return;
        }
      }

      setRoleChecked(true);
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Mostrar spinner mientras carga
  if (loading || !roleChecked) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (ya se está redirigiendo)
  if (!user) {
    return null;
  }

  // Si se requiere un rol específico, verificar acceso
  if (requiredRole) {
    const userRole = user.role;
    const hasAccess =
      userRole === requiredRole ||
      (userRole === 'super_admin' && requiredRole === 'admin');

    if (!hasAccess) {
      return null; // Ya se está redirigiendo
    }
  }

  return children;
}
