'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui';

interface RouteStop {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  startMinutes: number;
  order: number;
  address?: string | null | undefined;
}

interface RouteMapProps {
  routeStops: RouteStop[];
}

const RouteMap: React.FC<RouteMapProps> = ({ routeStops }) => {
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowMap = (): void => {
    setShowMap(true);
    setIsLoading(true);

    // Simular carga del mapa
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  if (!showMap) {
    return (
      <div className='bg-white rounded-xl p-4 border border-gray-200 shadow-sm'>
        <div className='text-center'>
          <div className='w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center'>
            <span className='text-2xl'>🗺️</span>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Ver Ruta en Mapa
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            Visualiza tu ruta optimizada con Google Maps
          </p>
          <div className='space-y-2'>
            <Button onClick={handleShowMap} className='w-full sm:w-auto'>
              📍 Mostrar Mapa
            </Button>
            <p className='text-xs text-gray-500'>
              Requiere configuración de Google Maps API
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              🗺️ Ruta Optimizada
            </h3>
            <p className='text-sm text-gray-600'>
              {routeStops.length} paradas • Ruta más rápida
            </p>
          </div>
          <Button variant='outline' size='sm' onClick={() => setShowMap(false)}>
            ✕
          </Button>
        </div>
      </div>

      <div className='relative'>
        {isLoading ? (
          <div className='h-64 sm:h-80 lg:h-96 bg-gray-100 flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
              <p className='text-sm text-gray-600'>Cargando mapa...</p>
            </div>
          </div>
        ) : (
          <div className='h-64 sm:h-80 lg:h-96 bg-gray-100 flex items-center justify-center'>
            <div className='text-center p-6'>
              <div className='w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🗺️</span>
              </div>
              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                Mapa de Google Maps
              </h4>
              <p className='text-sm text-gray-600 mb-4'>
                Para activar esta funcionalidad:
              </p>
              <div className='text-left text-xs text-gray-600 space-y-1 max-w-sm mx-auto'>
                <p>1. Obtén una API key de Google Maps</p>
                <p>2. Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
                <p>
                  3. Habilita las APIs: Maps JavaScript, Directions, Geocoding
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='p-4 bg-blue-50 border-t border-gray-200'>
        <div className='text-sm text-blue-700'>
          <p className='font-medium mb-2'>📍 Paradas de la ruta:</p>
          <div className='space-y-1'>
            {routeStops.map((stop) => (
              <div
                key={stop.assignmentId}
                className='flex items-center space-x-2'
              >
                <span className='w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center'>
                  {stop.order}
                </span>
                <span className='text-sm'>
                  {stop.userLabel} - {stop.start}
                </span>
                {stop.address !== null && stop.address !== '' && (
                  <span className='text-xs text-blue-600'>
                    ({stop.address})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
