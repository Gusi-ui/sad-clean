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

console.log('🔍 Verificando asignaciones en la base de datos...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no definidas');
  process.exit(1);
}

// Crear cliente con service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAssignments() {
  try {
    // 1. Verificar usuarios existentes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(10);

    if (usersError) {
      console.error('❌ Error consultando usuarios:', usersError);
      return;
    }

    console.log('👥 Usuarios encontrados:', users.length);
    users.forEach((user) => {
      console.log(`  - ${user.id}: ${user.name} ${user.surname}`);
    });

    // 2. Verificar trabajadoras existentes
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .limit(10);

    if (workersError) {
      console.error('❌ Error consultando trabajadoras:', workersError);
      return;
    }

    console.log('👷 Trabajadoras encontradas:', workers.length);
    workers.forEach((worker) => {
      console.log(`  - ${worker.id}: ${worker.name} ${worker.surname}`);
    });

    // 3. Verificar asignaciones existentes
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(
        `
        *,
        user:users(name, surname),
        worker:workers(name, surname)
      `
      )
      .limit(10);

    if (assignmentsError) {
      console.error('❌ Error consultando asignaciones:', assignmentsError);
      return;
    }

    console.log('📋 Asignaciones encontradas:', assignments.length);
    assignments.forEach((assignment) => {
      console.log(
        `  - ${assignment.id}: ${assignment.assignment_type} (${assignment.weekly_hours}h/semana)`
      );
      console.log(
        `    Usuario: ${assignment.user?.name} ${assignment.user?.surname}`
      );
      console.log(
        `    Trabajadora: ${assignment.worker?.name} ${assignment.worker?.surname}`
      );
    });

    // 4. Verificar usuarios de prueba específicos
    const testUserIds = [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
    ];

    for (const userId of testUserIds) {
      const { data: userAssignments, error: userAssignmentsError } =
        await supabase
          .from('assignments')
          .select(
            `
          *,
          user:users(name, surname),
          worker:workers(name, surname)
        `
          )
          .eq('user_id', userId);

      if (userAssignmentsError) {
        console.error(
          `❌ Error consultando asignaciones del usuario ${userId}:`,
          userAssignmentsError
        );
      } else {
        console.log(
          `📊 Usuario ${userId} tiene ${userAssignments.length} asignaciones`
        );
        userAssignments.forEach((assignment) => {
          console.log(
            `  - ${assignment.assignment_type}: ${assignment.weekly_hours}h/semana`
          );
        });
      }
    }

    console.log('🎉 Verificación completada!');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkAssignments();
