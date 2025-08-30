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

console.log('🔍 Verificando políticas RLS para la tabla holidays...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no definidas');
  process.exit(1);
}

// Crear cliente con service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHolidaysPolicies() {
  try {
    // 1. Verificar si la tabla holidays existe y tiene RLS habilitado
    const { error: tableError } = await supabase
      .from('holidays')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a tabla holidays:', tableError);
      return;
    }

    console.log('✅ Tabla holidays accesible');

    // 2. Probar inserción directa (sin RLS)
    const testHoliday = {
      day: 31,
      month: 12,
      year: 2025,
      name: 'Test Holiday - Direct Insert',
      type: 'test',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('holidays')
      .insert(testHoliday)
      .select();

    if (insertError) {
      console.log('❌ Error insertando festivo de prueba:', insertError);
    } else {
      console.log('✅ Inserción directa exitosa:', insertData);

      // Limpiar festivo de prueba
      await supabase
        .from('holidays')
        .delete()
        .eq('name', 'Test Holiday - Direct Insert');
    }

    // 3. Probar consulta directa
    const { data: queryData, error: queryError } = await supabase
      .from('holidays')
      .select('*')
      .limit(5);

    if (queryError) {
      console.log('❌ Error consultando festivos:', queryError);
    } else {
      console.log(
        '✅ Consulta directa exitosa. Festivos encontrados:',
        queryData.length
      );
      console.log('📋 Primeros festivos:', queryData);
    }

    // 4. Verificar si hay festivos de Mataró 2025
    const { data: mataroHolidays, error: mataroError } = await supabase
      .from('holidays')
      .select('*')
      .eq('year', 2025)
      .order('month, day');

    if (mataroError) {
      console.log('❌ Error consultando festivos de Mataró 2025:', mataroError);
    } else {
      console.log(
        '📅 Festivos de Mataró 2025 encontrados:',
        mataroHolidays.length
      );
      mataroHolidays.forEach((holiday) => {
        console.log(
          `  - ${holiday.day}/${holiday.month}/${holiday.year}: ${holiday.name} (${holiday.type})`
        );
      });
    }

    console.log('🎉 Verificación completada!');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkHolidaysPolicies();
