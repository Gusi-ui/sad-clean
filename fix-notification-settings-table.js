#!/usr/bin/env node
/**
 * Script para crear la tabla worker_notification_settings faltante
 * Ejecutar con: node fix-notification-settings-table.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
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

const envVars = loadEnvFile();
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error(
    'Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY configuradas'
  );
  process.exit(1);
}

// Crear cliente de Supabase con clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createNotificationSettingsTable() {
  try {
    console.log('🔧 Creando tabla worker_notification_settings...');

    // SQL para crear la tabla
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS worker_notification_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        push_enabled BOOLEAN DEFAULT true,
        sound_enabled BOOLEAN DEFAULT true,
        vibration_enabled BOOLEAN DEFAULT true,
        new_user_notifications BOOLEAN DEFAULT true,
        schedule_change_notifications BOOLEAN DEFAULT true,
        assignment_change_notifications BOOLEAN DEFAULT true,
        route_update_notifications BOOLEAN DEFAULT true,
        system_notifications BOOLEAN DEFAULT true,
        reminder_notifications BOOLEAN DEFAULT true,
        urgent_notifications BOOLEAN DEFAULT true,
        holiday_update_notifications BOOLEAN DEFAULT true,
        quiet_hours_start TEXT,
        quiet_hours_end TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(worker_id)
      );
    `;

    // Ejecutar SQL usando rpc (si está disponible) o intentar con una consulta directa
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL,
    });

    if (error) {
      console.log('⚠️ RPC no disponible, intentando método alternativo...');

      // Método alternativo: verificar si la tabla existe consultando información del esquema
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'worker_notification_settings');

      if (tablesError) {
        console.error('❌ Error al verificar tablas:', tablesError);
        return;
      }

      if (tables && tables.length > 0) {
        console.log('✅ La tabla worker_notification_settings ya existe');
      } else {
        console.log(
          '❌ La tabla worker_notification_settings no existe y no se puede crear automáticamente'
        );
        console.log(
          '📋 SQL que necesitas ejecutar manualmente en Supabase SQL Editor:'
        );
        console.log(createTableSQL);

        // Crear archivo SQL para ejecutar manualmente
        const fs = await import('fs');
        const sqlPath = join(
          __dirname,
          'create-worker-notification-settings-only.sql'
        );
        fs.writeFileSync(sqlPath, createTableSQL);
        console.log(`💾 SQL guardado en: ${sqlPath}`);
      }
    } else {
      console.log('✅ Tabla worker_notification_settings creada exitosamente');
    }
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando creación de tabla worker_notification_settings...');

  await createNotificationSettingsTable();

  console.log('✨ Proceso completado');
}

main().catch(console.error);
