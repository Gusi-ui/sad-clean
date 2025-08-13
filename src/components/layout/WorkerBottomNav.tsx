'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/worker-dashboard', icon: '🏠' },
  { label: 'Ruta', href: '/worker-dashboard/route', icon: '🗺️' },
  { label: 'Planilla', href: '/worker-dashboard/schedule', icon: '📋' },
  { label: 'Próximos', href: '/worker-dashboard/this-week', icon: '📅' },
  { label: 'Balance', href: '/worker-dashboard/balances', icon: '⏱️' },
];

export default function WorkerBottomNav(): React.JSX.Element {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/worker-dashboard') return pathname === '/worker-dashboard';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <>
      {/* Mobile: solo iconos, estilo como en panel administrativo */}
      <nav
        className='fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-300 shadow-2xl z-50 h-20 sm:hidden'
        role='navigation'
        aria-label='Navegación principal trabajadora'
      >
        <div className='flex justify-around items-center h-full px-2'>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 py-2 rounded-xl ${
                  active
                    ? 'text-blue-600 bg-blue-50 shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className='text-3xl'>{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop/Tablet: icono + etiqueta, ancho completo, fijo inferior */}
      <nav
        className='hidden sm:flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-40 h-16'
        role='navigation'
        aria-label='Navegación principal trabajadora'
      >
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-4'>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-blue-700 bg-blue-50 border border-blue-200'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className='text-xl'>{item.icon}</span>
                <span className='text-sm font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
