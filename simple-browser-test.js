// COPIA Y PEGA TODO ESTE CÓDIGO EN LA CONSOLA DEL NAVEGADOR

// Función para diagnosticar la base de datos
async function diagnoseDatabase() {
  console.log('🔍 Diagnosticando base de datos...');
  try {
    const response = await fetch('/api/diagnose');
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status);
      return false;
    }
    const result = await response.json();
    console.log('📋 Resultados:');
    console.log('🔧 Supabase URL:', result.supabase?.url || 'No configurada');
    console.log('🔧 Supabase Key:', result.supabase?.key || 'No configurada');

    Object.entries(result.tests || {}).forEach(function (entry) {
      var testName = entry[0];
      var testResult = entry[1];
      if (testResult.status === 'OK') {
        console.log('✅ ' + testName + ': OK');
      } else {
        console.log('❌ ' + testName + ': ERROR -', testResult.error);
      }
    });

    return (
      result.tests?.connection?.status === 'OK' &&
      result.tests?.worker_notifications?.status === 'OK'
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Función para obtener workers disponibles
async function getAvailableWorkers() {
  console.log('👥 Obteniendo lista de workers...');
  try {
    const response = await fetch('/api/workers');
    if (!response.ok) {
      console.log(
        '⚠️ No se pudo obtener lista de workers, usando ID de prueba'
      );
      return ['ac958cab-ae08-4a8f-a95f-b34fa0d7e940'];
    }
    const result = await response.json();
    console.log('📋 Workers encontrados:', result.workers?.length || 0);

    if (result.isTestData) {
      console.log('📝 Usando datos de prueba (no hay workers reales en la BD)');
    }

    const workerIds = result.workers?.map(function (w) {
      return w.id;
    }) || ['ac958cab-ae08-4a8f-a95f-b34fa0d7e940'];

    // Mostrar lista de workers disponibles
    if (result.workers && result.workers.length > 0) {
      console.log('👥 Workers disponibles:');
      result.workers.forEach(function (worker, index) {
        console.log(
          '  ' +
            (index + 1) +
            '. ' +
            worker.name +
            ' ' +
            worker.surname +
            ' (' +
            worker.id +
            ')'
        );
      });
    }

    return workerIds;
  } catch (error) {
    console.log('⚠️ Error obteniendo workers, usando ID de prueba');
    return ['test-worker-1'];
  }
}

// Función para probar notificación básica
async function testBasicNotification(workerId) {
  if (!workerId) {
    const workers = await getAvailableWorkers();
    workerId = workers[0] || 'ac958cab-ae08-4a8f-a95f-b34fa0d7e940';
  }

  console.log('🧪 Probando notificación para worker:', workerId);
  try {
    const response = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '🧪 Notificación de Prueba',
        body:
          'Esta es una notificación de prueba desde el navegador - ' +
          new Date().toLocaleTimeString(),
        type: 'system_message',
      }),
    });
    const result = await response.json();
    console.log('📋 Resultado:', result);
    return response.ok && result.success;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Función para probar notificación de cambio de asignación
async function testAssignmentNotification(workerId, oldHours, newHours) {
  if (!workerId) {
    const workers = await getAvailableWorkers();
    workerId = workers[0] || 'ac958cab-ae08-4a8f-a95f-b34fa0d7e940';
  }

  oldHours = oldHours || 30;
  newHours = newHours || 35;

  console.log('📋 Probando notificación de cambio de asignación...');
  try {
    const response = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '📋 Asignación modificada',
        body:
          'Tus horas semanales han sido aumentado de ' +
          oldHours +
          'h a ' +
          newHours +
          'h',
        type: 'assignment_change',
        priority: 'high',
      }),
    });
    const result = await response.json();
    console.log('📋 Resultado:', result);
    return response.ok && result.success;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Función para verificar estado de notificaciones
async function checkNotificationStatus(workerId) {
  if (!workerId) {
    const workers = await getAvailableWorkers();
    workerId = workers[0] || 'ac958cab-ae08-4a8f-a95f-b34fa0d7e940';
  }

  console.log('📊 Verificando estado de notificaciones para:', workerId);
  try {
    const notificationsResponse = await fetch(
      '/api/workers/' + workerId + '/notifications'
    );
    const unreadResponse = await fetch(
      '/api/workers/' + workerId + '/notifications/unread-count'
    );

    const notifications = await notificationsResponse.json();
    const unreadData = await unreadResponse.json();

    console.log(
      '📋 Total de notificaciones:',
      notifications.notifications?.length || 0
    );
    console.log('📊 No leídas:', unreadData.unread_count || 0);

    return true;
  } catch (error) {
    console.error('❌ Error verificando estado:', error.message);
    return false;
  }
}

// Función principal
async function runAllTests() {
  console.log('🚀 Iniciando pruebas completas...');

  const diagnosisOK = await diagnoseDatabase();
  if (!diagnosisOK) {
    console.log('❌ Diagnóstico fallido');
    return;
  }

  console.log('\n✅ Diagnóstico OK');

  const workers = await getAvailableWorkers();
  const workerId = workers[0];

  console.log('\n🧪 Paso 1: Probando notificación básica');
  const notificationOK = await testBasicNotification(workerId);
  if (notificationOK) {
    console.log('✅ Notificación básica enviada correctamente');
  } else {
    console.log('❌ Error enviando notificación básica');
    return;
  }

  // Esperar un poco
  await new Promise(function (resolve) {
    setTimeout(resolve, 2000);
  });

  console.log('\n📋 Paso 2: Probando notificación de asignación');
  const assignmentOK = await testAssignmentNotification(workerId, 30, 35);
  if (assignmentOK) {
    console.log('✅ Notificación de asignación enviada correctamente');
  } else {
    console.log('❌ Error enviando notificación de asignación');
  }

  // Esperar un poco
  await new Promise(function (resolve) {
    setTimeout(resolve, 2000);
  });

  console.log('\n📊 Paso 3: Verificando estado');
  await checkNotificationStatus(workerId);

  console.log('\n🎉 Todas las pruebas completadas!');
  console.log(
    '💡 Ahora ve al dashboard de trabajadoras para ver las notificaciones'
  );
}

// Hacer funciones globales
window.diagnoseDatabase = diagnoseDatabase;
window.testBasicNotification = testBasicNotification;
window.testAssignmentNotification = testAssignmentNotification;
window.checkNotificationStatus = checkNotificationStatus;
window.getAvailableWorkers = getAvailableWorkers;
window.runAllTests = runAllTests;

console.log('🧪 Script cargado! Funciones disponibles:');
console.log('- diagnoseDatabase() - 🔍 Diagnosticar base de datos');
console.log(
  '- testBasicNotification(workerId) - 🧪 Probar notificación básica'
);
console.log(
  '- testAssignmentNotification(workerId, oldHours, newHours) - 📋 Probar cambio de asignación'
);
console.log(
  '- checkNotificationStatus(workerId) - 📊 Ver estado de notificaciones'
);
console.log('- getAvailableWorkers() - 👥 Obtener lista de workers');
console.log('- runAllTests() - 🚀 Ejecutar todas las pruebas');
console.log('- quickNotificationTest() - ⚡ Prueba rápida de notificaciones');
console.log('');
console.log(
  '💡 Recomendación: Ejecuta quickNotificationTest() para una prueba rápida'
);
console.log('💡 O runAllTests() para probar todo el flujo completo');

// Función de prueba rápida actualizada
async function quickNotificationTest() {
  console.log('🚀 Ejecutando prueba rápida de notificaciones...');

  try {
    const response = await fetch('/api/workers');
    const result = await response.json();

    if (!result.workers || result.workers.length === 0) {
      console.log('❌ No hay workers disponibles');
      return;
    }

    const workerId = result.workers[0].id;
    console.log(
      `👤 Usando worker: ${result.workers[0].name} ${result.workers[0].surname} (${workerId})`
    );

    const notificationResponse = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '🧪 Prueba desde Consola',
        body:
          'Notificación enviada desde navegador - ' +
          new Date().toLocaleTimeString(),
        type: 'system_message',
      }),
    });

    const notificationResult = await notificationResponse.json();

    if (notificationResponse.ok && notificationResult.success) {
      console.log('✅ ¡Notificación enviada exitosamente!');
      console.log(
        '💡 Ve al dashboard de trabajadores para ver la notificación'
      );
    } else {
      console.log('❌ Error:', notificationResult.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Hacer función global
window.quickNotificationTest = quickNotificationTest;

// Ejecutar diagnóstico automáticamente
diagnoseDatabase();
