#!/usr/bin/env node
/**
 * Script para verificar el esquema exacto de las tablas
 * Ejecutar con: node check-table-schema.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    });

    return envVars;
  } catch (error) {
    console.error('❌ Error al cargar .env.local:', error.message);
    return {};
  }
}

async function checkTableSchema() {
  const envVars = loadEnvFile();

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno faltantes');
    return;
  }

  try {
    console.log(
      '🔍 Verificando esquema exacto de worker_notification_settings...'
    );

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Intentar insertar un registro para ver qué columnas faltan
    const testData = {
      worker_id: '00000000-0000-0000-0000-000000000000',
      push_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
      new_user_notifications: true,
      schedule_change_notifications: true,
      assignment_change_notifications: true,
      route_update_notifications: true,
      system_notifications: true,
      reminder_notifications: true,
      urgent_notifications: true,
      holiday_update_notifications: true,
      quiet_hours_start: null,
      quiet_hours_end: null,
    };

    console.log('📝 Intentando insertar datos de prueba...');

    const { error: insertError } = await supabase
      .from('worker_notification_settings')
      .insert(testData);

    if (insertError) {
      console.log('❌ Error de inserción detectado:');
      console.log(`   Mensaje: ${insertError.message}`);
      console.log(`   Código: ${insertError.code}`);
      console.log(
        `   Detalles: ${JSON.stringify(insertError.details, null, 2)}`
      );

      // Extraer información sobre qué columnas faltan
      if (insertError.message.includes('assignment_change_notifications')) {
        console.log(
          '\n🔧 DIAGNOSTICO: Faltan columnas en la tabla worker_notification_settings'
        );
        console.log(
          '💡 Necesito agregar las columnas faltantes o corregir el código'
        );

        // Crear SQL para agregar las columnas faltantes
        const addColumnsSQL = `
-- Agregar columnas faltantes a worker_notification_settings
ALTER TABLE worker_notification_settings
ADD COLUMN IF NOT EXISTS assignment_change_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS route_update_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS urgent_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS holiday_update_notifications BOOLEAN DEFAULT true;
        `;

        console.log('\n📋 SQL para corregir la tabla:');
        console.log(addColumnsSQL);

        // Intentar ejecutar el SQL de corrección
        console.log('\n🔧 Intentando aplicar corrección automática...');

        try {
          // Nota: Esta consulta puede fallar si no tenemos permisos suficientes
          const { error: fixError } = await supabase.rpc('exec_sql', {
            sql: addColumnsSQL,
          });

          if (fixError) {
            console.log('❌ No se pudo aplicar corrección automática');
            console.log('💡 Ejecuta manualmente el SQL en Supabase Dashboard');
          } else {
            console.log('✅ Corrección aplicada exitosamente');
            console.log('🔄 Ahora intenta insertar nuevamente');
          }
        } catch (fixAttemptError) {
          console.log('❌ Error al intentar corrección automática');
          console.log('💡 Ejecuta manualmente el SQL en Supabase Dashboard');
        }
      }
    } else {
      console.log(
        '✅ La tabla worker_notification_settings tiene todas las columnas necesarias'
      );
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTableSchema().catch(console.error);
