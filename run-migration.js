// Script para ejecutar la migración que corrige los IDs de workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Ejecutando Migración de Worker IDs');
console.log('====================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  try {
    console.log('\n📋 Leyendo archivo de migración...');

    // Leer el archivo SQL
    const migrationSQL = fs.readFileSync(
      './fix-worker-ids-migration.sql',
      'utf8'
    );

    console.log('✅ Archivo de migración cargado');
    console.log('📊 Ejecutando migración...');

    // Ejecutar la migración usando rpc para ejecutar SQL raw
    // Nota: Esto requiere permisos elevados
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      console.log('❌ Error ejecutando migración con rpc:', error.message);

      // Intentar ejecutar paso a paso
      console.log('\n🔄 Ejecutando paso a paso...');

      // Paso 1: Crear mapping
      console.log('📝 Paso 1: Creando mapping...');
      const { data: mappingData, error: mappingError } = await supabase
        .from('workers')
        .select(
          `
          id,
          email,
          name,
          surname,
          auth_users!inner(id, email)
        `
        )
        .neq('workers.id', 'auth_users.id'); // Solo donde no coincidan

      if (mappingError) {
        console.log('❌ Error obteniendo mapping:', mappingError.message);
        return;
      }

      console.log(
        `✅ Encontrados ${mappingData?.length || 0} workers para actualizar`
      );

      if (mappingData && mappingData.length > 0) {
        for (const item of mappingData) {
          const currentId = item.id;
          const correctId = item.auth_users.id;
          const name = item.name;
          const surname = item.surname;

          console.log(`\n🔄 Actualizando ${name} ${surname || ''}`);
          console.log(`   De: ${currentId}`);
          console.log(`   A:  ${correctId}`);

          // Paso 1: Actualizar assignments
          const { error: assignmentsError } = await supabase
            .from('assignments')
            .update({ worker_id: correctId })
            .eq('worker_id', currentId);

          if (assignmentsError) {
            console.log(`⚠️ Error en assignments: ${assignmentsError.message}`);
          } else {
            console.log('✅ Assignments actualizados');
          }

          // Paso 2: Actualizar worker_notifications
          const { error: notificationsError } = await supabase
            .from('worker_notifications')
            .update({ worker_id: correctId })
            .eq('worker_id', currentId);

          if (notificationsError) {
            console.log(
              `⚠️ Error en notifications: ${notificationsError.message}`
            );
          } else {
            console.log('✅ Notifications actualizadas');
          }

          // Paso 3: Actualizar worker_devices
          const { error: devicesError } = await supabase
            .from('worker_devices')
            .update({ worker_id: correctId })
            .eq('worker_id', currentId);

          if (devicesError) {
            console.log(`⚠️ Error en devices: ${devicesError.message}`);
          } else {
            console.log('✅ Devices actualizados');
          }

          // Paso 4: Finalmente actualizar el worker
          const { error: workerError } = await supabase
            .from('workers')
            .update({ id: correctId })
            .eq('id', currentId);

          if (workerError) {
            console.log(`❌ Error actualizando worker: ${workerError.message}`);
          } else {
            console.log('✅ Worker actualizado');
          }
        }

        // Verificación final
        console.log('\n🎯 VERIFICACIÓN FINAL:');
        console.log('====================');

        const { data: finalWorkers, error: finalError } = await supabase
          .from('workers')
          .select('id, name, surname, email');

        const { data: finalAuth, error: finalAuthError } = await supabase
          .from('auth_users')
          .select('id, email');

        if (!finalError && !finalAuthError && finalWorkers && finalAuth) {
          const workerIds = finalWorkers.map((w) => w.id);
          const authIds = finalAuth.map((u) => u.id);
          const commonIds = workerIds.filter((id) => authIds.includes(id));

          console.log(`📊 Workers: ${finalWorkers.length}`);
          console.log(`🔐 Usuarios Auth: ${finalAuth.length}`);
          console.log(`✅ IDs coincidentes: ${commonIds.length}`);

          if (commonIds.length === finalWorkers.length) {
            console.log(
              '\n🎉 ¡ÉXITO! Todos los workers tienen usuarios auth correspondientes'
            );
            console.log(
              '💡 El sistema de notificaciones debería funcionar ahora'
            );
          } else {
            console.log(
              `\n⚠️ Aún faltan ${finalWorkers.length - commonIds.length} workers por asociar`
            );
          }
        }

        // Probar notificación
        console.log('\n🧪 Probando notificación final...');
        if (finalWorkers && finalWorkers.length > 0) {
          const testWorker = finalWorkers[0];

          const testNotification = {
            worker_id: testWorker.id,
            title: '🎉 ¡Sistema Funcionando!',
            body: 'Las notificaciones están funcionando correctamente después de la migración',
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
        }
      } else {
        console.log('ℹ️ No hay workers que necesiten actualización');
      }
    } else {
      console.log('✅ Migración ejecutada exitosamente');
      console.log('📋 Resultado:', data);
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

runMigration().catch(console.error);
