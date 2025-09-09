// Script simplificado para migrar los IDs de workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Migración Simplificada de Worker IDs');
console.log('=====================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function simpleMigration() {
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

    console.log('\n🔗 Creando mapping...');

    // Crear mapping manual
    const mapping = [];
    const emailToAuthId = {};

    // Crear mapa de email -> auth_id
    authUsers.forEach((auth) => {
      emailToAuthId[auth.email.toLowerCase().trim()] = auth.id;
    });

    // Encontrar workers que necesitan actualización
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
    console.log('\n📝 Mapping de actualización:');
    mapping.forEach((item) => {
      console.log(
        `  ${item.name} ${item.surname}: ${item.workerId} → ${item.authId}`
      );
    });

    // Ejecutar actualizaciones
    for (const item of mapping) {
      console.log(`\n🔄 Actualizando ${item.name} ${item.surname}...`);

      // 1. Actualizar assignments
      console.log('  📋 Actualizando assignments...');
      const { error: assignmentsError } = await supabase
        .from('assignments')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      if (assignmentsError) {
        console.log(`  ⚠️ Assignments: ${assignmentsError.message}`);
      } else {
        console.log('  ✅ Assignments OK');
      }

      // 2. Actualizar notifications
      console.log('  📋 Actualizando notifications...');
      const { error: notificationsError } = await supabase
        .from('worker_notifications')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      if (notificationsError) {
        console.log(`  ⚠️ Notifications: ${notificationsError.message}`);
      } else {
        console.log('  ✅ Notifications OK');
      }

      // 3. Actualizar devices
      console.log('  📋 Actualizando devices...');
      const { error: devicesError } = await supabase
        .from('worker_devices')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      if (devicesError) {
        console.log(`  ⚠️ Devices: ${devicesError.message}`);
      } else {
        console.log('  ✅ Devices OK');
      }

      // 4. Actualizar notification settings
      console.log('  📋 Actualizando notification settings...');
      const { error: settingsError } = await supabase
        .from('worker_notification_settings')
        .update({ worker_id: item.authId })
        .eq('worker_id', item.workerId);

      if (settingsError) {
        console.log(`  ⚠️ Settings: ${settingsError.message}`);
      } else {
        console.log('  ✅ Settings OK');
      }

      // 5. Finalmente, actualizar el worker
      console.log('  📋 Actualizando worker...');
      const { error: workerError } = await supabase
        .from('workers')
        .update({ id: item.authId })
        .eq('id', item.workerId);

      if (workerError) {
        console.log(`  ❌ Worker: ${workerError.message}`);
      } else {
        console.log('  ✅ Worker OK');
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
        console.log('💡 El sistema de notificaciones debería funcionar ahora');

        // Probar notificación
        console.log('\n🧪 Probando notificación final...');
        const testWorker = finalWorkers[0];

        const testNotification = {
          worker_id: testWorker.id,
          title: '🎉 ¡Sistema Reparado!',
          body: 'El sistema de notificaciones está funcionando correctamente después de la migración',
          type: 'system_message',
          priority: 'normal',
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

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', notificationResult[0].id);

          console.log('🧹 Notificación limpiada');
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

simpleMigration().catch(console.error);
