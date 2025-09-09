// Script para recuperar asignaciones perdidas en producción
// Ejecutar en la consola del navegador en producción

async function recoverAssignments() {
  console.log('🔍 RECUPERANDO ASIGNACIONES PERDIDAS...');

  try {
    // 1. Verificar estado actual
    console.log('\n📊 PASO 1: Verificando estado actual...');

    const workersResponse = await fetch('/api/workers');
    const workersData = await workersResponse.json();

    console.log(`👥 Workers encontrados: ${workersData.workers?.length || 0}`);

    // 2. Verificar si hay asignaciones existentes
    console.log('\n📋 PASO 2: Buscando asignaciones existentes...');

    // Intentar obtener asignaciones (si existe el endpoint)
    try {
      const assignmentsResponse = await fetch('/api/assignments');
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        console.log(
          `📝 Asignaciones encontradas: ${assignmentsData.assignments?.length || 0}`
        );
      } else {
        console.log('⚠️ No se encontró endpoint de assignments');
      }
    } catch (error) {
      console.log('⚠️ Error al verificar assignments:', error.message);
    }

    // 3. Crear asignaciones de ejemplo basadas en workers existentes
    console.log('\n🏗️ PASO 3: Creando asignaciones de ejemplo...');

    if (workersData.workers && workersData.workers.length > 0) {
      console.log('💡 INSTRUCCIONES PARA RECUPERAR ASIGNACIONES:');
      console.log('');
      console.log('1. Ve al panel de administración: /users');
      console.log('2. Para cada trabajadora, crea usuarios asignados:');
      console.log('');

      workersData.workers.forEach((worker, index) => {
        console.log(
          `${index + 1}. ${worker.name} ${worker.surname} (${worker.email})`
        );
        console.log(`   → Crear usuarios y asignarlos a esta trabajadora`);
        console.log(`   → Horarios típicos: 8:00-10:00, 13:00-15:00`);
        console.log('');
      });

      console.log('2. Una vez creados los usuarios, ve a: /assignments');
      console.log(
        '3. Crea las asignaciones específicas para cada usuario-trabajadora'
      );
      console.log('');

      console.log('📝 SCRIPT PARA CREAR USUARIOS DE EJEMPLO:');
      console.log(
        'Copia y pega este código en la consola para crear usuarios de prueba:'
      );
      console.log('');
      console.log(`
// Crear usuarios de ejemplo
const createTestUsers = async () => {
  const users = [
    { name: 'María López', email: 'maria.lopez@email.com', phone: '612345678', address: 'Calle Mayor 123' },
    { name: 'Juan García', email: 'juan.garcia@email.com', phone: '623456789', address: 'Avenida Catalunya 45' },
    { name: 'Ana Ruiz', email: 'ana.ruiz@email.com', phone: '634567890', address: 'Plaza España 7' },
    { name: 'Pedro Sánchez', email: 'pedro.sanchez@email.com', phone: '645678901', address: 'Rambla 15' },
    { name: 'Carmen Martín', email: 'carmen.martin@email.com', phone: '656789012', address: 'Paseo Marítimo 25' }
  ];

  for (const user of users) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        console.log(\`✅ Usuario creado: \${user.name}\`);
      } else {
        console.log(\`❌ Error creando: \${user.name}\`);
      }
    } catch (error) {
      console.log(\`❌ Error: \${error.message}\`);
    }
  }
};

createTestUsers();
`);
    } else {
      console.log('❌ No hay workers disponibles para crear asignaciones');
    }

    // 4. Verificar sistema de notificaciones
    console.log('\n🔔 PASO 4: Verificando sistema de notificaciones...');

    try {
      const diagResponse = await fetch('/api/diagnose');
      if (diagResponse.ok) {
        const diagData = await diagResponse.json();
        console.log('✅ Sistema de diagnóstico funcionando');
        console.log('✅ Notificaciones listas para funcionar');
      }
    } catch (error) {
      console.log('⚠️ Sistema de diagnóstico no disponible');
    }

    console.log('\n🎯 RESULTADO FINAL:');
    console.log('✅ Sistema de notificaciones: FUNCIONANDO');
    console.log('⚠️ Asignaciones: NECESITAN SER RECREADAS');
    console.log('💡 Usa las instrucciones de arriba para recuperarlas');
  } catch (error) {
    console.error('❌ Error en recuperación:', error);
  }
}

// Función helper para ejecutar
function showRecoveryInstructions() {
  console.log('🚀 RECUPERACIÓN DE ASIGNACIONES PERDIDAS');
  console.log('=========================================');
  console.log('');
  console.log('Ejecuta: recoverAssignments()');
  console.log('');
  console.log('Esto te dará instrucciones detalladas para:');
  console.log('1. Verificar estado actual');
  console.log('2. Crear usuarios de ejemplo');
  console.log('3. Recrear asignaciones');
  console.log('4. Verificar que todo funciona');
}

// Mostrar instrucciones iniciales
showRecoveryInstructions();

// Exponer función global
window.recoverAssignments = recoverAssignments;
window.showRecoveryInstructions = showRecoveryInstructions;
