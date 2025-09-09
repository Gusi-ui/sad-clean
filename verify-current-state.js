// Script para verificar el estado actual del sistema
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 VERIFICACIÓN DEL ESTADO ACTUAL');
console.log('=================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyCurrentState() {
  try {
    console.log('\n👥 VERIFICANDO WORKERS EN BASE DE DATOS...');

    const { data: dbWorkers, error: dbError } = await supabase
      .from('workers')
      .select('id, name, surname, email, phone, dni, worker_type');

    if (dbError) {
      console.log('❌ Error obteniendo workers de BD:', dbError.message);
      return;
    }

    console.log(`📊 Workers en BD: ${dbWorkers?.length || 0}`);

    if (dbWorkers && dbWorkers.length > 0) {
      console.log('\n📋 WORKERS REALES EN BD:');
      console.log('========================');
      dbWorkers.forEach((worker, index) => {
        console.log(`${index + 1}. ${worker.name} ${worker.surname}`);
        console.log(`   Email: ${worker.email}`);
        console.log(`   ID: ${worker.id}`);
        console.log(`   Tipo: ${worker.worker_type}`);
        console.log(`   Phone: ${worker.phone}`);
        console.log(`   DNI: ${worker.dni}`);
        console.log('');
      });
    }

    console.log('\n🔐 VERIFICANDO AUTH USERS...');

    const { data: authUsers, error: authError } = await supabase
      .from('auth_users')
      .select('id, email');

    if (authError) {
      console.log('❌ Error obteniendo auth users:', authError.message);
      return;
    }

    console.log(`📊 Auth Users: ${authUsers?.length || 0}`);

    if (authUsers && authUsers.length > 0) {
      console.log('\n📋 AUTH USERS:');
      console.log('==============');
      authUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.id})`);
      });
    }

    console.log('\n🔗 VERIFICANDO COINCIDENCIAS...');

    if (dbWorkers && authUsers) {
      const workerIds = dbWorkers.map((w) => w.id);
      const authIds = authUsers.map((u) => u.id);
      const commonIds = workerIds.filter((id) => authIds.includes(id));

      console.log(`Workers IDs: [${workerIds.join(', ')}]`);
      console.log(`Auth IDs: [${authIds.join(', ')}]`);
      console.log(`IDs coincidentes: ${commonIds.length}/${dbWorkers.length}`);

      if (commonIds.length === dbWorkers.length) {
        console.log('✅ ¡TODOS los workers coinciden con auth users!');
      } else {
        console.log('❌ Algunos workers NO coinciden con auth users');

        // Mostrar cuáles no coinciden
        const nonMatching = dbWorkers.filter((w) => !authIds.includes(w.id));
        console.log('\n❌ Workers sin usuario auth correspondiente:');
        nonMatching.forEach((worker) => {
          console.log(`  - ${worker.name} ${worker.surname} (${worker.id})`);
        });
      }
    }

    console.log('\n🧪 PROBANDO NOTIFICACIÓN DIRECTA...');

    if (dbWorkers && dbWorkers.length > 0) {
      const testWorker = dbWorkers[0];

      console.log(
        `Usando worker: ${testWorker.name} ${testWorker.surname} (${testWorker.id})`
      );

      const testNotification = {
        worker_id: testWorker.id,
        title: '🔧 Prueba Directa desde Servidor',
        body: `Notificación de prueba para ${testWorker.name} - ${new Date().toISOString()}`,
        type: 'system_message',
        priority: 'normal',
      };

      console.log('📤 Enviando notificación...');
      console.log('Datos:', JSON.stringify(testNotification, null, 2));

      const { data: result, error: notifError } = await supabase
        .from('worker_notifications')
        .insert(testNotification)
        .select();

      if (notifError) {
        console.log('❌ Error en notificación:', notifError.message);
        console.log('Código:', notifError.code);
        console.log('Detalles:', notifError.details);
      } else {
        console.log('✅ ¡Notificación creada exitosamente!');
        console.log('ID:', result[0].id);
        console.log('Datos completos:', JSON.stringify(result[0], null, 2));

        // Limpiar
        await supabase
          .from('worker_notifications')
          .delete()
          .eq('id', result[0].id);

        console.log('🧹 Notificación de prueba limpiada');
      }
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    console.log('========================');

    if (dbWorkers && dbWorkers.length > 0) {
      const hasValidWorkers = dbWorkers.every(
        (w) =>
          w.id &&
          w.name &&
          w.surname &&
          w.email &&
          w.phone &&
          w.dni &&
          w.worker_type
      );

      if (hasValidWorkers) {
        console.log('✅ Workers tienen todos los campos requeridos');
      } else {
        console.log('⚠️ Algunos workers faltan campos requeridos');
      }

      if (authUsers && dbWorkers) {
        const workerIds = dbWorkers.map((w) => w.id);
        const authIds = authUsers.map((u) => u.id);
        const commonIds = workerIds.filter((id) => authIds.includes(id));

        if (commonIds.length === dbWorkers.length) {
          console.log('✅ Foreign key constraint debería funcionar');
        } else {
          console.log('❌ Foreign key constraint FALLARÁ');
        }
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

verifyCurrentState().catch(console.error);
