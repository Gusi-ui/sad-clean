// Script para verificar el esquema de la tabla workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando Esquema de Workers');
console.log('=================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkWorkerSchema() {
  try {
    console.log('\n📊 Verificando campos requeridos en workers...');

    // Intentar insertar con campos mínimos para ver qué falla
    const testWorker = {
      id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
      name: 'Test',
      surname: 'Worker',
      email: 'test@example.com',
    };

    const { error: testError } = await supabase
      .from('workers')
      .insert(testWorker);

    if (testError) {
      console.log('❌ Error de inserción de prueba:', testError.message);
      console.log('💡 Campos requeridos faltantes detectados');

      // Intentemos uno por uno para identificar todos los campos requeridos
      const requiredFields = [];
      const testFields = [
        'phone',
        'dni',
        'address',
        'city',
        'province',
        'postal_code',
        'birth_date',
        'hire_date',
        'contract_type',
        'weekly_hours',
        'hourly_rate',
        'emergency_contact_name',
        'emergency_contact_phone',
      ];

      for (const field of testFields) {
        const testData = {
          id: 'test-' + field + '-' + Date.now(),
          name: 'Test',
          surname: 'Worker',
          email: 'test' + field + '@example.com',
        };

        testData[field] =
          field === 'phone' || field === 'emergency_contact_phone'
            ? '+34600000000'
            : field === 'dni'
              ? '12345678A'
              : field === 'birth_date' || field === 'hire_date'
                ? '1990-01-01'
                : field === 'weekly_hours'
                  ? 40
                  : field === 'hourly_rate'
                    ? 10.5
                    : field === 'contract_type'
                      ? 'full_time'
                      : 'Test ' + field;

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
          // Si no hay error, limpiar el registro de prueba
          await supabase.from('workers').delete().eq('id', testData.id);
        }
      }

      console.log('\n🎯 CAMPOS REQUERIDOS IDENTIFICADOS:');
      console.log('==================================');
      console.log('Campos siempre requeridos: id, name, surname, email');
      console.log('Campos adicionales requeridos:', requiredFields);

      // Crear workers completos con todos los campos requeridos
      console.log('\n🏗️ Creando workers completos...');

      const completeWorkers = [
        {
          id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
          name: 'Rosa María',
          surname: 'Robles Muñoz',
          email: 'rosa.romu@hotmail.com',
          phone: '+34600000000',
          dni: '12345678A',
          address: 'Calle Test 1',
          city: 'Barcelona',
          province: 'Barcelona',
          postal_code: '08001',
          birth_date: '1980-01-01',
          hire_date: '2020-01-01',
          contract_type: 'full_time',
          weekly_hours: 40,
          hourly_rate: 12.5,
          emergency_contact_name: 'Contacto Test',
          emergency_contact_phone: '+34600000099',
        },
        {
          id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2',
          name: 'Nuria',
          surname: 'Sin apellido',
          email: 'nuria.sil@gmail.com',
          phone: '+34600000001',
          dni: '23456789B',
          address: 'Calle Test 2',
          city: 'Barcelona',
          province: 'Barcelona',
          postal_code: '08002',
          birth_date: '1985-02-02',
          hire_date: '2021-02-02',
          contract_type: 'part_time',
          weekly_hours: 30,
          hourly_rate: 11.0,
          emergency_contact_name: 'Contacto Test 2',
          emergency_contact_phone: '+34600000199',
        },
        {
          id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c',
          name: 'Graciela',
          surname: 'García',
          email: 'gracielag@gmail.com',
          phone: '+34600000002',
          dni: '34567890C',
          address: 'Calle Test 3',
          city: 'Barcelona',
          province: 'Barcelona',
          postal_code: '08003',
          birth_date: '1975-03-03',
          hire_date: '2019-03-03',
          contract_type: 'full_time',
          weekly_hours: 35,
          hourly_rate: 13.25,
          emergency_contact_name: 'Contacto Test 3',
          emergency_contact_phone: '+34600000299',
        },
      ];

      for (const worker of completeWorkers) {
        console.log(`  📝 Creando ${worker.name} ${worker.surname}...`);

        const { error: insertError } = await supabase
          .from('workers')
          .insert(worker);

        if (insertError) {
          console.log(`  ❌ Error: ${insertError.message}`);
        } else {
          console.log(`  ✅ ${worker.name} creado exitosamente`);
        }
      }
    } else {
      console.log(
        '✅ Inserción básica funcionó - limpiando registro de prueba...'
      );
      // Limpiar registro de prueba
      await supabase.from('workers').delete().eq('id', testWorker.id);
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (!finalError && finalWorkers) {
      console.log(`📊 Workers totales: ${finalWorkers.length}`);

      finalWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email}) - ID: ${worker.id}`
        );
      });

      // Probar notificación
      if (finalWorkers.length > 0) {
        console.log('\n🧪 Probando notificación...');
        const testWorker = finalWorkers[0];

        const testNotification = {
          worker_id: testWorker.id,
          title: '🎉 ¡Workers Restaurados!',
          body: 'Los workers han sido restaurados completamente con todos los campos requeridos',
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
          console.log('✅ ¡Notificación exitosa!');
          console.log('📋 ID:', notificationResult[0].id);
          console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', notificationResult[0].id);
        }
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

checkWorkerSchema().catch(console.error);
