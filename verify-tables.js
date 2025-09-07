#!/usr/bin/env node
/**
 * Script para verificar que las tablas existen en la base de datos
 * Ejecutar con: node verify-tables.js
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

async function verifyTables() {
  const envVars = loadEnvFile();

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno faltantes');
    console.error(
      'Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
    return;
  }

  try {
    console.log('🔍 Verificando conexión a Supabase...');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar tablas críticas
    const tablesToCheck = [
      'worker_notifications',
      'worker_devices',
      'worker_notification_settings',
    ];

    console.log('📊 Verificando tablas existentes...');

    for (const tableName of tablesToCheck) {
      try {
        // Intentar hacer una consulta simple
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Tabla ${tableName}: ERROR - ${error.message}`);
        } else {
          console.log(
            `✅ Tabla ${tableName}: OK - ${data ? data.length : 0} registros encontrados`
          );
        }
      } catch (tableError) {
        console.log(`❌ Tabla ${tableName}: ERROR - ${tableError.message}`);
      }
    }

    // Verificar esquema de la tabla worker_notification_settings
    console.log('\n🔍 Verificando esquema de worker_notification_settings...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'worker_notification_settings')
      .eq('table_schema', 'public');

    if (schemaError) {
      console.log('❌ Error al obtener esquema:', schemaError.message);
    } else {
      console.log('📋 Columnas encontradas:');
      schemaData.forEach((col) => {
        console.log(
          `   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyTables().catch(console.error);
