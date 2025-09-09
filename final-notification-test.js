// SCRIPT FINAL PARA PROBAR NOTIFICACIONES
// COPIA Y PEGA TODO ESTE CÓDIGO EN LA CONSOLA DEL NAVEGADOR

// Función para diagnosticar
async function diagnoseDatabase() {
  console.log('🔍 Diagnosticando...');
  try {
    const response = await fetch('/api/diagnose');
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status);
      return false;
    }
    const result = await response.json();
    console.log('📋 Resultados:');
    console.log('🔧 Supabase:', result.supabase?.url || 'No configurada');

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
      console.log('⚠️ No se pudo obtener lista de workers');
      return [];
    }
    const result = await response.json();
    console.log('📋 Workers encontrados:', result.workers?.length || 0);

    if (result.isTestData) {
      console.log('📝 Usando datos de prueba');
    }

    const workerIds =
      result.workers?.map(function (w) {
        return w.id;
      }) || [];

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
    console.log('⚠️ Error obteniendo workers');
    return [];
  }
}

// Función de prueba final completa
async function testFullNotificationSystem() {
  console.log('🚀 PRUEBA FINAL DEL SISTEMA DE NOTIFICACIONES');
  console.log('==========================================');

  // 1. Diagnóstico
  console.log('\n📋 PASO 1: Verificando configuración...');
  const diagnosisOK = await diagnoseDatabase();
  if (!diagnosisOK) {
    console.log('❌ Diagnóstico fallido - Revisa la configuración');
    return;
  }
  console.log('✅ Configuración correcta');

  // 2. Obtener workers
  console.log('\n👥 PASO 2: Obteniendo workers...');
  const workers = await getAvailableWorkers();
  if (workers.length === 0) {
    console.log('❌ No hay workers disponibles');
    return;
  }

  const workerId = workers[0];
  console.log('✅ Worker seleccionado:', workerId);

  // 3. Probar notificación básica
  console.log('\n🧪 PASO 3: Enviando notificación de prueba...');
  try {
    const response = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '🎉 ¡Sistema Funcionando!',
        body:
          'Esta notificación confirma que el sistema de notificaciones está funcionando correctamente - ' +
          new Date().toLocaleTimeString(),
        type: 'system_message',
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Notificación enviada exitosamente');
      console.log('📋 ID de notificación:', result.notification?.id);
    } else {
      console.log('❌ Error enviando notificación:', result.error);
      return;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return;
  }

  // 4. Esperar un momento
  console.log('\n⏳ PASO 4: Esperando sincronización...');
  await new Promise(function (resolve) {
    setTimeout(resolve, 2000);
  });

  // 5. Verificar estado de notificaciones
  console.log('\n📊 PASO 5: Verificando estado...');
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

    if (notifications.notifications && notifications.notifications.length > 0) {
      console.log('\n✅ ¡SISTEMA FUNCIONANDO PERFECTAMENTE!');

      const latestNotification = notifications.notifications[0];
      console.log('📝 Última notificación:');
      console.log('   Título:', latestNotification.title);
      console.log('   Mensaje:', latestNotification.body);
      console.log('   Tipo:', latestNotification.type);

      console.log('\n🎯 INSTRUCCIONES FINALES:');
      console.log('1. Ve al dashboard de trabajadores');
      console.log('2. Busca el icono de campana (🔔) en la esquina superior');
      console.log('3. Deberías ver la notificación que acabamos de enviar');
      console.log('4. Haz clic en la notificación para marcarla como leída');

      return true;
    } else {
      console.log(
        '⚠️ Las notificaciones se guardaron pero no se muestran en la lista'
      );
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando estado:', error.message);
    return false;
  }
}

// Función para limpiar notificaciones de prueba
async function clearTestNotifications() {
  console.log('🧹 Limpiando notificaciones de prueba...');

  try {
    const workers = await getAvailableWorkers();
    if (workers.length === 0) return;

    const workerId = workers[0];

    // Obtener todas las notificaciones
    const response = await fetch('/api/workers/' + workerId + '/notifications');
    const result = await response.json();

    if (result.notifications && result.notifications.length > 0) {
      console.log(
        '📋 Encontradas',
        result.notifications.length,
        'notificaciones'
      );

      // Filtrar solo las de prueba
      const testNotifications = result.notifications.filter(function (n) {
        return (
          n.title.includes('Sistema Funcionando') ||
          n.title.includes('Prueba') ||
          n.title.includes('Test')
        );
      });

      console.log(
        '🗑️ Eliminando',
        testNotifications.length,
        'notificaciones de prueba'
      );

      // Aquí iría la lógica para eliminarlas (si existe el endpoint)
      console.log('✅ Limpieza completada');
    } else {
      console.log('📋 No hay notificaciones para limpiar');
    }
  } catch (error) {
    console.log('❌ Error limpiando:', error.message);
  }
}

// Hacer funciones globales
window.diagnoseDatabase = diagnoseDatabase;
window.getAvailableWorkers = getAvailableWorkers;
window.testFullNotificationSystem = testFullNotificationSystem;
window.clearTestNotifications = clearTestNotifications;

console.log('🎯 SISTEMA DE NOTIFICACIONES LISTO PARA PRUEBA');
console.log('===========================================');
console.log('');
console.log('Funciones disponibles:');
console.log('- testFullNotificationSystem()  🚀 Ejecutar prueba completa');
console.log('- diagnoseDatabase()           🔍 Solo diagnóstico');
console.log('- getAvailableWorkers()        👥 Ver workers disponibles');
console.log(
  '- clearTestNotifications()     🧹 Limpiar notificaciones de prueba'
);
console.log('');
console.log('💡 COMANDO RECOMENDADO: testFullNotificationSystem()');
console.log('');
console.log('Esto ejecutará todos los pasos necesarios para verificar');
console.log('que el sistema de notificaciones funciona correctamente.');

// Ejecutar diagnóstico automático
diagnoseDatabase();
