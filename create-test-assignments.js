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

console.log('🔧 Creando asignaciones de prueba...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no definidas');
  process.exit(1);
}

// Crear cliente con service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAssignments() {
  try {
    // 1. Obtener usuarios y trabajadoras existentes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .limit(3);

    if (usersError || workersError) {
      console.error(
        '❌ Error obteniendo usuarios o trabajadoras:',
        usersError || workersError
      );
      return;
    }

    if (users.length === 0 || workers.length === 0) {
      console.error('❌ No hay usuarios o trabajadoras disponibles');
      return;
    }

    console.log(`👥 Usuarios disponibles: ${users.length}`);
    console.log(`👷 Trabajadoras disponibles: ${workers.length}`);

    // 2. Crear asignaciones de prueba
    const testAssignments = [
      {
        user_id: users[0].id,
        worker_id: workers[0].id,
        assignment_type: 'laborables',
        weekly_hours: 20,
        schedule: {
          monday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '12:00', hours: 4 }],
            totalHours: 4,
          },
          tuesday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '12:00', hours: 4 }],
            totalHours: 4,
          },
          wednesday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '12:00', hours: 4 }],
            totalHours: 4,
          },
          thursday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '12:00', hours: 4 }],
            totalHours: 4,
          },
          friday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '12:00', hours: 4 }],
            totalHours: 4,
          },
          saturday: { enabled: false, timeSlots: [], totalHours: 0 },
          sunday: { enabled: false, timeSlots: [], totalHours: 0 },
        },
        start_date: '2025-01-01',
        status: 'active',
        priority: 1,
        notes: 'Asignación de prueba - Laborables',
      },
      {
        user_id: users[1]?.id || users[0].id,
        worker_id: workers[1]?.id || workers[0].id,
        assignment_type: 'festivos',
        weekly_hours: 10,
        schedule: {
          monday: { enabled: false, timeSlots: [], totalHours: 0 },
          tuesday: { enabled: false, timeSlots: [], totalHours: 0 },
          wednesday: { enabled: false, timeSlots: [], totalHours: 0 },
          thursday: { enabled: false, timeSlots: [], totalHours: 0 },
          friday: { enabled: false, timeSlots: [], totalHours: 0 },
          saturday: {
            enabled: true,
            timeSlots: [{ start: '09:00', end: '14:00', hours: 5 }],
            totalHours: 5,
          },
          sunday: {
            enabled: true,
            timeSlots: [{ start: '09:00', end: '14:00', hours: 5 }],
            totalHours: 5,
          },
        },
        start_date: '2025-01-01',
        status: 'active',
        priority: 1,
        notes: 'Asignación de prueba - Festivos',
      },
      {
        user_id: users[2]?.id || users[0].id,
        worker_id: workers[2]?.id || workers[0].id,
        assignment_type: 'flexible',
        weekly_hours: 30,
        schedule: {
          monday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '14:00', hours: 6 }],
            totalHours: 6,
          },
          tuesday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '14:00', hours: 6 }],
            totalHours: 6,
          },
          wednesday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '14:00', hours: 6 }],
            totalHours: 6,
          },
          thursday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '14:00', hours: 6 }],
            totalHours: 6,
          },
          friday: {
            enabled: true,
            timeSlots: [{ start: '08:00', end: '14:00', hours: 6 }],
            totalHours: 6,
          },
          saturday: {
            enabled: true,
            timeSlots: [{ start: '09:00', end: '15:00', hours: 6 }],
            totalHours: 6,
          },
          sunday: {
            enabled: true,
            timeSlots: [{ start: '09:00', end: '15:00', hours: 6 }],
            totalHours: 6,
          },
        },
        start_date: '2025-01-01',
        status: 'active',
        priority: 1,
        notes: 'Asignación de prueba - Flexible',
      },
    ];

    // 3. Insertar asignaciones de prueba
    for (const assignment of testAssignments) {
      const { data: insertData, error: insertError } = await supabase
        .from('assignments')
        .insert(assignment)
        .select();

      if (insertError) {
        console.log(
          `❌ Error insertando asignación ${assignment.assignment_type}:`,
          insertError
        );
      } else {
        console.log(
          `✅ Asignación ${assignment.assignment_type} creada:`,
          insertData[0].id
        );
      }
    }

    // 4. Verificar asignaciones creadas
    const { data: allAssignments, error: verifyError } = await supabase.from(
      'assignments'
    ).select(`
        *,
        user:users(name, surname),
        worker:workers(name, surname)
      `);

    if (verifyError) {
      console.error('❌ Error verificando asignaciones:', verifyError);
    } else {
      console.log(
        `📋 Total de asignaciones en la base de datos: ${allAssignments.length}`
      );
      allAssignments.forEach((assignment) => {
        console.log(
          `  - ${assignment.assignment_type}: ${assignment.weekly_hours}h/semana`
        );
        console.log(
          `    Usuario: ${assignment.user?.name} ${assignment.user?.surname}`
        );
        console.log(
          `    Trabajadora: ${assignment.worker?.name} ${assignment.worker?.surname}`
        );
      });
    }

    console.log('🎉 Asignaciones de prueba creadas!');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
createTestAssignments();
