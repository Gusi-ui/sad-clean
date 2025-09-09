// Script final para crear workers con campos requeridos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 CREACIÓN FINAL DE WORKERS');
console.log('===========================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createWorkersFinal() {
  try {
    console.log('\n🔍 Verificando workers existentes...');

    const { data: existingWorkers, error: checkError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (checkError) {
      console.log('❌ Error obteniendo workers:', checkError.message);
      return;
    }

    console.log(`📊 Workers existentes: ${existingWorkers?.length || 0}`);

    if (existingWorkers && existingWorkers.length > 0) {
      console.log('✅ Ya hay workers, verificando si funcionan...');

      // Verificar que coincidan con auth
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users')
        .select('id, email');

      if (!authError && authUsers) {
        const workerIds = existingWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        console.log(
          `✅ IDs coincidentes: ${commonIds.length}/${existingWorkers.length}`
        );

        if (commonIds.length === existingWorkers.length) {
          console.log('🎉 ¡Workers ya funcionan correctamente!');
          return;
        }
      }
    }

    console.log('\n🏗️ Creando workers con campos requeridos...');

    // Workers con campos mínimos + phone (que es requerido)
    const workersToCreate = [
      {
        id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
        name: 'Rosa María',
        surname: 'Robles Muñoz',
        email: 'rosa.romu@hotmail.com',
        phone: '+34600000000',
        dni: '12345678A',
      },
      {
        id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2',
        name: 'Nuria',
        surname: 'Sin apellido',
        email: 'nuria.sil@gmail.com',
        phone: '+34600000001',
        dni: '23456789B',
      },
      {
        id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c',
        name: 'Graciela',
        surname: 'García',
        email: 'gracielag@gmail.com',
        phone: '+34600000002',
        dni: '34567890C',
      },
    ];

    for (const worker of workersToCreate) {
      console.log(`  📝 Creando ${worker.name} ${worker.surname}...`);

      const { error: createError } = await supabase
        .from('workers')
        .insert(worker);

      if (createError) {
        console.log(`  ❌ Error: ${createError.message}`);

        // Si el worker ya existe, intentar actualizarlo
        if (createError.code === '23505') {
          console.log('  🔄 Worker ya existe, intentando actualizar...');

          const { error: updateError } = await supabase
            .from('workers')
            .update({
              name: worker.name,
              surname: worker.surname,
              email: worker.email,
              phone: worker.phone,
              dni: worker.dni,
            })
            .eq('id', worker.id);

          if (updateError) {
            console.log(`  ❌ Error actualizando: ${updateError.message}`);
          } else {
            console.log(`  ✅ Worker actualizado exitosamente`);
          }
        }
      } else {
        console.log(`  ✅ ${worker.name} creado exitosamente`);
      }
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email, phone, dni');

    if (!finalError && finalWorkers) {
      console.log(`📊 Workers totales: ${finalWorkers.length}`);

      finalWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
        console.log(`     ID: ${worker.id}`);
        console.log(`     Phone: ${worker.phone}`);
      });

      // Verificar coincidencia con auth
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users')
        .select('id, email');

      if (!authError && authUsers) {
        const workerIds = finalWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        console.log(`\n🔐 VERIFICACIÓN AUTH:`);
        console.log(`📊 Workers: ${finalWorkers.length}`);
        console.log(`🔑 Auth Users: ${authUsers.length}`);
        console.log(`✅ Coincidentes: ${commonIds.length}`);

        if (commonIds.length === finalWorkers.length) {
          console.log('\n🎉 ¡ÉXITO TOTAL!');

          // Probar notificación final
          console.log('\n🧪 PRUEBA FINAL DE NOTIFICACIONES...');
          const testWorker = finalWorkers[0];

          const testNotification = {
            worker_id: testWorker.id,
            title: '🎊 ¡Sistema de Notificaciones 100% Funcional!',
            body: `¡Felicidades! El sistema de notificaciones ha sido completamente reparado y restaurado. Worker: ${testWorker.name} ${testWorker.surname}`,
            type: 'system_message',
            priority: 'high',
          };

          const { data: notificationResult, error: notificationError } =
            await supabase
              .from('worker_notifications')
              .insert(testNotification)
              .select();

          if (notificationError) {
            console.log(
              '❌ Error en notificación final:',
              notificationError.message
            );
          } else {
            console.log('✅ ¡NOTIFICACIÓN EXITOSA!');
            console.log('📋 ID de notificación:', notificationResult[0].id);
            console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');

            // Limpiar notificación de prueba
            await supabase
              .from('worker_notifications')
              .delete()
              .eq('id', notificationResult[0].id);

            console.log('🧹 Notificación de prueba limpiada');

            console.log('\n🚀 INSTRUCCIONES PARA EL USUARIO:');
            console.log('================================');
            console.log(
              '1. ✅ El problema de foreign key constraint ha sido RESUELTO'
            );
            console.log(
              '2. ✅ Los workers coinciden perfectamente con los usuarios auth'
            );
            console.log(
              '3. ✅ El sistema de notificaciones está 100% funcional'
            );
            console.log(
              '4. 📱 Ahora puedes probar las notificaciones desde el navegador'
            );
            console.log(
              '5. 🎯 Las notificaciones deberían aparecer en el dashboard de trabajadores'
            );
          }
        } else {
          console.log(
            `\n⚠️ Aún hay ${finalWorkers.length - commonIds.length} workers sin coincidencia`
          );
        }
      }
    } else {
      console.log('❌ Error en verificación:', finalError?.message);
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

createWorkersFinal().catch(console.error);
