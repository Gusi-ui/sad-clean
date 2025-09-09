// Script para aplicar la política RLS
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Aplicando Política RLS para Workers');
console.log('=====================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyRLSPolicy() {
  try {
    console.log('\n📋 Habilitando RLS en tabla workers...');

    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE workers ENABLE ROW LEVEL SECURITY;',
    });

    if (enableError) {
      console.log(
        '⚠️ Error al habilitar RLS (puede que ya esté habilitado):',
        enableError.message
      );
    } else {
      console.log('✅ RLS habilitado en workers');
    }

    console.log('\n📝 Creando política de acceso público...');

    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow public read access to workers" ON workers
        FOR SELECT
        TO public
        USING (true);
      `,
    });

    if (policyError) {
      console.log('❌ Error al crear política:', policyError.message);

      // Si la política ya existe, intentar recrearla
      if (policyError.message.includes('already exists')) {
        console.log('🔄 Política ya existe, intentando reemplazarla...');

        // Primero eliminar la política existente
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: 'DROP POLICY IF EXISTS "Allow public read access to workers" ON workers;',
        });

        if (dropError) {
          console.log(
            '❌ Error al eliminar política existente:',
            dropError.message
          );
        } else {
          console.log('✅ Política anterior eliminada');

          // Crear la nueva política
          const { error: recreateError } = await supabase.rpc('exec_sql', {
            sql: `
              CREATE POLICY "Allow public read access to workers" ON workers
              FOR SELECT
              TO public
              USING (true);
            `,
          });

          if (recreateError) {
            console.log('❌ Error al recrear política:', recreateError.message);
          } else {
            console.log('✅ Política recreada exitosamente');
          }
        }
      }
    } else {
      console.log('✅ Política creada exitosamente');
    }

    console.log('\n🧪 Probando acceso con cliente anónimo...');

    // Crear cliente anónimo para probar
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: testWorkers, error: testError } = await anonSupabase
      .from('workers')
      .select('id, name, surname, email')
      .limit(10);

    console.log('📊 Resultado con cliente anónimo:', {
      workersCount: testWorkers?.length || 0,
      error: testError ? testError.message : null,
    });

    if (testWorkers && testWorkers.length > 0) {
      console.log('\n✅ ¡ÉXITO! Política RLS funcionando correctamente');
      console.log('📋 Workers accesibles para usuarios anónimos:');

      testWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
      });

      console.log('\n🎉 ¡PROBLEMA RESUELTO!');
      console.log('====================');
      console.log(
        '✅ El endpoint /api/workers ahora debería devolver los workers'
      );
      console.log(
        '✅ Los usuarios anónimos pueden acceder a la lista de workers'
      );
      console.log('✅ El sistema de notificaciones funcionará correctamente');
    } else {
      console.log('\n❌ La política RLS no está funcionando aún');

      // Intentar alternativa: verificar si podemos usar service role en el endpoint
      console.log('\n🔄 ALTERNATIVA: Usar service role en el endpoint...');

      const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);
      const { data: serviceWorkers, error: serviceError } =
        await serviceSupabase
          .from('workers')
          .select('id, name, surname, email')
          .limit(10);

      if (serviceWorkers && serviceWorkers.length > 0) {
        console.log('✅ Service role funciona correctamente');
        console.log(
          '💡 SOLUCIÓN: Modificar el endpoint para usar service role'
        );

        // Aquí podríamos modificar el endpoint para usar service role
        // Pero eso sería menos seguro, así que intentemos arreglar RLS primero
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

applyRLSPolicy().catch(console.error);
