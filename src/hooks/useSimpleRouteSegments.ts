'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { RouteSegment } from '@/components/route/RouteSegmentDetails';
import { isGoogleMapsAvailable, loadGoogleMapsAPI } from '@/lib/google-maps';
import {
  type AddressInfo,
  calculateRouteRealTravelTime,
} from '@/lib/real-travel-time';

interface RouteStop {
  assignmentId: string;
  userLabel: string;
  start: string;
  end: string;
  order: number;
  address?: string | null | undefined;
  postalCode?: string | null;
  city?: string | null;
}

interface WorkerInfo {
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
}

interface UseSimpleRouteSegmentsProps {
  routeStops: RouteStop[];
  workerInfo: WorkerInfo | null;
  travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT';
}

interface UseSimpleRouteSegmentsReturn {
  segments: RouteSegment[];
  isLoading: boolean;
  error: string | null;
  totalBillableTime: number; // en minutos
  totalDistance: number; // en metros
  confidence: 'high' | 'medium' | 'low';
  refreshSegments: () => void;
}

const useSimpleRouteSegments = ({
  routeStops,
  workerInfo,
  travelMode,
}: UseSimpleRouteSegmentsProps): UseSimpleRouteSegmentsReturn => {
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const isCalculatingRef = useRef(false);
  const lastCalculationRef = useRef<string>('');

  // Función para refrescar los cálculos manualmente
  const refreshSegments = useCallback(() => {
    isCalculatingRef.current = false; // Reset para permitir nueva ejecución
    lastCalculationRef.current = ''; // Limpiar hash para forzar recálculo
  }, []);

  // Calcular totales
  const totalBillableTime = segments.reduce(
    (total, segment) => total + segment.billableTime,
    0
  );
  const totalDistance = segments.reduce(
    (total, segment) => total + segment.distance,
    0
  );

  // Recalcular cuando cambien las dependencias con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const runCalculation = async () => {
        // Evitar múltiples llamadas simultáneas
        if (isCalculatingRef.current) {
          return;
        }

        // Crear hash de los datos para evitar cálculos innecesarios
        const dataHash = JSON.stringify({
          routeStops: routeStops.map((stop) => ({
            assignmentId: stop.assignmentId,
            address: stop.address,
            postalCode: stop.postalCode,
            city: stop.city,
          })),
          workerInfo,
          travelMode,
        });

        // Si los datos no han cambiado, no recalcular
        if (lastCalculationRef.current === dataHash) {
          return;
        }

        if (routeStops.length === 0) {
          setSegments([]);
          setError(null);
          setConfidence('medium');
          lastCalculationRef.current = dataHash;
          return;
        }

        isCalculatingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
          // Verificar y cargar Google Maps API si es necesario
          if (!isGoogleMapsAvailable()) {
            await loadGoogleMapsAPI();
          }
          // Preparar información de direcciones
          console.log('🔍 DEBUG useSimpleRouteSegments - routeStops recibidos:', routeStops.length);
          routeStops.forEach((stop, index) => {
            console.log(`  ${index + 1}. ${stop.userLabel} - ${stop.address || 'SIN DIRECCIÓN'} (ID: ${stop.assignmentId})`);
          });
          
          const addressStops: AddressInfo[] = routeStops
            .filter((stop: RouteStop) => {
              // Filtrar paradas que no tienen dirección válida
              const hasValidAddress =
                Boolean(stop.address) && (stop.address?.trim().length ?? 0) > 0;
              if (!hasValidAddress) {
                console.log(`❌ Filtrando parada sin dirección: ${stop.userLabel}`);
              }
              return hasValidAddress;
            })
            .map((stop: RouteStop) => ({
              address: stop.address ?? undefined,
              postalCode: stop.postalCode ?? undefined,
              city: stop.city ?? undefined,
            }));
          
          console.log('🎯 DEBUG useSimpleRouteSegments - addressStops filtradas:', addressStops.length);
          addressStops.forEach((stop, index) => {
            console.log(`  ${index + 1}. ${stop.address} (${stop.city})`);
          });

          // Si no hay direcciones válidas, no hacer cálculos
          if (addressStops.length === 0) {
            setSegments([]);
            setError('No hay direcciones válidas para calcular la ruta');
            setConfidence('low');
            return;
          }

          // No usar dirección de la trabajadora - calcular solo entre servicios
          // El primer servicio será el punto de referencia inicial
          const routeResult = await calculateRouteRealTravelTime(
            addressStops,
            undefined, // No pasar dirección de trabajadora
            travelMode
          );

          const newSegments: RouteSegment[] = [];
          const confidenceScores: number[] = [];

          // Crear lista de paradas solo con los servicios (sin dirección de trabajadora)
          const allStops = routeStops;

          // Crear segmentos basados en los resultados
          for (let i = 0; i < routeResult.segments.length; i++) {
            const segment = routeResult.segments[i];
            const fromStop = allStops[segment.from];
            const toStop = allStops[segment.to];

            // Calcular tiempo facturable en minutos
            const billableTimeMinutes = Math.ceil(segment.duration / 60);

            const routeSegment: RouteSegment = {
              id: `segment-${i}`,
              from: fromStop?.userLabel ?? `Parada ${segment.from + 1}`,
              to: toStop?.userLabel ?? `Parada ${segment.to + 1}`,
              fromAddress: fromStop?.address ?? undefined,
              toAddress: toStop?.address ?? undefined,
              duration: segment.duration,
              distance: segment.distance,
              travelMode,
              billableTime: billableTimeMinutes,
            };

            newSegments.push(routeSegment);

            // Asignar confianza basada en éxito del cálculo
            confidenceScores.push(segment.success ? 3 : 1);
          }

          // Calcular confianza promedio
          const avgConfidence =
            confidenceScores.length > 0
              ? confidenceScores.reduce((sum, score) => sum + score, 0) /
                confidenceScores.length
              : 1;
          const overallConfidence: 'high' | 'medium' | 'low' =
            avgConfidence >= 2.5
              ? 'high'
              : avgConfidence >= 1.5
                ? 'medium'
                : 'low';

          setSegments(newSegments);
          setConfidence(overallConfidence);
          // Verificar si hay errores en los segmentos
          const failedSegments = routeResult.segments.filter(
            (seg) => !seg.success
          );
          const successfulSegments = routeResult.segments.filter(
            (seg) => seg.success
          );

          // Solo mostrar error si TODOS los cálculos fallaron
          if (failedSegments.length > 0 && successfulSegments.length === 0) {
            setError('Todos los cálculos de tiempo fallaron');
          } else {
            setError(null);
          }
          // Actualizar hash después de cálculo exitoso
          lastCalculationRef.current = dataHash;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Error desconocido';
          setError(`Error calculando segmentos: ${errorMessage}`);
          setSegments([]);
          setConfidence('low');
        } finally {
          setIsLoading(false);
          isCalculatingRef.current = false;
        }
      };

      void runCalculation();
    }, 1000); // Debounce de 1000ms para reducir llamadas

    return () => clearTimeout(timeoutId);
  }, [routeStops, workerInfo, travelMode]);

  return {
    segments,
    isLoading,
    error,
    totalBillableTime,
    totalDistance,
    confidence,
    refreshSegments,
  };
};

export default useSimpleRouteSegments;
export type { UseSimpleRouteSegmentsProps, UseSimpleRouteSegmentsReturn };
