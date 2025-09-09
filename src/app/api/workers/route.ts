import { NextResponse } from 'next/server';

import { supabase, supabaseAdmin } from '@/lib/database';

// GET /api/workers - Obtener lista de workers disponibles
export async function GET() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔍 GET /api/workers - Iniciando consulta...');

    // Usar supabaseAdmin si está disponible, sino usar supabase regular
    const client = supabaseAdmin ?? supabase;

    const { data: workers, error } = await client
      .from('workers')
      .select('id, name, surname, email')
      .limit(10);

    // eslint-disable-next-line no-console
    console.log('📊 Resultado de consulta:', {
      workersCount: workers?.length ?? 0,
      hasWorkers: !!workers,
      error: error ? error.message : null
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error obteniendo workers:', error);
      return NextResponse.json(
        { error: 'Error obteniendo workers', details: error.message },
        { status: 500 }
      );
    }

    // eslint-disable-next-line no-console
    console.log('✅ Workers encontrados:', workers?.length || 0);

    if (workers && workers.length > 0) {
      workers.forEach((worker, index) => {
        // eslint-disable-next-line no-console
        console.log(`  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`);
      });
    }

    // Devolver workers reales de la base de datos
    return NextResponse.json({
      success: true,
      workers: workers || [],
      isTestData: false,
      count: workers?.length || 0
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error en GET /api/workers:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
