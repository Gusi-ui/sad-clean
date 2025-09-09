// Script para verificar políticas RLS en la tabla workers
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Verificando Políticas RLS');
console.log('============================');

// Cliente anónimo (como el que usa el endpoint)
const anonSupabase = createClient(supabaseUrl, supabaseKey);

// Cliente con service role (acceso completo)
const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRLSPolicies() {
  try {
    console.log('\n👤 Probando con cliente ANÓNIMO (como el endpoint)...');

    const { data: anonWorkers, error: anonError } = await anonSupabase
      .from('workers')
      .select('id, name, surname, email')
      .limit(10);

    console.log('📊 Resultado con cliente anónimo:', {
      workersCount: anonWorkers?.length || 0,
      error: anonError ? anonError.message : null,
      errorCode: anonError ? anonError.code : null,
    });

    console.log('\n🔑 Probando con cliente SERVICE ROLE (acceso completo)...');

    const { data: serviceWorkers, error: serviceError } = await serviceSupabase
      .from('workers')
      .select('id, name, surname, email')
      .limit(10);

    console.log('📊 Resultado con service role:', {
      workersCount: serviceWorkers?.length || 0,
      error: serviceError ? serviceError.message : null,
    });

    if (serviceWorkers && serviceWorkers.length > 0) {
      console.log('\n✅ WORKERS CON SERVICE ROLE:');
      serviceWorkers.forEach((worker, index) => {
        console.log(
          `  ${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
      });

      console.log('\n🔐 DIAGNÓSTICO:');
      console.log('================');

      if (anonWorkers && anonWorkers.length > 0) {
        console.log('✅ RLS permite acceso anónimo a workers');
      } else if (anonError) {
        console.log('❌ RLS BLOQUEA acceso anónimo:', anonError.message);
        console.log(
          '💡 SOLUCIÓN: Necesitamos políticas RLS que permitan acceso anónimo'
        );
      } else {
        console.log('⚠️ RLS permite acceso pero no hay workers visibles');
        console.log('💡 POSIBLE CAUSA: Políticas RLS demasiado restrictivas');
      }

      console.log('\n🔧 POSIBLES SOLUCIONES:');
      console.log(
        '1. Crear política RLS que permita SELECT para usuarios anónimos'
      );
      console.log('2. O usar service role en el endpoint (menos seguro)');
      console.log('3. O autenticar usuarios antes de acceder a workers');
    } else {
      console.log('❌ No hay workers ni siquiera con service role');
    }

    // Verificar si hay políticas RLS definidas
    console.log('\n📋 Verificando políticas RLS existentes...');

    try {
      // Intentar consultar información de políticas (esto puede no funcionar)
      const { data: policies, error: policiesError } = await serviceSupabase
        .from('pg_policies')
        .select('*')
        .eq('tabname', 'workers');

      if (policiesError) {
        console.log(
          '⚠️ No se pudo consultar políticas:',
          policiesError.message
        );
      } else if (policies && policies.length > 0) {
        console.log('📋 Políticas RLS encontradas:');
        policies.forEach((policy) => {
          console.log(
            `  - ${policy.policyname}: ${policy.cmd} (${policy.roles})`
          );
        });
      } else {
        console.log('📋 No hay políticas RLS definidas para workers');
        console.log(
          '💡 Esto significa que RLS está DESACTIVADO para esta tabla'
        );
      }
    } catch (e) {
      console.log('⚠️ Error al consultar políticas RLS:', e.message);
    }
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
  }
}

checkRLSPolicies().catch(console.error);
