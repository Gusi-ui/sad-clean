'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import {
  createGoogleMap,
  createLatLngBounds,
  createMarker,
  createSize,
  geocodeAddress,
  getGoogleMapsDiagnostics,
  isGoogleMapsAvailable,
  loadGoogleMapsAPI,
} from '@/lib/google-maps';

// Declaraciones básicas para Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options?: unknown) => unknown;
        Geocoder: new () => {
          geocode: (
            request: {
              address?: string;
              location?: { lat: number; lng: number };
              bounds?: unknown;
              componentRestrictions?: unknown;
            },
            callback: (results: unknown, status: string) => void
          ) => void;
        };
        Marker: new (options: unknown) => unknown;
        MapTypeId: {
          ROADMAP: unknown;
        };
        LatLngBounds: new () => {
          extend: (latLng: unknown) => void;
          isEmpty: () => boolean;
        };
        Size: new (width: number, height: number) => unknown;
        DirectionsService: new () => {
          route: (
            request: {
              origin: { lat: number; lng: number } | string;
              destination: string | { lat: number; lng: number };
              waypoints?: Array<{
                location: string | { lat: number; lng: number };
              }>;
              travelMode: unknown;
              optimizeWaypoints?: boolean;
              provideRouteAlternatives?: boolean;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: (result: any, status: unknown) => void
          ) => void;
        };
        DirectionsRenderer: new (options?: { suppressMarkers?: boolean }) => {
          setMap: (map: unknown) => void;
          setPanel: (panel: HTMLElement) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setDirections: (directions: any) => void;
        };
        TravelMode: { DRIVING: unknown };
        DirectionsStatus: { OK: unknown };
      };
    };
    initMap?: () => void;
  }
}

interface RouteStop {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  order: number;
  address?: string | null | undefined;
}

interface RouteMapProps {
  routeStops: RouteStop[];
}

const RouteMap = ({ routeStops }: RouteMapProps): React.JSX.Element => {
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<ReturnType<
    typeof getGoogleMapsDiagnostics
  > | null>(null);
  const [travelMode, setTravelMode] = useState<
    'DRIVING' | 'WALKING' | 'TRANSIT'
  >(() => {
    if (typeof window === 'undefined') return 'DRIVING';
    const saved = window.localStorage.getItem('route_travel_mode');
    return saved === 'WALKING' || saved === 'TRANSIT' ? saved : 'DRIVING';
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const directionsServiceRef = useRef<unknown>(null);
  // const directionsRendererRef = useRef<unknown>(null);
  const directionsPanelRef = useRef<HTMLDivElement>(null);
  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [totalStops, setTotalStops] = useState<number>(0);
  const [totalDurationText, setTotalDurationText] = useState<string | null>(
    null
  );
  const [originCoords, setOriginCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const normalizeAddress = (raw: string): string => {
    let a = raw.trim();
    a = a
      .replace(/^C\//i, 'Calle ')
      .replace(/\bAvda\.?\b/gi, 'Avenida')
      .replace(/\bAv\.?\b/gi, 'Avenida')
      .replace(/\bNº\b/gi, '')
      .replace(/[º°ª]/g, '')
      .replace(/\s*-\s*\d+\s*.*$/i, '')
      .replace(/\b(piso|puerta|pta|izq|izquierda|dcha|derecha)\b.*$/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!/\bMataró\b/i.test(a)) {
      a = `${a}, Mataró`;
    }
    if (!/\bBarcelona\b/i.test(a)) {
      a = `${a}, Barcelona`;
    }
    if (!/\bEspaña\b/i.test(a)) {
      a = `${a}, España`;
    }
    return a;
  };

  // Mostrar marcadores en el mapa
  const showMarkersOnMap = useCallback(async (): Promise<void> => {
    if (mapInstanceRef.current === null) return;

    const bounds = createLatLngBounds();

    // Agregar marcadores para cada parada (numeración global según orden de la lista)
    for (let idx = 0; idx < routeStops.length; idx++) {
      const stop = routeStops[idx];
      if (
        stop.address !== null &&
        stop.address !== undefined &&
        stop.address !== ''
      ) {
        try {
          const addr = normalizeAddress(stop.address);
          const position = await geocodeAddress(addr, {
            componentRestrictions: {
              country: 'ES',
              locality: 'Mataró',
              administrativeArea: 'Barcelona',
            },
            bounds: {
              sw: { lat: 41.5, lng: 2.38 },
              ne: { lat: 41.58, lng: 2.5 },
            },
          });

          const within = (p: { lat: number; lng: number }): boolean =>
            p.lat >= 41.5 && p.lat <= 41.58 && p.lng >= 2.38 && p.lng <= 2.5;

          let finalPos = position;
          if (!within(position)) {
            // Intentar con variante catalana "Carrer" si cayó fuera
            const alt = addr.replace(/^Calle /i, 'Carrer ');
            try {
              const pos2 = await geocodeAddress(alt, {
                componentRestrictions: {
                  country: 'ES',
                  locality: 'Mataró',
                  administrativeArea: 'Barcelona',
                },
                bounds: {
                  sw: { lat: 41.5, lng: 2.38 },
                  ne: { lat: 41.58, lng: 2.5 },
                },
              });
              if (within(pos2)) finalPos = pos2;
            } catch {
              // mantener position original si falla
            }
          }

          const labelNumber = (idx + 1).toString();
          createMarker({
            position: finalPos,
            map: mapInstanceRef.current,
            title: `${idx + 1}. ${stop.userLabel} - ${stop.address}`,
            label: {
              text: labelNumber,
              color: 'white',
              fontWeight: 'bold',
            },
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${labelNumber}</text>
                </svg>
              `)}`,
              scaledSize: createSize(24, 24),
            },
          });

          bounds.extend(finalPos);
        } catch {
          // Silenciar errores de geocodificación individual para no romper la UX
        }
      }
    }

    // Ajustar el mapa para mostrar todos los marcadores
    if (!bounds.isEmpty()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (mapInstanceRef.current as any).fitBounds(bounds);
    }
  }, [routeStops]);

  // Construir y mostrar ruta usando Directions API
  const drawRoute = useCallback(
    async (origin: { lat: number; lng: number }): Promise<void> => {
      if (mapInstanceRef.current === null) return;

      // Asegurar que hay al menos una parada con dirección válida
      const stopsWithAddress = routeStops.filter(
        (s) => s.address !== undefined && s.address !== null && s.address !== ''
      );
      if (stopsWithAddress.length === 0) return;

      // Geocodificar todas las paradas válidas primero para usar coordenadas
      const coords: Array<{ lat: number; lng: number }> = [];
      for (const s of stopsWithAddress) {
        try {
          const pos = await geocodeAddress(
            normalizeAddress(s.address as string),
            {
              componentRestrictions: {
                country: 'ES',
                locality: 'Mataró',
                administrativeArea: 'Barcelona',
              },
              bounds: {
                sw: { lat: 41.5, lng: 2.38 },
                ne: { lat: 41.58, lng: 2.5 },
              },
            }
          );
          coords.push(pos);
        } catch {
          // Omitir parada no geocodable
        }
      }
      if (coords.length < 2) return;
      const destinationCoord = coords[coords.length - 1] as {
        lat: number;
        lng: number;
      };
      const waypointCoords = coords
        .slice(0, Math.max(0, coords.length - 1))
        .map((c) => ({ location: c }));

      // Instanciar servicios
      const ds = new window.google.maps.DirectionsService();
      directionsServiceRef.current = ds;

      // Limpiar panel anterior de manera segura
      if (directionsPanelRef.current) {
        // Usar textContent en lugar de innerHTML para evitar XSS
        directionsPanelRef.current.textContent = '';
        // O alternativamente, usar removeChild para limpiar completamente
        while (directionsPanelRef.current.firstChild) {
          directionsPanelRef.current.removeChild(
            directionsPanelRef.current.firstChild
          );
        }
      }

      // DRIVING / WALKING: una sola ruta con waypoints
      if (travelMode !== 'TRANSIT') {
        const dr1 = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });
        (dr1 as unknown as { setMap: (m: unknown) => void }).setMap(
          mapInstanceRef.current
        );
        if (directionsPanelRef.current) {
          (dr1 as unknown as { setPanel: (p: HTMLElement) => void }).setPanel(
            directionsPanelRef.current
          );
        }
        await new Promise<void>((resolve, reject) => {
          const request: {
            origin: { lat: number; lng: number };
            destination: { lat: number; lng: number };
            waypoints: Array<{ location: { lat: number; lng: number } }>;
            travelMode: unknown;
            optimizeWaypoints: boolean;
            provideRouteAlternatives: boolean;
          } = {
            origin,
            destination: destinationCoord,
            waypoints: waypointCoords as Array<{
              location: { lat: number; lng: number };
            }>,
            travelMode:
              travelMode === 'WALKING'
                ? (
                    window.google.maps.TravelMode as unknown as Record<
                      string,
                      unknown
                    >
                  )['WALKING']
                : window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            provideRouteAlternatives: false,
          };
          ds.route(request, (result: unknown, status: unknown) => {
            if (
              status === window.google.maps.DirectionsStatus.OK &&
              result !== null
            ) {
              (
                dr1 as unknown as { setDirections: (d: unknown) => void }
              ).setDirections(result);
              try {
                const r = result as {
                  routes?: Array<{
                    legs?: Array<{ duration?: { value?: number } }>;
                  }>;
                };
                const legs = r.routes?.[0]?.legs ?? [];
                let seconds = 0;
                for (const leg of legs) seconds += leg.duration?.value ?? 0;
                const hrs = Math.floor(seconds / 3600);
                const mins = Math.round((seconds % 3600) / 60);
                setTotalDurationText(
                  hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`
                );
                setTotalStops(waypointCoords.length + 1);
              } catch {
                setTotalDurationText(null);
                setTotalStops(0);
              }
              resolve();
            } else reject(new Error('Directions error'));
          });
        });
        return;
      }

      // TRANSIT: dividir por tramos origen->parada1, parada1->parada2, ...
      let totalSeconds = 0;
      const segmentOrigins: Array<{ lat: number; lng: number }> = [
        origin,
        ...coords.slice(0, coords.length - 1),
      ];
      const segmentDestinations: Array<{ lat: number; lng: number }> = [
        ...coords,
      ];

      for (let i = 0; i < segmentOrigins.length; i++) {
        const segOrigin = segmentOrigins[i] as { lat: number; lng: number };
        const segDest = segmentDestinations[i] as { lat: number; lng: number };
        const drSeg = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });
        (drSeg as unknown as { setMap: (m: unknown) => void }).setMap(
          mapInstanceRef.current
        );
        if (directionsPanelRef.current) {
          const segPanel = document.createElement('div');
          segPanel.className =
            'mb-3 pb-3 border-b border-gray-200 last:border-b-0';
          const heading = document.createElement('div');
          heading.className = 'text-xs font-semibold text-gray-700 mb-1';
          heading.textContent = `Tramo ${i + 1}`;
          segPanel.appendChild(heading);
          directionsPanelRef.current.appendChild(segPanel);
          (drSeg as unknown as { setPanel: (p: HTMLElement) => void }).setPanel(
            segPanel
          );
        }
        // Ejecutamos en serie para respetar el orden de render
        await new Promise<void>((resolve, reject) => {
          const req: {
            origin: { lat: number; lng: number };
            destination: { lat: number; lng: number };
            travelMode: unknown;
            provideRouteAlternatives: boolean;
          } = {
            origin: segOrigin,
            destination: segDest,
            travelMode: (
              window.google.maps.TravelMode as unknown as Record<
                string,
                unknown
              >
            )['TRANSIT'],
            provideRouteAlternatives: false,
          };
          ds.route(req, (result: unknown, status: unknown) => {
            if (
              status === window.google.maps.DirectionsStatus.OK &&
              result !== null
            ) {
              (
                drSeg as unknown as { setDirections: (d: unknown) => void }
              ).setDirections(result);
              try {
                const r = result as {
                  routes?: Array<{
                    legs?: Array<{ duration?: { value?: number } }>;
                  }>;
                };
                const legs = r.routes?.[0]?.legs ?? [];
                for (const leg of legs)
                  totalSeconds += leg.duration?.value ?? 0;
              } catch {}
              resolve();
            } else reject(new Error('Directions error'));
          });
        });
      }
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.round((totalSeconds % 3600) / 60);
      setTotalDurationText(hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`);
      setTotalStops(coords.length);
    },
    [routeStops, travelMode]
  );

  const handleShowMap = useCallback(async (): Promise<void> => {
    setShowMap(true);
    setIsLoading(true);
    setError(null);

    try {
      if (!isGoogleMapsAvailable()) {
        await loadGoogleMapsAPI();
      }
    } catch (mapError) {
      const errorMessage =
        mapError instanceof Error ? mapError.message : 'Error desconocido';
      setError(`Error al cargar el mapa: ${errorMessage}`);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('route_travel_mode', travelMode);
    }
  }, [travelMode]);

  // Inicializar mapa cuando el div exista y la API esté lista
  useEffect(() => {
    if (!showMap) return;
    if (mapInstanceRef.current !== null) return;
    const node = mapRef.current;
    if (!node) return;
    if (!isGoogleMapsAvailable()) return;

    try {
      const map = createGoogleMap(node);
      mapInstanceRef.current = map;
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        showMarkersOnMap();
        setIsLoading(false);
      }, 300);

      // Intentar obtener ubicación actual y trazar ruta
      if (navigator.geolocation !== undefined) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const origin = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setOriginCoords(origin);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            drawRoute(origin);
            // Reverse geocoding del origen para mostrar texto
            try {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode(
                { location: origin },
                (results: unknown, status: string) => {
                  if (
                    status === 'OK' &&
                    results !== null &&
                    results !== undefined &&
                    Array.isArray(results) &&
                    results[0] !== null &&
                    results[0] !== undefined
                  ) {
                    const r = results[0] as { formatted_address?: string };
                    if (typeof r.formatted_address === 'string') {
                      setOriginAddress(r.formatted_address);
                    }
                  }
                }
              );
            } catch {
              // Ignorar fallos de reverse geocoding
            }
          },
          () => {
            // Si geolocalización falla, no bloqueamos; solo mostramos marcadores
          },
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 }
        );
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido';
      setError(`Error al inicializar el mapa: ${message}`);
      setIsLoading(false);
    }
  }, [showMap, isGoogleMapsLoaded, showMarkersOnMap, drawRoute]);

  // Redibujar ruta al cambiar el modo si ya tenemos origen
  useEffect(() => {
    if (!showMap) return;
    if (originCoords === null) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    drawRoute(originCoords);
  }, [travelMode, originCoords, drawRoute, showMap]);

  // Verificar disponibilidad de Google Maps al montar el componente
  useEffect(() => {
    const checkAvailability = (): void => {
      if (isGoogleMapsAvailable()) {
        setIsGoogleMapsLoaded(true);
      }

      // Actualizar diagnósticos
      setDiagnostics(getGoogleMapsDiagnostics());
    };

    // Verificar inmediatamente
    checkAvailability();

    // Verificar periódicamente en caso de carga asíncrona
    const interval = setInterval(checkAvailability, 1000);

    return () => clearInterval(interval);
  }, []);

  // Si no hay API de Google Maps, mostrar mensaje de configuración
  if (!isGoogleMapsLoaded && !showMap) {
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
          </div>
        </div>

        <div className='p-6'>
          <div className='text-center'>
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
              <p>3. Habilita las APIs: Maps JavaScript, Geocoding</p>
              <p>4. Configura dominios autorizados en Google Cloud Console</p>
              <p>5. Desactiva bloqueadores de anuncios temporalmente</p>
              <p>6. Reinicia el servidor de desarrollo</p>
            </div>

            {/* Información de diagnóstico */}
            {diagnostics && (
              <div className='mt-4 p-3 bg-gray-50 rounded-lg text-left text-xs'>
                <p className='font-medium mb-2'>🔍 Diagnóstico:</p>
                <div className='space-y-1'>
                  <p>• API Key: {diagnostics.apiKey}</p>
                  <p>
                    • Google Maps disponible:{' '}
                    {diagnostics.isAvailable ? '✅' : '❌'}
                  </p>
                  <p>
                    • Posible bloqueador:{' '}
                    {diagnostics.hasAdBlocker === true
                      ? '⚠️ Detectado'
                      : '✅ No detectado'}
                  </p>
                </div>
              </div>
            )}

            <div className='mt-4'>
              <Button
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  handleShowMap();
                }}
                className='w-full sm:w-auto'
              >
                🔄 Intentar Cargar Mapa
              </Button>
            </div>
          </div>
        </div>

        <div className='p-4 bg-blue-50 border-t border-gray-200'>
          <div className='text-sm text-blue-700'>
            <p className='font-medium mb-2'>📍 Paradas de la ruta:</p>
            <div className='space-y-1'>
              {routeStops.map((stop, index) => (
                <div
                  key={`${stop.assignmentId}-${stop.start}-${stop.end}-${index}`}
                  className='flex items-center space-x-2'
                >
                  <span className='w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center'>
                    {index + 1}
                  </span>
                  <span className='text-sm'>
                    {stop.userLabel} - {stop.start}
                  </span>
                  {stop.address !== null &&
                    stop.address !== undefined &&
                    stop.address !== '' && (
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
          {showMap && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowMap(false)}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {!showMap ? (
        <div className='p-6'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-2xl'>🗺️</span>
            </div>
            <h4 className='text-lg font-semibold text-gray-900 mb-2'>
              Ver Ruta en Mapa
            </h4>
            <p className='text-sm text-gray-600 mb-4'>
              Visualiza tus paradas en Google Maps
            </p>
            <div className='space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2'>
              <Button
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  handleShowMap();
                }}
                className='w-full sm:w-auto'
              >
                📍 Mostrar Mapa
              </Button>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-600'>Modo:</span>
                <select
                  value={travelMode}
                  onChange={(e) =>
                    setTravelMode(
                      e.target.value as 'DRIVING' | 'WALKING' | 'TRANSIT'
                    )
                  }
                  className='border border-gray-300 rounded px-2 py-1 text-sm'
                >
                  <option value='DRIVING'>Coche</option>
                  <option value='WALKING'>A pie</option>
                  <option value='TRANSIT'>Transporte público</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-3 -mt-2 -mb-2 text-xs text-gray-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2'>
            <div>
              {originAddress !== null ? (
                <span>
                  Origen: <span className='font-medium'>{originAddress}</span>
                </span>
              ) : (
                <span>Origen: tu ubicación actual</span>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <span>
                Paradas: <span className='font-medium'>{totalStops}</span>
              </span>
              <span>
                Tiempo estimado:{' '}
                <span className='font-medium'>{totalDurationText ?? '—'}</span>
              </span>
              <div className='flex items-center gap-1'>
                <span>Modo:</span>
                <select
                  value={travelMode}
                  onChange={(e) =>
                    setTravelMode(
                      e.target.value as 'DRIVING' | 'WALKING' | 'TRANSIT'
                    )
                  }
                  className='border border-gray-300 rounded px-2 py-1 text-xs'
                >
                  <option value='DRIVING'>Coche</option>
                  <option value='WALKING'>A pie</option>
                  <option value='TRANSIT'>Transporte público</option>
                </select>
              </div>
            </div>
          </div>
          <div ref={mapRef} className='h-64 sm:h-80 lg:h-96 lg:col-span-2' />
          <div
            ref={directionsPanelRef}
            className='bg-white border border-gray-200 rounded-lg p-3 text-sm h-64 sm:h-80 lg:h-96 overflow-auto'
          />

          {isLoading && (
            <div className='absolute inset-0 bg-white/60 flex items-center justify-center'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                <p className='text-sm text-gray-600'>Cargando mapa...</p>
                <p className='text-xs text-gray-500 mt-2'>
                  Si el mapa no carga, verifica tu conexión a internet y
                  desactiva bloqueadores de anuncios
                </p>
              </div>
            </div>
          )}

          {error !== null && (
            <div className='absolute inset-0 bg-white/80 flex items-center justify-center'>
              <div className='text-center p-6'>
                <div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
                  <span className='text-2xl'>⚠️</span>
                </div>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                  Error al cargar el mapa
                </h4>
                <p className='text-sm text-gray-600 mb-4'>{error}</p>
                <div className='space-y-2'>
                  <Button
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      handleShowMap();
                    }}
                    size='sm'
                  >
                    🔄 Reintentar
                  </Button>
                  <div className='text-xs text-gray-500'>
                    <p>💡 Consejos para solucionar:</p>
                    <p>• Desactiva bloqueadores de anuncios</p>
                    <p>• Verifica tu conexión a internet</p>
                    <p>• Revisa la configuración de la API key</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='p-4 bg-blue-50 border-t border-gray-200'>
        <div className='text-sm text-blue-700'>
          <p className='font-medium mb-2'>📍 Paradas de la ruta:</p>
          <div className='space-y-1'>
            {routeStops.map((stop, index) => (
              <div
                key={`${stop.assignmentId}-${stop.start}-${stop.end}-${index}`}
                className='flex items-center space-x-2'
              >
                <span className='w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center'>
                  {index + 1}
                </span>
                <span className='text-sm'>
                  {stop.userLabel} - {stop.start}
                </span>
                {stop.address !== null &&
                  stop.address !== undefined &&
                  stop.address !== '' && (
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
