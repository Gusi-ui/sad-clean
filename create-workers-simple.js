// Script simple para crear workers con campos básicos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🏗️ Creando Workers Básicos');
console.log('==========================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBasicWorkers() {
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
      console.log('✅ Ya hay workers, no necesito crear más');
      return;
    }

    console.log('\n🧪 Probando campos mínimos requeridos...');

    // Primero identificar qué campos son realmente requeridos
    const testWorker = {
      id: 'test-minimal-' + Date.now(),
      name: 'Test',
      surname: 'Minimal',
      email: 'test.minimal@example.com',
    };

    const { error: minimalError } = await supabase
      .from('workers')
      .insert(testWorker);

    const requiredFields = [];

    if (minimalError) {
      console.log('❌ Error con campos mínimos:', minimalError.message);

      // Probar campos uno por uno
      const possibleFields = ['phone', 'dni'];

      for (const field of possibleFields) {
        const testData = {
          id: 'test-' + field + '-' + Date.now(),
          name: 'Test',
          surname: field,
          email: 'test.' + field + '@example.com',
        };

        if (field === 'phone') testData.phone = '+34600000000';
        if (field === 'dni') testData.dni = '12345678A';

        const { error: fieldError } = await supabase
          .from('workers')
          .insert(testData);

        if (
          fieldError &&
          fieldError.message.includes(`null value in column "${field}"`)
        ) {
          requiredFields.push(field);
          console.log(`  📋 Campo requerido: ${field}`);
        } else if (!fieldError) {
          console.log(`  ✅ Campo ${field} no es requerido`);
          // Limpiar registro de prueba
          await supabase.from('workers').delete().eq('id', testData.id);
        }
      }
    } else {
      console.log(
        '✅ Campos mínimos (id, name, surname, email) son suficientes'
      );
      // Limpiar registro de prueba
      await supabase.from('workers').delete().eq('id', testWorker.id);
    }

    console.log('\n🎯 CAMPOS REQUERIDOS FINALES:');
    console.log('============================');
    console.log('Siempre requeridos: id, name, surname, email');
    if (requiredFields.length > 0) {
      console.log('Adicionales requeridos:', requiredFields.join(', '));
    }

    // Crear workers con campos correctos
    console.log('\n🏗️ Creando workers reales...');

    const workersToCreate = [
      {
        id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
        name: 'Rosa María',
        surname: 'Robles Muñoz',
        email: 'rosa.romu@hotmail.com',
      },
      {
        id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2',
        name: 'Nuria',
        surname: 'Sin apellido',
        email: 'nuria.sil@gmail.com',
      },
      {
        id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c',
        name: 'Graciela',
        surname: 'García',
        email: 'gracielag@gmail.com',
      },
    ];

    // Agregar campos adicionales si son requeridos
    if (requiredFields.includes('phone')) {
      workersToCreate[0].phone = '+34600000000';
      workersToCreate[1].phone = '+34600000001';
      workersToCreate[2].phone = '+34600000002';
    }

    if (requiredFields.includes('dni')) {
      workersToCreate[0].dni = '12345678A';
      workersToCreate[1].dni = '23456789B';
      workersToCreate[2].dni = '34567890C';
    }

    for (const worker of workersToCreate) {
      console.log(`  📝 Creando ${worker.name} ${worker.surname}...`);

      const { error: createError } = await supabase
        .from('workers')
        .insert(worker);

      if (createError) {
        console.log(
          `  ❌ Error creando ${worker.name}: ${createError.message}`
        );
      } else {
        console.log(`  ✅ ${worker.name} creado exitosamente`);
      }
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (!finalError && finalWorkers) {
      console.log(`📊 Workers creados: ${finalWorkers.length}`);

      finalWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email}) - ID: ${worker.id}`
        );
      });

      // Verificar que coincidan con auth
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users')
        .select('id, email');

      if (!authError && authUsers) {
        const workerIds = finalWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        console.log(
          `✅ IDs coincidentes con auth: ${commonIds.length}/${finalWorkers.length}`
        );

        if (commonIds.length === finalWorkers.length) {
          console.log('\n🎉 ¡WORKERS RESTAURADOS EXITOSAMENTE!');

          // Probar notificación
          console.log('\n🧪 Probando notificación final...');
          const testWorker = finalWorkers[0];

          const testNotification = {
            worker_id: testWorker.id,
            title: '🚨 ¡Sistema Completamente Restaurado!',
            body: 'Los workers han sido restaurados y coinciden perfectamente con los usuarios auth. El sistema de notificaciones está 100% funcional.',
            type: 'system_message',
            priority: 'urgent',
          };

          const { data: notificationResult, error: notificationError } =
            await supabase
              .from('worker_notifications')
              .insert(testNotification)
              .select();

          if (notificationError) {
            console.log('❌ Error en notificación:', notificationError.message);
          } else {
            console.log('✅ ¡NOTIFICACIÓN EXITOSA!');
            console.log('📋 ID:', notificationResult[0].id);
            console.log('🎉 ¡SISTEMA DE NOTIFICACIONES 100% FUNCIONAL!');

            // Limpiar
            await supabase
              .from('worker_notifications')
              .delete()
              .eq('id', notificationResult[0].id);
          }
        } else {
          console.log(
            `\n⚠️ Algunos workers no coinciden (${finalWorkers.length - commonIds.length} faltantes)`
          );
        }
      }
    } else {
      console.log('❌ Error en verificación final:', finalError?.message);
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

createBasicWorkers().catch(console.error);
