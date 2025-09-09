// Script para crear usuarios en auth_users para los workers existentes
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Creando Usuarios Auth para Workers');
console.log('===================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixWorkersAuth() {
  try {
    console.log('\n👥 Obteniendo workers existentes...');

    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    if (workersError) {
      console.log('❌ Error obteniendo workers:', workersError.message);
      return;
    }

    if (!workers || workers.length === 0) {
      console.log('⚠️ No hay workers para procesar');
      return;
    }

    console.log(`✅ Encontrados ${workers.length} workers:`);
    workers.forEach((worker, index) => {
      console.log(
        `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email}) - ID: ${worker.id}`
      );
    });

    // Procesar cada worker
    for (const worker of workers) {
      console.log(`\n🔐 Procesando worker: ${worker.name} ${worker.surname}`);

      // Verificar si ya existe un usuario con este email
      const { data: existingUser, error: checkError } = await supabase
        .from('auth_users')
        .select('id, email')
        .eq('email', worker.email)
        .single();

      if (existingUser) {
        console.log(
          `✅ Ya existe usuario para ${worker.email} (ID: ${existingUser.id})`
        );

        // Verificar si el ID del worker coincide con el del usuario
        if (existingUser.id === worker.id) {
          console.log('✅ El worker ya tiene el usuario correspondiente');
        } else {
          console.log('⚠️ El worker tiene un ID diferente al usuario auth');
          console.log(`   Worker ID: ${worker.id}`);
          console.log(`   Auth ID: ${existingUser.id}`);

          // Actualizar el worker para usar el ID correcto del usuario auth
          console.log('🔄 Actualizando worker para usar ID correcto...');

          const { error: updateError } = await supabase
            .from('workers')
            .update({
              id: existingUser.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', worker.id);

          if (updateError) {
            console.log(`❌ Error actualizando worker: ${updateError.message}`);
          } else {
            console.log(`✅ Worker actualizado exitosamente`);
            console.log(`   Nuevo ID: ${existingUser.id}`);

            // Actualizar la referencia local para evitar problemas
            worker.id = existingUser.id;
          }
        }
        continue;
      }

      // Si no existe usuario, intentar crear uno
      // Nota: Esto requiere que el email sea válido y no esté registrado
      console.log(`📝 Creando usuario auth para ${worker.email}...`);

      try {
        // Usar el ID del worker como ID del usuario auth
        // Esto requiere acceso directo a la tabla auth_users
        const { data: authResult, error: authError } = await supabase
          .from('auth_users')
          .insert({
            id: worker.id, // Usar el mismo ID que el worker
            email: worker.email,
            encrypted_password: '$2a$10$dummy.hash.for.testing.purposes.only', // Hash dummy
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
          });

        if (authError) {
          console.log(`❌ Error creando usuario auth: ${authError.message}`);

          // Si el error es por email duplicado o constraint, intentar otro approach
          if (
            authError.code === '23505' ||
            authError.message.includes('duplicate')
          ) {
            console.log(
              '💡 El email ya existe, intentando usar ID existente...'
            );

            // Buscar el usuario existente y usar su ID
            const { data: existingUserByEmail, error: findError } =
              await supabase
                .from('auth_users')
                .select('id, email')
                .eq('email', worker.email)
                .single();

            if (existingUserByEmail) {
              console.log(
                `✅ Encontrado usuario existente: ${existingUserByEmail.id}`
              );

              // Actualizar el worker para usar el ID correcto
              const { error: updateError } = await supabase
                .from('workers')
                .update({ id: existingUserByEmail.id })
                .eq('id', worker.id);

              if (updateError) {
                console.log(
                  `❌ Error actualizando worker: ${updateError.message}`
                );
              } else {
                console.log(`✅ Worker actualizado para usar ID correcto`);
              }
            }
          }
        } else {
          console.log(
            `✅ Usuario auth creado exitosamente: ${worker.email} (ID: ${worker.id})`
          );
        }
      } catch (insertError) {
        console.log(`❌ Error en inserción: ${insertError.message}`);
      }
    }

    // Verificar el resultado final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log('====================');

    const { data: finalWorkers, error: finalWorkersError } = await supabase
      .from('workers')
      .select('id, name, surname, email');

    const { data: finalAuth, error: finalAuthError } = await supabase
      .from('auth_users')
      .select('id, email');

    if (!finalWorkersError && !finalAuthError && finalWorkers && finalAuth) {
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
        console.log('💡 El sistema de notificaciones debería funcionar ahora');
      } else {
        console.log(
          `\n⚠️ Aún faltan ${finalWorkers.length - commonIds.length} workers por asociar`
        );
      }
    }

    // Probar una notificación de ejemplo
    console.log('\n🧪 Probando notificación de ejemplo...');
    if (finalWorkers && finalWorkers.length > 0) {
      const testWorker = finalWorkers[0];

      // Verificar si el worker existe en auth
      const { data: authCheck } = await supabase
        .from('auth_users')
        .select('id')
        .eq('id', testWorker.id)
        .single();

      if (authCheck) {
        const testNotification = {
          worker_id: testWorker.id,
          title: '🔧 Sistema Reparado',
          body: 'El sistema de notificaciones ha sido reparado y está funcionando correctamente',
          type: 'system_message',
          priority: 'normal',
        };

        const { data: notificationResult, error: notificationError } =
          await supabase
            .from('worker_notifications')
            .insert(testNotification)
            .select();

        if (notificationError) {
          console.log(
            '❌ Error en notificación de prueba:',
            notificationError.message
          );
        } else {
          console.log('✅ ¡Notificación de prueba creada exitosamente!');
          console.log('📋 ID:', notificationResult[0].id);

          // Limpiar la notificación de prueba
          await supabase
            .from('worker_notifications')
            .delete()
            .eq('id', notificationResult[0].id);

          console.log('🧹 Notificación de prueba limpiada');
        }
      } else {
        console.log(
          '❌ El worker de prueba no tiene usuario auth correspondiente'
        );
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

fixWorkersAuth().catch(console.error);
