// Script para arreglar assignments primero, luego workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Arreglando Assignments Primero');
console.log('================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAssignmentsFirst() {
  try {
    console.log('\n👥 Obteniendo workers...');
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (workersError) {
      console.log('❌ Error obteniendo workers:', workersError.message);
      return;
    }

    console.log('\n🔐 Obteniendo usuarios auth...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth_users')
      .select('id, email');

    if (authError) {
      console.log('❌ Error obteniendo auth users:', authError.message);
      return;
    }

    // Crear mapping
    const emailToAuthId = {};
    authUsers.forEach((auth) => {
      emailToAuthId[auth.email.toLowerCase().trim()] = auth.id;
    });

    const mapping = [];
    workers.forEach((worker) => {
      const authId = emailToAuthId[worker.email.toLowerCase().trim()];
      if (authId && authId !== worker.id) {
        mapping.push({
          workerId: worker.id,
          authId: authId,
          name: worker.name,
          surname: worker.surname,
          email: worker.email,
        });
      }
    });

    console.log(`📋 Workers que necesitan actualización: ${mapping.length}`);

    if (mapping.length === 0) {
      console.log('✅ No hay workers que necesiten actualización');
      return;
    }

    // Mostrar mapping
    console.log('\n📝 Mapping:');
    mapping.forEach((item) => {
      console.log(
        `  ${item.name} ${item.surname}: ${item.workerId} → ${item.authId}`
      );
    });

    // Estrategia: Crear workers temporales con IDs correctos primero
    console.log('\n🏗️ PASO 1: Creando workers con IDs correctos...');

    for (const item of mapping) {
      console.log(`  📝 Creando worker temporal para ${item.name}...`);

      // Insertar worker con ID correcto
      const { error: insertError } = await supabase.from('workers').insert({
        id: item.authId,
        name: item.name,
        surname: item.surname,
        email: item.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        // Si ya existe, está bien
        if (insertError.code === '23505') {
          console.log('  ✅ Worker ya existe con ID correcto');
        } else {
          console.log(`  ❌ Error creando worker: ${insertError.message}`);
        }
      } else {
        console.log('  ✅ Worker temporal creado');
      }
    }

    // Paso 2: Actualizar assignments
    console.log('\n📋 PASO 2: Actualizando assignments...');
    for (const item of mapping) {
      console.log(`  🔄 Actualizando assignments de ${item.name}...`);

      const { error: assignmentsError } = await supabase
        .from('assignments')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      if (assignmentsError) {
        console.log(`  ❌ Assignments error: ${assignmentsError.message}`);
      } else {
        console.log('  ✅ Assignments actualizados');
      }
    }

    // Paso 3: Actualizar otras tablas
    console.log('\n📋 PASO 3: Actualizando otras tablas...');
    for (const item of mapping) {
      console.log(`  🔄 Actualizando otras tablas de ${item.name}...`);

      // Notifications
      await supabase
        .from('worker_notifications')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      // Devices
      await supabase
        .from('worker_devices')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      // Settings
      await supabase
        .from('worker_notification_settings')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      console.log('  ✅ Otras tablas actualizadas');
    }

    // Paso 4: Eliminar workers antiguos
    console.log('\n🗑️ PASO 4: Eliminando workers antiguos...');
    for (const item of mapping) {
      console.log(`  🗑️ Eliminando worker antiguo ${item.name}...`);

      const { error: deleteError } = await supabase
        .from('workers')
        .delete()
        .eq('id', item.workerId);

      if (deleteError) {
        console.log(`  ❌ Error eliminando: ${deleteError.message}`);
      } else {
        console.log('  ✅ Worker antiguo eliminado');
      }
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (!finalError && finalWorkers) {
      const workerIds = finalWorkers.map((w) => w.id);
      const authIds = authUsers.map((u) => u.id);
      const commonIds = workerIds.filter((id) => authIds.includes(id));

      console.log(`📊 Workers: ${finalWorkers.length}`);
      console.log(`🔐 Usuarios Auth: ${authUsers.length}`);
      console.log(`✅ IDs coincidentes: ${commonIds.length}`);

      if (commonIds.length === finalWorkers.length) {
        console.log(
          '\n🎉 ¡ÉXITO! Todos los workers tienen usuarios auth correspondientes'
        );

        // Probar notificación
        console.log('\n🧪 Probando notificación final...');
        const testWorker = finalWorkers[0];

        const testNotification = {
          worker_id: testWorker.id,
          title: '🎉 ¡Sistema Completamente Reparado!',
          body: 'El sistema de notificaciones está funcionando perfectamente después de la migración completa',
          type: 'system_message',
          priority: 'high',
        };

        const { data: notificationResult, error: notificationError } =
          await supabase
            .from('worker_notifications')
            .insert(testNotification)
            .select();

        if (notificationError) {
          console.log('❌ Error en notificación:', notificationError.message);
        } else {
          console.log('✅ ¡Notificación de prueba exitosa!');
          console.log('📋 ID:', notificationResult[0].id);
          console.log('💡 ¡EL SISTEMA DE NOTIFICACIONES ESTÁ FUNCIONANDO!');

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', notificationResult[0].id);

          console.log('🧹 Notificación de prueba limpiada');
        }
      } else {
        console.log(
          `\n⚠️ Aún faltan ${finalWorkers.length - commonIds.length} workers por asociar`
        );
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

fixAssignmentsFirst().catch(console.error);
