'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'worker';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading, getUserRole } = useAuth();
  const router = useRouter();
  const [roleLoading, setRoleLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'worker' | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!loading) {
        if (!user) {
          router.push('/auth');
          return;
        }

        if (requiredRole) {
          const role = await getUserRole();
          setUserRole(role);

          if (role !== requiredRole) {
            // Redirigir según el rol del usuario
            const defaultRedirect =
              role === 'admin' ? '/dashboard' : '/worker-dashboard';
            router.push(redirectTo ?? defaultRedirect);
            return;
          }
        }

        setRoleLoading(false);
      }
    };

    // eslint-disable-next-line no-void
    void checkUserRole();
  }, [user, loading, requiredRole, redirectTo, router, getUserRole]);

  if (loading || roleLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Ya se está redirigiendo
  }

  if (requiredRole && userRole !== requiredRole) {
    return null; // Ya se está redirigiendo
  }

  return children;
}
