/**
 * Script para probar notificaciones desde el navegador
 * Copia y pega este código en la consola del navegador cuando estés en:
 * 1. La página de assignments (/assignments)
 * 2. La página de prueba de notificaciones (/test-notifications)
 * 3. El dashboard de trabajadoras (/worker-dashboard)
 */

// Función para probar notificaciones básicas
async function testBasicNotification() {
  console.log('🧪 Probando notificación básica...');

  try {
    const response = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workerId: 'test-worker-id',
        title: '🧪 Notificación de Prueba',
        body: 'Esta es una notificación de prueba desde el navegador',
        type: 'system_message',
      }),
    });

    const result = await response.json();
    console.log('📋 Resultado:', result);

    if (response.ok && result.success) {
      console.log('✅ Notificación enviada exitosamente');
    } else {
      console.error('❌ Error enviando notificación:', result.error);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Función para probar notificación de cambio de asignación
async function testAssignmentNotification(workerId, oldHours, newHours) {
  console.log('📋 Probando notificación de cambio de asignación...');

  try {
    const response = await fetch(
      '/api/workers/' + workerId + '/notifications',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '📋 Asignación modificada',
          body: `Tus horas semanales han sido ${newHours > oldHours ? 'aumentado' : 'reducido'} de ${oldHours}h a ${newHours}h`,
          type: 'assignment_change',
          priority: 'high',
          data: {
            oldHours,
            newHours,
            difference: Math.abs(newHours - oldHours),
            changeType: newHours > oldHours ? 'aumentado' : 'reducido',
          },
        }),
      }
    );

    const result = await response.json();
    console.log('📋 Resultado:', result);

    if (response.ok) {
      console.log('✅ Notificación de asignación enviada exitosamente');
    } else {
      console.error(
        '❌ Error enviando notificación de asignación:',
        result.error
      );
    }
  } catch (error) {
    console.error('❌ Error en la prueba de asignación:', error);
  }
}

// Función para probar la recepción de notificaciones en tiempo real
function testRealtimeNotifications() {
  console.log('🔄 Probando recepción de notificaciones en tiempo real...');

  // Esta función debe ejecutarse desde la página del worker dashboard
  // donde el hook useNotifications está activo
  console.log(
    '💡 Asegúrate de estar en /worker-dashboard para probar tiempo real'
  );
  console.log(
    '💡 Las notificaciones deberían aparecer automáticamente en el NotificationCenter'
  );
}

// Función para verificar estado de notificaciones
async function checkNotificationStatus(workerId) {
  console.log('📊 Verificando estado de notificaciones...');

  try {
    // Obtener notificaciones
    const notificationsResponse = await fetch(
      `/api/workers/${workerId}/notifications`
    );
    const notifications = await notificationsResponse.json();
    console.log('📋 Notificaciones:', notifications);

    // Obtener conteo de no leídas
    const unreadResponse = await fetch(
      `/api/workers/${workerId}/notifications/unread-count`
    );
    const unreadData = await unreadResponse.json();
    console.log('📊 Conteo de no leídas:', unreadData);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas completas de notificaciones...\n');

  // Ejecutar diagnóstico primero
  console.log('🔍 Paso 1: Diagnóstico de base de datos');
  const diagnosisOK = await diagnoseDatabase();

  if (!diagnosisOK) {
    console.log(
      '❌ Diagnóstico fallido. Corrige los problemas antes de continuar.'
    );
    console.log('💡 Posibles soluciones:');
    console.log('   - Verifica las variables de entorno de Supabase');
    console.log('   - Asegúrate de que las tablas existan en la base de datos');
    console.log('   - Revisa las políticas RLS');
    return;
  }

  console.log('\n🔗 Paso 2: Verificar conectividad');
  // Verificar conectividad
  const isConnected = await testSupabaseConnection();
  if (!isConnected) {
    console.log('❌ No hay conectividad. Revisa la configuración de Supabase.');
    return;
  }

  console.log('\n🧪 Paso 3: Enviar notificación de prueba');
  // Prueba básica
  await testBasicNotification();

  // Esperar un poco
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('\n📊 Paso 4: Verificar estado');
  // Verificar estado
  await checkNotificationStatus('test-worker-id');

  // Instrucciones para pruebas manuales
  console.log('\n📝 INSTRUCCIONES PARA PRUEBAS MANUALES:');
  console.log('1. Ve a /test-notifications para usar la interfaz gráfica');
  console.log('2. Ve a /assignments y modifica una asignación');
  console.log(
    '3. Ve a /worker-dashboard y verifica si llegan las notificaciones'
  );
  console.log('4. Revisa la consola del navegador para logs de debug');
}

// Función para limpiar la sesión de Supabase (útil para errores de autenticación)
async function clearSupabaseSession() {
  console.log('🧹 Limpiando sesión de Supabase...');

  try {
    // Limpiar localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Limpiar cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    console.log('✅ Sesión limpiada. Recarga la página.');
  } catch (error) {
    console.error('❌ Error limpiando sesión:', error);
  }
}

// Función para probar la conectividad básica
async function testSupabaseConnection() {
  console.log('🔗 Probando conectividad con Supabase...');

  try {
    const response = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: 'connection-test',
        title: 'Test de Conectividad',
        body: 'Verificando conexión básica',
        type: 'system_message',
      }),
    });

    if (response.ok) {
      console.log('✅ Conexión con Supabase OK');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Error de conexión:', response.status, error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return false;
  }
}

// Hacer las funciones disponibles globalmente
window.testBasicNotification = testBasicNotification;
window.testAssignmentNotification = testAssignmentNotification;
window.testRealtimeNotifications = testRealtimeNotifications;
window.checkNotificationStatus = checkNotificationStatus;
window.clearSupabaseSession = clearSupabaseSession;
window.testSupabaseConnection = testSupabaseConnection;
window.runAllTests = runAllTests;

// Nueva función para diagnosticar la base de datos
async function diagnoseDatabase() {
  console.log('🔍 Ejecutando diagnóstico de base de datos...');

  try {
    const response = await fetch('/api/diagnose');

    if (!response.ok) {
      console.error('❌ Error en diagnóstico:', response.status);
      return false;
    }

    const result = await response.json();
    console.log('📋 Resultados del diagnóstico:');

    // Mostrar configuración de Supabase
    console.log('🔧 Configuración Supabase:');
    console.log(
      '   URL:',
      result.supabase && result.supabase.url
        ? result.supabase.url
        : 'No configurada'
    );
    console.log(
      '   Key:',
      result.supabase && result.supabase.key
        ? result.supabase.key
        : 'No configurada'
    );

    // Mostrar resultados de tests
    console.log('🧪 Tests realizados:');
    Object.entries(result.tests || {}).forEach(function (entry) {
      var testName = entry[0];
      var testResult = entry[1];
      var test = testResult; // { status: string; error?: string; data?: unknown }
      if (test.status === 'OK') {
        console.log('   ✅ ' + testName + ': ' + test.status);
        if (test.data) {
          console.log('      Datos:', test.data);
        }
      } else {
        console.log('   ❌ ' + testName + ': ' + test.status);
        if (test.error) {
          console.log('      Error: ' + test.error);
        }
      }
    });

    var tests = result.tests || {};
    return (
      tests.connection &&
      tests.connection.status === 'OK' &&
      tests.worker_notifications &&
      tests.worker_notifications.status === 'OK'
    );
  } catch (error) {
    console.error('❌ Error ejecutando diagnóstico:', error);
    return false;
  }
}

window.diagnoseDatabase = diagnoseDatabase;

console.log('🧪 Funciones de prueba de notificaciones cargadas:');
console.log('- testBasicNotification() - Prueba básica');
console.log(
  '- testAssignmentNotification(workerId, oldHours, newHours) - Prueba de asignación'
);
console.log('- testRealtimeNotifications() - Prueba tiempo real');
console.log('- checkNotificationStatus(workerId) - Verificar estado');
console.log(
  '- clearSupabaseSession() - Limpiar sesión (útil para errores de auth)'
);
console.log('- testSupabaseConnection() - Verificar conectividad básica');
console.log(
  '- diagnoseDatabase() - 🔍 DIAGNOSTICAR base de datos (recomendado primero)'
);
console.log('- runAllTests() - Ejecutar todas las pruebas');
console.log(
  '\n💡 Ejecuta diagnoseDatabase() primero para verificar la configuración'
);
console.log(
  '💡 Luego ejecuta runAllTests() para iniciar todas las pruebas automáticamente'
);
console.log(
  '🚨 Si hay errores de "Invalid Refresh Token", ejecuta clearSupabaseSession() primero'
);
