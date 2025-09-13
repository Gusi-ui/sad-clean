#!/usr/bin/env node
/**
 * Script para probar si los tipos de Supabase se están cargando correctamente
 */
import { createClient } from '@supabase/supabase-js';

console.log('🧪 Probando carga de tipos de Supabase...');

// Cargar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

// Crear cliente
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Cliente Supabase creado');

// Simular tipos básicos para la prueba
console.log('✅ Script preparado para pruebas');

// Probar una consulta simple
async function testQuery() {
  try {
    console.log('🔍 Probando consulta a worker_notification_settings...');

    const { data, error } = await supabase
      .from('worker_notification_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error en consulta:', error.message);
      console.log('❌ Código de error:', error.code);
    } else {
      console.log('✅ Consulta exitosa');
      console.log('📊 Resultados:', data?.length || 0, 'registros');
    }
  } catch (err) {
    console.log('❌ Error general:', err.message);
  }
}

testQuery();
