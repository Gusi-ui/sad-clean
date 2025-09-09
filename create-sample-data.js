// Script para crear datos de ejemplo y recuperar asignaciones
// Copia y pega todo el contenido en la consola del navegador

// Función para crear usuarios de ejemplo
const createSampleUsers = async () => {
  console.log('👤 CREANDO USUARIOS DE EJEMPLO...');

  const users = [
    {
      name: 'María López García',
      email: 'maria.lopez@email.com',
      phone: '612345678',
      address: 'Calle Mayor 123, Mataró',
      status: 'active',
    },
    {
      name: 'Juan García Ruiz',
      email: 'juan.garcia@email.com',
      phone: '623456789',
      address: 'Avenida Catalunya 45, Mataró',
      status: 'active',
    },
    {
      name: 'Ana Ruiz Martínez',
      email: 'ana.ruiz@email.com',
      phone: '634567890',
      address: 'Plaza España 7, Mataró',
      status: 'active',
    },
    {
      name: 'Pedro Sánchez López',
      email: 'pedro.sanchez@email.com',
      phone: '645678901',
      address: 'Rambla Nueva 15, Mataró',
      status: 'active',
    },
    {
      name: 'Carmen Martín Fernández',
      email: 'carmen.martin@email.com',
      phone: '656789012',
      address: 'Paseo Marítimo 25, Mataró',
      status: 'active',
    },
  ];

  const results = [];

  for (const user of users) {
    try {
      console.log(`📝 Creando usuario: ${user.name}...`);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Usuario creado: ${user.name} (ID: ${data.user?.id})`);
        results.push({ user, success: true, data });
      } else {
        const error = await response.text();
        console.log(`❌ Error creando ${user.name}: ${error}`);
        results.push({ user, success: false, error });
      }
    } catch (error) {
      console.log(`❌ Error de red creando ${user.name}: ${error.message}`);
      results.push({ user, success: false, error: error.message });
    }
  }

  console.log('\n📊 RESUMEN DE CREACIÓN DE USUARIOS:');
  console.log(`✅ Exitosos: ${results.filter((r) => r.success).length}`);
  console.log(`❌ Fallidos: ${results.filter((r) => !r.success).length}`);

  return results.filter((r) => r.success);
};

// Función para crear asignaciones
const createSampleAssignments = async (successfulUsers) => {
  console.log('\n📋 CREANDO ASIGNACIONES DE EJEMPLO...');

  if (!successfulUsers || successfulUsers.length === 0) {
    console.log('❌ No hay usuarios para asignar');
    return;
  }

  // Obtener workers disponibles
  let workers = [];
  try {
    const workersResponse = await fetch('/api/workers');
    const workersData = await workersResponse.json();
    workers = workersData.workers || [];
  } catch (error) {
    console.log('❌ Error obteniendo workers:', error.message);
    return;
  }

  if (workers.length === 0) {
    console.log('❌ No hay workers disponibles');
    return;
  }

  console.log(`👥 Workers disponibles: ${workers.length}`);
  console.log(`👤 Usuarios para asignar: ${successfulUsers.length}`);

  const assignments = [];
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const endOfYear = '2024-12-31';

  // Asignar usuarios a workers
  for (let i = 0; i < Math.min(successfulUsers.length, workers.length); i++) {
    const user = successfulUsers[i];
    const worker = workers[i % workers.length]; // Distribuir entre workers disponibles

    const assignment = {
      user_id: user.data.user.id,
      worker_id: worker.id,
      assignment_type: 'laborables',
      weekly_hours: 20 + Math.floor(Math.random() * 20), // 20-40 horas semanales
      schedule: {
        monday: {
          slots: [
            { start: '08:00', end: '10:00' },
            { start: '13:00', end: '15:00' },
          ],
          totalHours: 4.0,
        },
        tuesday: {
          slots: [
            { start: '08:00', end: '10:00' },
            { start: '13:00', end: '15:00' },
          ],
          totalHours: 4.0,
        },
        wednesday: {
          slots: [
            { start: '08:00', end: '10:00' },
            { start: '13:00', end: '15:00' },
          ],
          totalHours: 4.0,
        },
        thursday: {
          slots: [
            { start: '08:00', end: '10:00' },
            { start: '13:00', end: '15:00' },
          ],
          totalHours: 4.0,
        },
        friday: {
          slots: [
            { start: '08:00', end: '10:00' },
            { start: '13:00', end: '15:00' },
          ],
          totalHours: 4.0,
        },
        saturday: {
          slots: [],
          totalHours: 0,
        },
        sunday: {
          slots: [],
          totalHours: 0,
        },
      },
      start_date: now,
      end_date: endOfYear,
      status: 'active',
    };

    try {
      console.log(
        `📝 Creando asignación: ${user.user.name} → ${worker.name} ${worker.surname}...`
      );

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Asignación creada: ${user.user.name} → ${worker.name}`);
        assignments.push({ assignment, success: true, data });
      } else {
        const error = await response.text();
        console.log(`❌ Error en asignación ${user.user.name}: ${error}`);
        assignments.push({ assignment, success: false, error });
      }
    } catch (error) {
      console.log(
        `❌ Error de red en asignación ${user.user.name}: ${error.message}`
      );
      assignments.push({ assignment, success: false, error: error.message });
    }
  }

  console.log('\n📊 RESUMEN DE CREACIÓN DE ASIGNACIONES:');
  console.log(`✅ Exitosas: ${assignments.filter((a) => a.success).length}`);
  console.log(`❌ Fallidas: ${assignments.filter((a) => !a.success).length}`);

  return assignments;
};

// Función principal
const recoverAllData = async () => {
  console.log('🚀 INICIANDO RECUPERACIÓN COMPLETA DE DATOS');
  console.log('============================================');

  try {
    // Paso 1: Crear usuarios
    console.log('\n👤 PASO 1: Creando usuarios de ejemplo...');
    const successfulUsers = await createSampleUsers();

    // Paso 2: Crear asignaciones
    console.log('\n📋 PASO 2: Creando asignaciones...');
    const successfulAssignments =
      await createSampleAssignments(successfulUsers);

    // Paso 3: Verificación final
    console.log('\n✅ PASO 3: Verificación final...');
    console.log('\n🎉 RECUPERACIÓN COMPLETADA!');
    console.log('============================');
    console.log(`👤 Usuarios creados: ${successfulUsers.length}`);
    console.log(
      `📋 Asignaciones creadas: ${successfulAssignments.filter((a) => a.success).length}`
    );
    console.log('');
    console.log('💡 PRÓXIMOS PASOS:');
    console.log('1. Ve a /users para ver los usuarios creados');
    console.log('2. Ve a /assignments para ver las asignaciones');
    console.log('3. Ve a /worker-dashboard para verificar las notificaciones');
    console.log('4. Ajusta los horarios y datos según necesites');
  } catch (error) {
    console.error('❌ Error en recuperación:', error);
  }
};

// Exponer funciones globales
window.createSampleUsers = createSampleUsers;
window.createSampleAssignments = createSampleAssignments;
window.recoverAllData = recoverAllData;

console.log('🚀 FUNCIONES DISPONIBLES:');
console.log('========================');
console.log('recoverAllData()     - Recuperación completa automática');
console.log('createSampleUsers()  - Solo crear usuarios de ejemplo');
console.log(
  'createSampleAssignments(successfulUsers) - Solo crear asignaciones'
);
console.log('');
console.log(
  '💡 RECOMENDACIÓN: Ejecuta recoverAllData() para recuperación completa'
);
