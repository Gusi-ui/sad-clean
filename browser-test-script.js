/**
 * Script simplificado para probar notificaciones desde el navegador
 * Copia y pega TODO este código en la consola del navegador
 */

// Función para diagnosticar la base de datos
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
      if (testResult.status === 'OK') {
        console.log('   ✅ ' + testName + ': ' + testResult.status);
        if (testResult.data) {
          console.log('      Datos:', testResult.data);
        }
      } else {
        console.log('   ❌ ' + testName + ': ' + testResult.status);
        if (testResult.error) {
          console.log('      Error: ' + testResult.error);
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

// Función para probar notificación básica
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
      return true;
    } else {
      console.error('❌ Error enviando notificación:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return false;
  }
}

// Función para limpiar la sesión de Supabase
async function clearSupabaseSession() {
  console.log('🧹 Limpiando sesión de Supabase...');

  try {
    // Limpiar localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Limpiar cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    console.log('✅ Sesión limpiada. Recarga la página.');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando sesión:', error);
    return false;
  }
}

// Función para verificar estado de notificaciones
async function checkNotificationStatus(workerId) {
  console.log('📊 Verificando estado de notificaciones...');

  try {
    // Obtener notificaciones
    const notificationsResponse = await fetch(
      '/api/workers/' + workerId + '/notifications'
    );
    const notifications = await notificationsResponse.json();
    console.log('📋 Notificaciones:', notifications);

    // Obtener conteo de no leídas
    const unreadResponse = await fetch(
      '/api/workers/' + workerId + '/notifications/unread-count'
    );
    const unreadData = await unreadResponse.json();
    console.log('📊 Conteo de no leídas:', unreadData);

    return true;
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    return false;
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

  console.log('\n🧪 Paso 2: Enviar notificación de prueba');
  // Prueba básica
  const notificationSent = await testBasicNotification();

  if (!notificationSent) {
    console.log('❌ Error enviando notificación. Revisa los logs anteriores.');
    return;
  }

  // Esperar un poco
  await new Promise(function (resolve) {
    setTimeout(resolve, 1000);
  });

  console.log('\n📊 Paso 3: Verificar estado');
  // Verificar estado
  await checkNotificationStatus('test-worker-id');

  console.log('\n✅ Todas las pruebas completadas exitosamente!');
}

// Hacer las funciones disponibles globalmente
window.diagnoseDatabase = diagnoseDatabase;
window.testBasicNotification = testBasicNotification;
window.clearSupabaseSession = clearSupabaseSession;
window.checkNotificationStatus = checkNotificationStatus;
window.runAllTests = runAllTests;

console.log('🧪 Funciones de prueba cargadas exitosamente!');
console.log('📋 Funciones disponibles:');
console.log('   - diagnoseDatabase() - 🔍 Diagnosticar base de datos');
console.log('   - testBasicNotification() - 🧪 Probar notificación básica');
console.log('   - clearSupabaseSession() - 🧹 Limpiar sesión');
console.log('   - checkNotificationStatus(workerId) - 📊 Ver estado');
console.log('   - runAllTests() - 🚀 Ejecutar todas las pruebas');
console.log('');
console.log('💡 Recomendación: Ejecuta diagnoseDatabase() primero');
console.log('💡 Si hay errores de auth, ejecuta clearSupabaseSession()');

// Ejecutar diagnóstico automáticamente
console.log('\n🔍 Ejecutando diagnóstico automáticamente...');
diagnoseDatabase().then(function (success) {
  if (success) {
    console.log('\n✅ Diagnóstico exitoso! El sistema está listo.');
    console.log(
      '💡 Ahora puedes ejecutar runAllTests() para probar las notificaciones'
    );
  } else {
    console.log('\n❌ Diagnóstico fallido. Revisa los errores arriba.');
  }
});
