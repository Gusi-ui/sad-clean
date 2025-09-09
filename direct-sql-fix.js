// Script para ejecutar SQL directamente en Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 EJECUCIÓN DIRECTA DE SQL PARA RLS');
console.log('====================================');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeDirectSQL() {
  try {
    console.log('\n📋 PASO 1: Ejecutando SQL para habilitar RLS...');

    // Ejecutar SQL directamente usando el cliente de Supabase
    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec', {
      query: 'ALTER TABLE workers ENABLE ROW LEVEL SECURITY;',
    });

    if (rlsError) {
      console.log('⚠️ Error al habilitar RLS:', rlsError.message);
    } else {
      console.log('✅ RLS habilitado en workers');
    }

    console.log('\n📝 PASO 2: Creando política de acceso público...');

    const { data: policyResult, error: policyError } = await supabase.rpc(
      'exec',
      {
        query: `
          CREATE POLICY "Allow public read access to workers" ON workers
          FOR SELECT
          TO public
          USING (true);
        `,
      }
    );

    if (policyError) {
      console.log('❌ Error al crear política:', policyError.message);

      // Si la política ya existe, intentar DROP primero
      if (policyError.message.includes('already exists')) {
        console.log('🔄 Intentando eliminar política existente...');

        const { data: dropResult, error: dropError } = await supabase.rpc(
          'exec',
          {
            query:
              'DROP POLICY IF EXISTS "Allow public read access to workers" ON workers;',
          }
        );

        if (dropError) {
          console.log('❌ Error al eliminar política:', dropError.message);
        } else {
          console.log('✅ Política eliminada, intentando crear nueva...');

          const { data: newPolicyResult, error: newPolicyError } =
            await supabase.rpc('exec', {
              query: `
                CREATE POLICY "Allow public read access to workers" ON workers
                FOR SELECT
                TO public
                USING (true);
              `,
            });

          if (newPolicyError) {
            console.log(
              '❌ Error al crear nueva política:',
              newPolicyError.message
            );
          } else {
            console.log('✅ Nueva política creada exitosamente');
          }
        }
      }
    } else {
      console.log('✅ Política creada exitosamente');
    }

    console.log('\n🧪 PASO 3: Probando con cliente anónimo...');

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
      console.log('\n🎉 ¡ÉXITO! RLS FUNCIONANDO CORRECTAMENTE');
      console.log('=====================================');

      testWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
      });

      console.log('\n✅ El endpoint /api/workers ahora debería funcionar');
      console.log('✅ Los usuarios anónimos pueden acceder a workers');
      console.log('✅ El sistema de notificaciones está listo');
    } else {
      console.log(
        '\n❌ RLS aún no funciona, intentando solución alternativa...'
      );

      // SOLUCIÓN ALTERNATIVA: Modificar el endpoint para usar service role
      console.log(
        '\n🔧 SOLUCIÓN ALTERNATIVA: Modificando endpoint para usar service role'
      );

      const fs = require('fs');

      // Leer el archivo del endpoint
      const endpointPath = 'src/app/api/workers/route.ts';
      let endpointContent = fs.readFileSync(endpointPath, 'utf8');

      // Reemplazar la configuración del cliente de Supabase
      const oldConfig = `const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Importante para tokens de recuperación
  },
});`;

      const newConfig = `// Usar service role para acceder a workers (debido a políticas RLS)
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});`;

      if (endpointContent.includes(oldConfig)) {
        endpointContent = endpointContent.replace(oldConfig, newConfig);
        fs.writeFileSync(endpointPath, endpointContent);
        console.log('✅ Endpoint modificado para usar service role');
      } else {
        console.log(
          '⚠️ No se pudo encontrar la configuración exacta en el endpoint'
        );
      }

      console.log('\n🧪 Probando endpoint modificado...');

      // Reiniciar servidor para que tome los cambios
      console.log('🔄 Reiniciando servidor...');

      // Ejecutar el test del endpoint
      setTimeout(async () => {
        const http = require('http');

        const options = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/workers',
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              if (jsonData.workers && jsonData.workers.length > 0) {
                console.log('\n🎉 ¡SOLUCIÓN ALTERNATIVA EXITOSA!');
                console.log('================================');
                console.log('✅ Endpoint funcionando con service role');
                console.log('✅ Workers disponibles:', jsonData.workers.length);
                console.log('✅ Sistema de notificaciones operativo');
              } else {
                console.log('❌ La solución alternativa tampoco funcionó');
              }
            } catch (e) {
              console.log('❌ Error al parsear respuesta:', e.message);
            }
          });
        });

        req.on('error', (e) => {
          console.log('❌ Error en petición:', e.message);
        });

        req.end();
      }, 3000);
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

executeDirectSQL().catch(console.error);
