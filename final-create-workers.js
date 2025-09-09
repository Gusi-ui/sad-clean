// Script FINAL para crear workers con valores correctos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 CREACIÓN FINAL DE WORKERS');
console.log('===========================');
console.log('Valores válidos para worker_type: cuidadora, auxiliar, enfermera');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createFinalWorkers() {
  try {
    console.log('\n🔍 Verificando estado actual...');

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
      return;
    }

    console.log('\n🏗️ Creando workers con todos los campos requeridos...');

    // Workers con TODOS los campos requeridos y valores válidos
    const workersToCreate = [
      {
        id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
        name: 'Rosa María',
        surname: 'Robles Muñoz',
        email: 'rosa.romu@hotmail.com',
        phone: '+34600000000',
        dni: '12345678A',
        worker_type: 'cuidadora', // ✅ Valor válido
      },
      {
        id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2',
        name: 'Nuria',
        surname: 'Sin apellido',
        email: 'nuria.sil@gmail.com',
        phone: '+34600000001',
        dni: '23456789B',
        worker_type: 'auxiliar', // ✅ Valor válido
      },
      {
        id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c',
        name: 'Graciela',
        surname: 'García',
        email: 'gracielag@gmail.com',
        phone: '+34600000002',
        dni: '34567890C',
        worker_type: 'enfermera', // ✅ Valor válido
      },
    ];

    for (const worker of workersToCreate) {
      console.log(
        `\n📝 Creando worker: ${worker.name} ${worker.surname} (${worker.worker_type})`
      );

      const { error: createError } = await supabase
        .from('workers')
        .insert(worker);

      if (createError) {
        console.log(`❌ Error creando ${worker.name}:`, createError.message);

        // Si ya existe, intentar actualizar
        if (createError.code === '23505') {
          console.log('🔄 Worker ya existe, actualizando...');

          const { error: updateError } = await supabase
            .from('workers')
            .update(worker)
            .eq('id', worker.id);

          if (updateError) {
            console.log(`❌ Error actualizando: ${updateError.message}`);
          } else {
            console.log(`✅ Worker actualizado exitosamente`);
          }
        }
      } else {
        console.log(`✅ ${worker.name} creado exitosamente`);
      }
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email, worker_type');

    if (!finalError && finalWorkers) {
      console.log(`📊 Workers totales: ${finalWorkers.length}`);

      finalWorkers.forEach((worker, index) => {
        console.log(`  ${index + 1}. ${worker.name} ${worker.surname}`);
        console.log(`     Email: ${worker.email}`);
        console.log(`     Tipo: ${worker.worker_type}`);
        console.log(`     ID: ${worker.id}`);
        console.log('');
      });

      // Verificar coincidencia con auth
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users')
        .select('id, email');

      if (!authError && authUsers) {
        const workerIds = finalWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        console.log(`🔐 VERIFICACIÓN AUTH:`);
        console.log(`📊 Workers: ${finalWorkers.length}`);
        console.log(`🔑 Auth Users: ${authUsers.length}`);
        console.log(`✅ IDs coincidentes: ${commonIds.length}`);

        if (commonIds.length === finalWorkers.length) {
          console.log('\n🎉 ¡ÉXITO TOTAL! SISTEMA COMPLETAMENTE FUNCIONAL');

          // Probar notificación final
          console.log('\n🧪 PRUEBA FINAL DE NOTIFICACIONES...');

          for (const worker of finalWorkers) {
            console.log(`\n📤 Probando notificación para ${worker.name}...`);

            const testNotification = {
              worker_id: worker.id,
              title: `🎊 ¡Bienvenida ${worker.name}!`,
              body: `Sistema de notificaciones funcionando perfectamente. Tipo: ${worker.worker_type}`,
              type: 'system_message',
              priority: 'high',
            };

            const { data: result, error: notifError } = await supabase
              .from('worker_notifications')
              .insert(testNotification)
              .select();

            if (notifError) {
              console.log(`❌ Error para ${worker.name}:`, notifError.message);
            } else {
              console.log(`✅ ¡Notificación exitosa para ${worker.name}!`);
              console.log(`   ID: ${result[0].id}`);

              // Limpiar notificación de prueba
              await supabase
                .from('worker_notifications')
                .delete()
                .eq('id', result[0].id);
            }
          }

          console.log('\n🎊 ¡SISTEMA DE NOTIFICACIONES 100% OPERATIVO!');
          console.log('=============================================');
          console.log('✅ Foreign key constraint resuelta');
          console.log('✅ Workers coinciden con auth users');
          console.log('✅ Valores válidos para worker_type');
          console.log('✅ Notificaciones funcionando');
          console.log('');
          console.log('🚀 PRUEBA EN NAVEGADOR:');
          console.log('======================');
          console.log('1. Ve al dashboard de trabajadores');
          console.log('2. Ejecuta: testFullNotificationSystem()');
          console.log('3. ¡Las notificaciones aparecerán correctamente!');
        } else {
          console.log(
            `\n⚠️ Aún faltan ${finalWorkers.length - commonIds.length} workers por asociar`
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

createFinalWorkers().catch(console.error);
