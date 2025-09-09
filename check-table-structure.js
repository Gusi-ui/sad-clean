// Script para verificar la estructura de las tablas y foreign keys
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando Estructura de Tablas');
console.log('==================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTableStructure() {
  try {
    console.log('\n📊 Verificando foreign keys de worker_notifications...');

    // Verificar la estructura de worker_notifications
    const { data: notificationsData, error: notificationsError } =
      await supabase.from('worker_notifications').select('*').limit(1);

    if (notificationsError) {
      console.log('❌ Error:', notificationsError.message);
    } else {
      console.log('✅ worker_notifications estructura OK');
      if (notificationsData && notificationsData.length > 0) {
        console.log('Campos:', Object.keys(notificationsData[0]));
      }
    }

    // Verificar workers
    console.log('\n👥 Verificando tabla workers...');
    const { data: workersData, error: workersError } = await supabase
      .from('workers')
      .select('id, name, surname')
      .limit(5);

    if (workersError) {
      console.log('❌ Error workers:', workersError.message);
    } else {
      console.log('✅ Workers encontrados:', workersData?.length || 0);
      if (workersData && workersData.length > 0) {
        console.log('Workers existentes:');
        workersData.forEach((worker, index) => {
          console.log(
            `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.id})`
          );
        });
      }
    }

    // Verificar auth_users
    console.log('\n🔐 Verificando tabla auth_users...');
    const { data: authData, error: authError } = await supabase
      .from('auth_users')
      .select('id, email')
      .limit(5);

    if (authError) {
      console.log('❌ Error auth_users:', authError.message);
    } else {
      console.log('✅ Usuarios auth encontrados:', authData?.length || 0);
      if (authData && authData.length > 0) {
        console.log('Usuarios existentes:');
        authData.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.id})`);
        });
      } else {
        console.log('⚠️ No hay usuarios en auth_users');
      }
    }

    // Verificar si hay alguna relación entre workers y auth_users
    console.log('\n🔗 Verificando relación workers ↔ auth_users...');
    if (
      workersData &&
      workersData.length > 0 &&
      authData &&
      authData.length > 0
    ) {
      const workerIds = workersData.map((w) => w.id);
      const authIds = authData.map((u) => u.id);

      const commonIds = workerIds.filter((id) => authIds.includes(id));
      console.log('IDs comunes:', commonIds.length);

      if (commonIds.length === 0) {
        console.log(
          '❌ NINGÚN worker tiene un usuario correspondiente en auth_users'
        );
        console.log('💡 Esto explica por qué falla la foreign key constraint');
      } else {
        console.log('✅ Algunos workers tienen usuarios correspondientes');
      }
    }

    // Verificar si podemos hacer un insert con un worker existente
    console.log('\n🧪 Probando inserción con worker existente...');
    if (workersData && workersData.length > 0) {
      const workerId = workersData[0].id;

      // Primero verificar si este worker existe en auth_users
      const { data: authCheck, error: authCheckError } = await supabase
        .from('auth_users')
        .select('id')
        .eq('id', workerId)
        .single();

      if (authCheckError && authCheckError.code === 'PGRST116') {
        console.log(`❌ Worker ${workerId} NO existe en auth_users`);
        console.log(
          '💡 Necesitamos crear usuarios en auth_users para los workers existentes'
        );
        console.log('   O cambiar la foreign key constraint');

        // Sugerir solución
        console.log('\n🔧 SOLUCIONES POSIBLES:');
        console.log('1. Crear usuarios en auth_users para cada worker');
        console.log(
          '2. Cambiar la foreign key para que apunte a workers.id en lugar de auth_users.id'
        );
        console.log('3. Eliminar la foreign key constraint si no es necesaria');
      } else if (authCheck) {
        console.log(`✅ Worker ${workerId} existe en auth_users`);

        // Probar inserción
        const testNotification = {
          worker_id: workerId,
          title: 'Test Success',
          body: 'Esta notificación debería funcionar',
          type: 'system_message',
          priority: 'normal',
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('worker_notifications')
          .insert(testNotification)
          .select();

        if (insertError) {
          console.log('❌ Aún hay error:', insertError.message);
        } else {
          console.log('✅ ¡Inserción exitosa!');
          console.log('📋 Notificación creada:', insertResult[0].id);

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', insertResult[0].id);
        }
      } else {
        console.log('❌ Error verificando auth_users:', authCheckError.message);
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

checkTableStructure().catch(console.error);
