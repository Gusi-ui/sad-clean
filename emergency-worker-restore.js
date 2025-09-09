// Script de emergencia para restaurar workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚨 EMERGENCIA: Restaurando Workers');
console.log('==================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function emergencyRestore() {
  try {
    console.log('\n🔍 Verificando estado actual...');

    const { data: currentWorkers, error: workersError } = await supabase
      .from('workers')
      .select('*');

    if (workersError) {
      console.log('❌ Error obteniendo workers:', workersError.message);
      return;
    }

    console.log(`📊 Workers actuales: ${currentWorkers?.length || 0}`);

    if (currentWorkers && currentWorkers.length > 0) {
      console.log('✅ Ya hay workers, no necesito restaurar');
      return;
    }

    console.log('\n🔐 Obteniendo usuarios auth para restaurar workers...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth_users')
      .select('id, email');

    if (authError) {
      console.log('❌ Error obteniendo auth users:', authError.message);
      return;
    }

    // Workers que necesito restaurar (basado en emails conocidos)
    const workersToRestore = [
      {
        id: 'b1ac55dd-2ccc-4e18-952b-198153dd2fde', // Rosa María
        name: 'Rosa María',
        surname: 'Robles Muñoz',
        email: 'rosa.romu@hotmail.com',
        phone: '+34600000000',
      },
      {
        id: '79bb28d1-2665-4aab-a80c-4bb2ef83eab2', // Nuria
        name: 'Nuria',
        surname: 'Sin apellido',
        email: 'nuria.sil@gmail.com',
        phone: '+34600000001',
      },
      {
        id: '1420bbad-bcdc-4b99-83b6-87b87ea2490c', // Graciela
        name: 'Graciela',
        surname: 'García',
        email: 'gracielag@gmail.com',
        phone: '+34600000002',
      },
    ];

    console.log('\n🏗️ Restaurando workers...');

    for (const worker of workersToRestore) {
      console.log(`  📝 Restaurando ${worker.name} ${worker.surname}...`);

      const { error: insertError } = await supabase.from('workers').insert({
        id: worker.id,
        name: worker.name,
        surname: worker.surname,
        email: worker.email,
        phone: worker.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.log(
          `  ❌ Error restaurando ${worker.name}: ${insertError.message}`
        );
      } else {
        console.log(`  ✅ ${worker.name} restaurado exitosamente`);
      }
    }

    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalError } = await supabase
      .from('workers')
      .select('id, name, surname, email, phone');

    if (!finalError && finalWorkers) {
      console.log(`📊 Workers restaurados: ${finalWorkers.length}`);

      finalWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email}) - ID: ${worker.id}`
        );
      });

      // Verificar que coincidan con auth
      const workerIds = finalWorkers.map((w) => w.id);
      const authIds = authUsers.map((u) => u.id);
      const commonIds = workerIds.filter((id) => authIds.includes(id));

      console.log(
        `✅ IDs coincidentes con auth: ${commonIds.length}/${finalWorkers.length}`
      );

      if (commonIds.length === finalWorkers.length) {
        console.log('\n🎉 ¡RESTAURACIÓN EXITOSA!');
        console.log('💡 Los workers han sido restaurados con IDs correctos');

        // Probar notificación
        console.log('\n🧪 Probando notificación...');
        const testWorker = finalWorkers[0];

        const testNotification = {
          worker_id: testWorker.id,
          title: '🚨 Sistema Restaurado de Emergencia',
          body: 'Los workers han sido restaurados y el sistema de notificaciones está operativo nuevamente',
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
          console.log('✅ ¡Notificación de prueba exitosa!');
          console.log('📋 ID:', notificationResult[0].id);
          console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');

          // Limpiar
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', notificationResult[0].id);
        }
      } else {
        console.log(
          `\n⚠️ Algunos workers no coinciden con auth (${finalWorkers.length - commonIds.length} faltantes)`
        );
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

emergencyRestore().catch(console.error);
