// Script para debug del servicio de notificaciones desde el servidor
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Debug del Servicio de Notificaciones');
console.log('=====================================');

// Crear cliente con service role para acceso completo
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function debugNotificationService() {
  try {
    console.log('\n🔍 PASO 1: Verificando configuración...');
    console.log('URL:', supabaseUrl ? '✅' : '❌');
    console.log('Anon Key:', supabaseKey ? '✅' : '❌');
    console.log('Service Role:', serviceRoleKey ? '✅' : '❌');

    // Probar la inserción directamente
    console.log(
      '\n📝 PASO 2: Probando inserción directa en worker_notifications...'
    );

    const workerId = 'ac958cab-ae08-4a8f-a95f-b34fa0d7e940'; // UUID válido
    const testNotification = {
      worker_id: workerId,
      title: '🔧 Debug Test',
      body: 'Esta es una notificación de debug - ' + new Date().toISOString(),
      type: 'system_message',
      priority: 'normal',
      data: { debug: true, timestamp: new Date().toISOString() },
    };

    console.log(
      '📋 Datos a insertar:',
      JSON.stringify(testNotification, null, 2)
    );

    const { data: insertResult, error: insertError } = await supabase
      .from('worker_notifications')
      .insert(testNotification)
      .select();

    if (insertError) {
      console.log('\n❌ ERROR en inserción:');
      console.log('Código:', insertError.code);
      console.log('Mensaje:', insertError.message);
      console.log('Detalles:', insertError.details);
      console.log('Hint:', insertError.hint);

      // Verificar si es un problema de permisos
      if (
        insertError.code === '42501' ||
        insertError.message.includes('permission')
      ) {
        console.log('\n🔐 Parece ser un problema de permisos RLS');
        console.log('Verificando políticas RLS...');

        // Verificar si hay políticas RLS
        const { data: policies, error: policiesError } = await supabase.rpc(
          'get_policies',
          { table_name: 'worker_notifications' }
        );

        if (policiesError) {
          console.log('❌ Error obteniendo políticas:', policiesError.message);
        } else {
          console.log('📋 Políticas RLS encontradas:', policies);
        }
      }

      return false;
    }

    console.log('\n✅ Inserción exitosa!');
    console.log('📋 Resultado:', JSON.stringify(insertResult, null, 2));

    // Limpiar la notificación de debug
    if (insertResult && insertResult.length > 0) {
      console.log('\n🧹 Limpiando notificación de debug...');
      await supabase
        .from('worker_notifications')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('✅ Limpieza completada');
    }

    // Verificar estructura de la tabla
    console.log('\n📊 PASO 3: Verificando estructura de la tabla...');
    const { data: tableStructure, error: structureError } = await supabase
      .from('worker_notifications')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Error obteniendo estructura:', structureError.message);
    } else {
      console.log('✅ Estructura de tabla OK');
      if (tableStructure && tableStructure.length > 0) {
        console.log('Campos disponibles:', Object.keys(tableStructure[0]));
      }
    }

    // Verificar workers disponibles
    console.log('\n👥 PASO 4: Verificando workers disponibles...');
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, name, surname')
      .limit(3);

    if (workersError) {
      console.log('❌ Error obteniendo workers:', workersError.message);
    } else {
      console.log('✅ Workers encontrados:', workers?.length || 0);
      if (workers && workers.length > 0) {
        workers.forEach((worker, index) => {
          console.log(
            `  ${index + 1}. ${worker.name} ${worker.surname || ''} (${worker.id})`
          );
        });
      }
    }

    console.log('\n🎯 RESULTADO:');
    if (insertResult && insertResult.length > 0) {
      console.log(
        '✅ El servicio de notificaciones debería funcionar correctamente'
      );
      console.log(
        '💡 El problema podría estar en el código del servicio, no en la base de datos'
      );
    } else {
      console.log(
        '❌ Hay un problema fundamental con la inserción en la base de datos'
      );
    }

    return true;
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

debugNotificationService().catch(console.error);
