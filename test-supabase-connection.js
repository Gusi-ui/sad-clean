// Script para probar la conexión de Supabase directamente
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Probando conexión de Supabase directamente');
console.log('URL:', supabaseUrl ? '✅' : '❌');
console.log('Key:', supabaseKey ? '✅' : '❌');

// Crear cliente igual que en el endpoint
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

async function testConnection() {
  try {
    console.log('\n🧪 Probando consulta básica...');

    const { data: workers, error } = await supabase
      .from('workers')
      .select('id, name, surname, email')
      .limit(10);

    console.log('📊 Resultado:', {
      workersCount: workers?.length || 0,
      hasWorkers: !!workers,
      error: error ? error.message : null,
      errorCode: error ? error.code : null,
    });

    if (error) {
      console.log('❌ Error en consulta:', error);
      return;
    }

    if (workers && workers.length > 0) {
      console.log('\n✅ WORKERS ENCONTRADOS:');
      workers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
      });
    } else {
      console.log('⚠️ No se encontraron workers en la consulta directa');

      // Verificar si la tabla existe
      console.log('\n🔍 Verificando si la tabla workers existe...');

      const { data: tableCheck, error: tableError } = await supabase
        .from('workers')
        .select('count', { count: 'exact', head: true });

      if (tableError) {
        console.log('❌ Error al verificar tabla:', tableError.message);
      } else {
        console.log('✅ Tabla workers existe');
        console.log('📊 Registros en tabla:', tableCheck);
      }
    }

    // Probar una consulta diferente
    console.log('\n🔄 Probando consulta sin límite...');

    const { data: allWorkers, error: allError } = await supabase
      .from('workers')
      .select('*');

    console.log('📊 Consulta sin límite:', {
      workersCount: allWorkers?.length || 0,
      error: allError ? allError.message : null,
    });

    if (allWorkers && allWorkers.length > 0) {
      console.log('✅ Consulta sin límite funciona');
      allWorkers.forEach((worker, index) => {
        console.log(`  ${index + 1}. ${worker.name} (${worker.id})`);
      });
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

testConnection().catch(console.error);
