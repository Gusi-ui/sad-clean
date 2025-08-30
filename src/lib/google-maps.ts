import { securityLogger } from '@/utils/security-config';

// Utilidades para Google Maps
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
  loading: 'async' | 'sync';
}

// Configuración por defecto
export const defaultGoogleMapsConfig: GoogleMapsConfig = {
  apiKey: process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'] ?? '',
  libraries: ['places', 'marker'],
  loading: 'async',
};

// Verificar si Google Maps está disponible
export const isGoogleMapsAvailable = (): boolean =>
  typeof window !== 'undefined' && window.google?.maps?.Map !== undefined;

// Verificar si la API key está configurada
export const isGoogleMapsApiKeyConfigured = (): boolean => {
  const apiKey = process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];
  return (
    apiKey !== undefined &&
    apiKey !== '' &&
    apiKey !== 'your_google_maps_api_key'
  );
};

// Cargar Google Maps API de forma asíncrona
export const loadGoogleMapsAPI = (
  config: GoogleMapsConfig = defaultGoogleMapsConfig
): Promise<void> =>
  new Promise((resolve, reject) => {
    // Si ya está cargado, resolver inmediatamente
    if (isGoogleMapsAvailable()) {
      resolve();
      return;
    }

    // Verificar que la API key esté configurada
    if (!config.apiKey || config.apiKey === 'your_google_maps_api_key') {
      reject(
        new Error(
          'API key de Google Maps no configurada. Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env'
        )
      );
      return;
    }

    // Establecer timeout global para evitar bloqueos indefinidos
    const timeoutMs = 8000;
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          'Timeout al cargar Google Maps API. Revisa Brave Shields/bloqueadores y dominios autorizados.'
        )
      );
    }, timeoutMs);

    // Verificar si ya hay un script cargándose
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Esperar a que se cargue el script existente, con intentos limitados
      let attempts = 0;
      const maxAttempts = Math.ceil(timeoutMs / 100);
      const checkLoaded = async (): Promise<void> => {
        const mapsObj = (
          window as unknown as { google?: { maps?: Record<string, unknown> } }
        ).google?.maps;
        const importLibrary = (
          mapsObj as { importLibrary?: (name: string) => Promise<unknown> }
        ).importLibrary;
        if (
          typeof importLibrary === 'function' &&
          mapsObj?.['Map'] === undefined
        ) {
          try {
            await importLibrary('maps');
          } catch {
            // Ignorar y seguir intentando hasta timeout
          }
        }

        if (isGoogleMapsAvailable()) {
          clearTimeout(timeoutId);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearTimeout(timeoutId);
          reject(
            new Error(
              'No se pudo inicializar Google Maps API (posible bloqueo por navegador).'
            )
          );
        } else {
          attempts += 1;
          window.setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            checkLoaded();
          }, 100);
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      checkLoaded();
      return;
    }

    // Crear y cargar el script
    const script = document.createElement('script');
    const libraries = config.libraries.join(',');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${libraries}&loading=${config.loading}&region=ES&language=es`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Esperar un poco más para asegurar que la API esté completamente inicializada
      window.setTimeout(() => {
        (async () => {
          try {
            const mapsObj = (
              window as unknown as {
                google?: { maps?: Record<string, unknown> };
              }
            ).google?.maps;
            const importLibrary = (
              mapsObj as { importLibrary?: (name: string) => Promise<unknown> }
            ).importLibrary;
            if (
              typeof importLibrary === 'function' &&
              mapsObj?.['Map'] === undefined
            ) {
              await importLibrary('maps');
            }
          } catch {
            // Ignorar, validaremos disponibilidad abajo
          }

          if (isGoogleMapsAvailable()) {
            clearTimeout(timeoutId);
            resolve();
          } else {
            clearTimeout(timeoutId);
            reject(
              new Error(
                'Google Maps API no se inicializó correctamente. Verifica la configuración de dominios autorizados.'
              )
            );
          }
        })().catch((e: unknown) => {
          // Registrar en consola de desarrollo sin interrumpir UX
          securityLogger.error('Error inicializando Google Maps:', e);
        });
      }, 1000);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(
        new Error(
          'Error al cargar Google Maps API. Verifica tu conexión a internet y la configuración de dominios autorizados.'
        )
      );
    };

    document.head.appendChild(script);
  });

// Geocodificar una dirección
export const geocodeAddress = (
  address: string,
  options?: {
    componentRestrictions?: {
      country?: string;
      locality?: string;
      administrativeArea?: string;
    };
    bounds?: {
      sw: { lat: number; lng: number };
      ne: { lat: number; lng: number };
    };
  }
): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve, reject) => {
    if (!isGoogleMapsAvailable()) {
      reject(new Error('Google Maps API no disponible'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    const request: {
      address: string;
      componentRestrictions?: unknown;
      bounds?: unknown;
    } = { address };
    if (options?.componentRestrictions) {
      request['componentRestrictions'] = options.componentRestrictions;
    }
    if (options?.bounds) {
      const b = new window.google.maps.LatLngBounds();
      b.extend({
        lat: options.bounds.sw.lat,
        lng: options.bounds.sw.lng,
      } as unknown as { lat: number; lng: number });
      b.extend({
        lat: options.bounds.ne.lat,
        lng: options.bounds.ne.lng,
      } as unknown as { lat: number; lng: number });
      request['bounds'] = b;
    }

    geocoder.geocode(request, (results: unknown, status: string) => {
      if (
        status === 'OK' &&
        results !== null &&
        results !== undefined &&
        Array.isArray(results) &&
        results[0] !== null &&
        results[0] !== undefined
      ) {
        const result = results[0] as {
          geometry: { location: { lat: () => number; lng: () => number } };
        };
        const location = result.geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`Error de geocodificación: ${status}`));
      }
    });
  });

// Crear un mapa de Google Maps
export const createGoogleMap = (
  element: HTMLElement,
  options: {
    center?: { lat: number; lng: number };
    zoom?: number;
    mapTypeId?: unknown;
  } = {}
): unknown => {
  if (!isGoogleMapsAvailable()) {
    throw new Error('Google Maps API no disponible');
  }

  const defaultOptions = {
    zoom: 14,
    center: { lat: 41.542, lng: 2.444 }, // Centro aproximado de Mataró
    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ lightness: 20 }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#333333' }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ lightness: 20 }],
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#444444' }],
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [{ color: '#f4f6f9' }],
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [{ color: '#cfdff6' }],
      },
    ],
  };

  return new window.google.maps.Map(element, { ...defaultOptions, ...options });
};

// Crear un marcador
export const createMarker = (options: {
  position: { lat: number; lng: number };
  map?: unknown;
  title?: string;
  label?: { text: string; color?: string; fontWeight?: string };
  icon?: { url: string; scaledSize?: unknown };
}): unknown => {
  if (!isGoogleMapsAvailable()) {
    throw new Error('Google Maps API no disponible');
  }

  return new window.google.maps.Marker(options);
};

// Crear límites del mapa
export const createLatLngBounds = (): {
  extend: (latLng: unknown) => void;
  isEmpty: () => boolean;
} => {
  if (!isGoogleMapsAvailable()) {
    throw new Error('Google Maps API no disponible');
  }

  return new window.google.maps.LatLngBounds();
};

// Crear tamaño para iconos
export const createSize = (width: number, height: number): unknown => {
  if (!isGoogleMapsAvailable()) {
    throw new Error('Google Maps API no disponible');
  }

  return new window.google.maps.Size(width, height);
};

// Obtener información de diagnóstico
export const getGoogleMapsDiagnostics = () => {
  const apiKey = process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];

  return {
    isAvailable: isGoogleMapsAvailable(),
    isApiKeyConfigured: isGoogleMapsApiKeyConfigured(),
    apiKey:
      apiKey !== undefined && apiKey !== '' ? 'Configurada' : 'No configurada',
    userAgent:
      typeof window !== 'undefined'
        ? window.navigator.userAgent
        : 'No disponible',
    hasAdBlocker:
      typeof window !== 'undefined'
        ? window.google?.maps === undefined &&
          document.querySelector('script[src*="maps.googleapis.com"]') !== null
        : 'No disponible',
  };
};
