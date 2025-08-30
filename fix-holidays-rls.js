const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno desde .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Cargar variables de entorno
loadEnvFile();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando variables de entorno...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Definido' : '❌ No definido');
console.log(
  'SERVICE_ROLE_KEY:',
  supabaseServiceKey ? '✅ Definido' : '❌ No definido'
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos'
  );
  process.exit(1);
}

// Crear cliente con service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHolidaysRLS() {
  try {
    console.log('🔧 Corrigiendo permisos RLS para la tabla holidays...');

    // 1. Verificar si la tabla holidays existe
    const { error: tableError } = await supabase
      .from('holidays')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Error verificando tabla holidays:', tableError);
      return;
    }

    console.log('✅ Tabla holidays existe');

    // 2. Habilitar RLS en la tabla holidays
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;',
    });

    if (rlsError) {
      console.log('⚠️ RLS ya estaba habilitado o error:', rlsError.message);
    } else {
      console.log('✅ RLS habilitado en tabla holidays');
    }

    // 3. Crear políticas RLS
    const policies = [
      {
        name: 'Allow read access to holidays',
        sql: `
          DROP POLICY IF EXISTS "Allow read access to holidays" ON public.holidays;
          CREATE POLICY "Allow read access to holidays" ON public.holidays
            FOR SELECT
            TO authenticated
            USING (true);
        `,
      },
      {
        name: 'Allow insert access to holidays',
        sql: `
          DROP POLICY IF EXISTS "Allow insert access to holidays" ON public.holidays;
          CREATE POLICY "Allow insert access to holidays" ON public.holidays
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
        `,
      },
      {
        name: 'Allow update access to holidays',
        sql: `
          DROP POLICY IF EXISTS "Allow update access to holidays" ON public.holidays;
          CREATE POLICY "Allow update access to holidays" ON public.holidays
            FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);
        `,
      },
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: policy.sql,
        });

        if (error) {
          console.log(
            `⚠️ Error creando política ${policy.name}:`,
            error.message
          );
        } else {
          console.log(`✅ Política ${policy.name} creada correctamente`);
        }
      } catch (err) {
        console.log(`⚠️ Error con política ${policy.name}:`, err.message);
      }
    }

    // 4. Verificar que las políticas se crearon
    const { data: policiesData, error: policiesError } = await supabase.rpc(
      'exec_sql',
      {
        sql: `
        SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd
        FROM pg_policies
        WHERE tablename = 'holidays';
      `,
      }
    );

    if (policiesError) {
      console.log('⚠️ Error verificando políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas RLS actuales:');
      console.log(policiesData);
    }

    // 5. Probar inserción de un festivo de prueba
    const testHoliday = {
      day: 1,
      month: 1,
      year: 2025,
      name: 'Test Holiday',
      type: 'test',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('holidays')
      .insert(testHoliday)
      .select();

    if (insertError) {
      console.log('❌ Error insertando festivo de prueba:', insertError);
    } else {
      console.log('✅ Inserción de prueba exitosa:', insertData);

      // Limpiar festivo de prueba
      await supabase.from('holidays').delete().eq('name', 'Test Holiday');
    }

    console.log('🎉 Proceso completado!');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
fixHolidaysRLS();
