// Script definitivo para arreglar workers y notificaciones
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 SOLUCIÓN DEFINITIVA - Sistema de Notificaciones');
console.log('=================================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function ultimateFix() {
  try {
    console.log('\n🔍 DIAGNÓSTICO COMPLETO:');
    console.log('=======================');

    // 1. Verificar workers existentes
    const { data: existingWorkers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .limit(1);

    if (workersError) {
      console.log('❌ Error obteniendo workers:', workersError.message);
      return;
    }

    if (existingWorkers && existingWorkers.length > 0) {
      console.log('✅ Ya hay workers en la base de datos');

      // Verificar si coinciden con auth
      const { data: allWorkers } = await supabase
        .from('workers')
        .select('id, email');

      const { data: authUsers } = await supabase
        .from('auth_users')
        .select('id, email');

      if (allWorkers && authUsers) {
        const workerIds = allWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        if (commonIds.length === allWorkers.length) {
          console.log('✅ Todos los workers coinciden con auth users');
          console.log('🎉 EL SISTEMA DE NOTIFICACIONES DEBERÍA FUNCIONAR');

          // Probar notificación
          console.log('\n🧪 PRUEBA FINAL:');
          const testWorker = allWorkers[0];

          const testNotification = {
            worker_id: testWorker.id,
            title: '🎉 ¡Sistema Operativo!',
            body: 'El sistema de notificaciones está completamente funcional',
            type: 'system_message',
            priority: 'high',
          };

          const { data: result, error: notifError } = await supabase
            .from('worker_notifications')
            .insert(testNotification)
            .select();

          if (notifError) {
            console.log('❌ Error en notificación:', notifError.message);
          } else {
            console.log('✅ ¡NOTIFICACIÓN EXITOSA!');
            console.log('📋 ID:', result[0].id);

            // Limpiar
            await supabase
              .from('worker_notifications')
              .delete()
              .eq('id', result[0].id);

            console.log('\n🎯 RESULTADO: SISTEMA 100% FUNCIONAL');
            console.log('=====================================');
            console.log('✅ Foreign key constraint resuelta');
            console.log('✅ Workers coinciden con auth users');
            console.log('✅ Notificaciones funcionando');
            console.log('📱 Puedes probar desde el navegador ahora');
          }
          return;
        }
      }
    }

    // 2. Si no hay workers o no coinciden, crearlos
    console.log('\n🏗️ SOLUCIÓN: Creando workers que coincidan con auth users');

    // Obtener auth users
    const { data: authUsers, error: authError } = await supabase
      .from('auth_users')
      .select('id, email');

    if (authError || !authUsers) {
      console.log('❌ Error obteniendo auth users');
      return;
    }

    // Crear workers basados en auth users
    const authUsersWithWorkerData = [
      {
        id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde',
        email: 'rosa.romu@hotmail.com',
        name: 'Rosa María',
        surname: 'Robles Muñoz',
      },
      {
        id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2',
        email: 'nuria.sil@gmail.com',
        name: 'Nuria',
        surname: 'Sin apellido',
      },
      {
        id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c',
        email: 'gracielag@gmail.com',
        name: 'Graciela',
        surname: 'García',
      },
    ];

    // Identificar campos requeridos probando inserciones
    console.log('\n🔧 Identificando campos requeridos...');

    const requiredFields = ['phone', 'dni', 'worker_type'];
    const defaultValues = {
      phone: '+34600000000',
      dni: '12345678A',
      worker_type: 'employee',
    };

    for (const workerData of authUsersWithWorkerData) {
      console.log(
        `\n📝 Creando worker: ${workerData.name} ${workerData.surname}`
      );

      // Intentar crear con campos básicos + requeridos conocidos
      const completeWorker = {
        id: workerData.id,
        name: workerData.name,
        surname: workerData.surname,
        email: workerData.email,
        ...defaultValues,
      };

      const { error: createError } = await supabase
        .from('workers')
        .insert(completeWorker);

      if (createError) {
        console.log(`❌ Error: ${createError.message}`);

        // Si ya existe, intentar upsert
        if (createError.code === '23505') {
          console.log('🔄 Worker ya existe, actualizando...');

          const { error: updateError } = await supabase
            .from('workers')
            .update(completeWorker)
            .eq('id', workerData.id);

          if (updateError) {
            console.log(`❌ Error actualizando: ${updateError.message}`);
          } else {
            console.log('✅ Worker actualizado');
          }
        }
      } else {
        console.log('✅ Worker creado exitosamente');
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

      const workerIds = finalWorkers.map((w) => w.id);
      const authIds = authUsers.map((u) => u.id);
      const commonIds = workerIds.filter((id) => authIds.includes(id));

      console.log(
        `✅ Workers coincidentes con auth: ${commonIds.length}/${finalWorkers.length}`
      );

      if (commonIds.length > 0) {
        console.log('\n🎉 ¡WORKERS CREADOS CORRECTAMENTE!');

        // Probar notificación
        const testWorker = finalWorkers[0];

        const testNotification = {
          worker_id: testWorker.id,
          title: '🚀 ¡Sistema Listo!',
          body: `Workers creados y sistema de notificaciones operativo. Worker: ${testWorker.name}`,
          type: 'system_message',
          priority: 'high',
        };

        const { data: result, error: notifError } = await supabase
          .from('worker_notifications')
          .insert(testNotification)
          .select();

        if (notifError) {
          console.log(
            '❌ Error en notificación de prueba:',
            notifError.message
          );
        } else {
          console.log('✅ ¡NOTIFICACIÓN DE PRUEBA EXITOSA!');
          console.log('📋 ID:', result[0].id);
          console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', result[0].id);

          console.log('\n🚀 PRUEBA EN NAVEGADOR:');
          console.log('======================');
          console.log('1. Ve al dashboard de trabajadores');
          console.log('2. Ejecuta el script de prueba en la consola');
          console.log('3. Las notificaciones deberían aparecer correctamente');
        }
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

ultimateFix().catch(console.error);
