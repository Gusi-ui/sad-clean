// Script para verificar tablas y permisos en la base de datos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando configuración de Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('Anon Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada');
console.log(
  'Service Role:',
  serviceRoleKey ? '✅ Configurada' : '❌ No configurada'
);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuración de Supabase incompleta');
  process.exit(1);
}

// Crear cliente con service role para acceso completo
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function checkDatabase() {
  try {
    console.log('\n🔍 Verificando conexión a la base de datos...');

    // Verificar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }

    console.log('✅ Conexión a la base de datos OK');

    // Verificar tablas existentes
    console.log('\n📋 Verificando tablas existentes...');

    const tablesToCheck = [
      'profiles',
      'workers',
      'worker_notifications',
      'worker_devices',
      'worker_notification_settings',
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Tabla '${tableName}': ERROR - ${error.message}`);
        } else {
          console.log(
            `✅ Tabla '${tableName}': OK (registros: ${data ? 'con datos' : 'sin datos'})`
          );
        }
      } catch (err) {
        console.log(`❌ Tabla '${tableName}': ERROR - ${err.message}`);
      }
    }

    // Verificar permisos de inserción en worker_notifications
    console.log('\n🔐 Verificando permisos de inserción...');

    try {
      const testNotification = {
        worker_id: 'test-worker-1',
        title: 'Test Notification',
        body: 'Test Body',
        type: 'system_message',
        priority: 'normal',
        data: { test: true },
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('worker_notifications')
        .insert(testNotification)
        .select();

      if (insertError) {
        console.log(
          '❌ Error insertando notificación de prueba:',
          insertError.message
        );
        console.log('💡 Código de error:', insertError.code);
        console.log('💡 Detalles:', insertError.details);
      } else {
        console.log('✅ Inserción de notificación OK');

        // Limpiar la notificación de prueba
        if (insertResult && insertResult.length > 0) {
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', insertResult[0].id);
          console.log('🧹 Notificación de prueba eliminada');
        }
      }
    } catch (err) {
      console.log('❌ Error en inserción:', err.message);
    }

    // Verificar workers existentes
    console.log('\n👥 Verificando workers existentes...');

    try {
      const { data: workers, error: workersError } = await supabase
        .from('workers')
        .select('id, name, surname, email')
        .limit(5);

      if (workersError) {
        console.log('❌ Error obteniendo workers:', workersError.message);
      } else {
        console.log(`✅ Workers encontrados: ${workers?.length || 0}`);
        if (workers && workers.length > 0) {
          workers.forEach((worker, index) => {
            console.log(
              `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.id})`
            );
          });
        } else {
          console.log('📝 No hay workers reales en la base de datos');
        }
      }
    } catch (err) {
      console.log('❌ Error obteniendo workers:', err.message);
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDatabase().catch(console.error);
