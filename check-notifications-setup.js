#!/usr/bin/env node

/**
 * Script para verificar la configuración de notificaciones
 * Ejecutar con: node check-notifications-setup.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno si están disponibles)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log(`🔗 Conectando a Supabase: ${supabaseUrl}`);
console.log(`🔑 Usando clave: ${supabaseKey.substring(0, 20)}...`);

if (!supabaseUrl) {
  console.error('❌ Error: URL de Supabase no configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotificationsSetup() {
  console.log('🔍 Verificando configuración de notificaciones...\n');

  try {
    // 1. Verificar tabla worker_notifications
    console.log('1. Verificando tabla worker_notifications...');
    const { data: notificationsTable, error: notificationsError } =
      await supabase.from('worker_notifications').select('*').limit(1);

    if (notificationsError) {
      console.error(
        '❌ Error accediendo a worker_notifications:',
        notificationsError.message
      );
      console.log(
        '   Puede que la tabla no exista o haya problemas de permisos'
      );
    } else {
      console.log('✅ Tabla worker_notifications accesible');
      console.log(
        `   Registros encontrados: ${Array.isArray(notificationsTable) ? notificationsTable.length : 'N/A'}`
      );
    }

    // 2. Verificar tabla worker_devices (para push notifications)
    console.log('\n2. Verificando tabla worker_devices...');
    const { data: devicesTable, error: devicesError } = await supabase
      .from('worker_devices')
      .select('*')
      .limit(1);

    if (devicesError) {
      console.error(
        '❌ Error accediendo a worker_devices:',
        devicesError.message
      );
      console.log(
        '   Puede que la tabla no exista o haya problemas de permisos'
      );
    } else {
      console.log('✅ Tabla worker_devices accesible');
      console.log(
        `   Registros encontrados: ${Array.isArray(devicesTable) ? devicesTable.length : 'N/A'}`
      );
    }

    // 3. Verificar estructura de la tabla worker_notifications
    console.log('\n3. Verificando estructura de worker_notifications...');
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('describe_table', { table_name: 'worker_notifications' })
      .select('*');

    if (tableInfoError) {
      console.log('⚠️  No se pudo obtener información detallada de la tabla');
      console.log('   Intentando consulta básica de estructura...');

      // Intentar obtener al menos una fila para ver la estructura
      const { data: sampleRow, error: sampleError } = await supabase
        .from('worker_notifications')
        .select('*')
        .limit(1);

      if (!sampleError && sampleRow && sampleRow.length > 0) {
        console.log('✅ Estructura de columnas detectada:');
        Object.keys(sampleRow[0]).forEach((key) => {
          console.log(`   - ${key}`);
        });
      }
    } else {
      console.log('✅ Información de tabla obtenida:');
      console.log(tableInfo);
    }

    // 4. Verificar permisos RLS
    console.log('\n4. Verificando permisos RLS...');
    const { data: rlsPolicies, error: rlsError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'worker_notifications');

    if (rlsError) {
      console.log('⚠️  No se pudo verificar políticas RLS');
    } else {
      if (rlsPolicies && rlsPolicies.length > 0) {
        console.log('✅ Políticas RLS encontradas:');
        rlsPolicies.forEach((policy) => {
          console.log(`   - ${policy.policyname} (${policy.cmd})`);
        });
      } else {
        console.log('⚠️  No se encontraron políticas RLS');
        console.log('   Esto podría causar problemas de acceso');
      }
    }

    // 5. Probar inserción de notificación de prueba
    console.log('\n5. Probando inserción de notificación de prueba...');
    const testNotification = {
      worker_id: 'test-worker-id',
      title: '🧪 Notificación de Prueba',
      body: 'Esta es una notificación de prueba para verificar la configuración',
      type: 'system_message',
      priority: 'normal',
      data: { test: true, timestamp: new Date().toISOString() },
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('worker_notifications')
      .insert(testNotification)
      .select();

    if (insertError) {
      console.error(
        '❌ Error insertando notificación de prueba:',
        insertError.message
      );
    } else {
      console.log('✅ Notificación de prueba insertada exitosamente');
      console.log('   ID de notificación:', insertResult?.[0]?.id);

      // Limpiar la notificación de prueba
      if (insertResult?.[0]?.id) {
        await supabase
          .from('worker_notifications')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('   Notificación de prueba eliminada');
      }
    }

    // 6. Verificar conectividad Realtime
    console.log('\n6. Verificando conectividad Realtime...');
    try {
      const channel = supabase.channel('test-channel', {
        config: {
          broadcast: { self: false },
        },
      });

      channel.subscribe((status) => {
        console.log(`   Estado del canal: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal Realtime suscrito exitosamente');
          supabase.removeChannel(channel);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('❌ Error en la conexión Realtime');
        }
      });

      // Timeout para evitar que el script se quede colgado
      setTimeout(() => {
        console.log('   Timeout alcanzado, cerrando canal de prueba');
        supabase.removeChannel(channel);
      }, 5000);
    } catch (realtimeError) {
      console.error('❌ Error configurando Realtime:', realtimeError.message);
    }

    console.log('\n📋 Verificación completada.');
  } catch (error) {
    console.error('❌ Error general en la verificación:', error.message);
  }
}

// Ejecutar la verificación
checkNotificationsSetup().catch((error) => {
  console.error('Error ejecutando verificación:', error);
  process.exit(1);
});
