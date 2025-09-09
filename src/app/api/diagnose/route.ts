import { NextResponse } from 'next/server';

import { supabase } from '@/lib/database';

// GET /api/diagnose - Diagnosticar configuración de base de datos
export async function GET() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔍 Ejecutando diagnóstico completo de base de datos');

    const results = {
      timestamp: new Date().toISOString(),
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? 'Configurado'
          : 'No configurado',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? 'Configurado'
          : 'No configurado',
      },
      tests: {} as Record<string, unknown>,
    };

    // Test 1: Conexión básica
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('workers')
        .select('id')
        .limit(1);

      if (connectionError) {
        results.tests.connection = {
          status: 'ERROR',
          error: connectionError.message,
          code: connectionError.code,
        };
      } else {
        results.tests.connection = {
          status: 'OK',
          data: connectionTest,
        };
      }
    } catch (error) {
      results.tests.connection = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: Tabla worker_notifications
    try {
      const { data: tableTest, error: tableError } = await supabase
        .from('worker_notifications')
        .select('id')
        .limit(1);

      if (tableError) {
        results.tests.worker_notifications = {
          status: 'ERROR',
          error: tableError.message,
          code: tableError.code,
        };
      } else {
        results.tests.worker_notifications = {
          status: 'OK',
          data: tableTest,
        };
      }
    } catch (error) {
      results.tests.worker_notifications = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 3: Servicio de notificaciones
    try {
      const { notificationService } = await import(
        '@/lib/notification-service'
      );
      results.tests.notification_service = {
        status: 'OK',
        available: !!notificationService,
      };
    } catch (error) {
      results.tests.notification_service = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // eslint-disable-next-line no-console
    console.log('📋 Resultados del diagnóstico:', results);

    return NextResponse.json(results);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error general en diagnóstico:', error);
    return NextResponse.json(
      {
        error: 'Error interno en diagnóstico',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
