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
    <nav
      className='fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'
      role='navigation'
      aria-label='Navegación principal trabajadora'
    >
      <ul className='mx-auto grid max-w-3xl grid-cols-5 px-2 py-1.5 sm:px-4 sm:py-2'>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className='flex justify-center'>
              <Link
                href={item.href}
                className={
                  active
                    ? 'flex h-12 w-full max-w-[88px] flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700'
                    : 'flex h-12 w-full max-w-[88px] flex-col items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50'
                }
                aria-current={active ? 'page' : undefined}
              >
                <span className='text-base leading-none'>{item.icon}</span>
                <span className='mt-1 text-[10px] font-medium tracking-wide'>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
