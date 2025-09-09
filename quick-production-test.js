// ============================================================================
// PRUEBA RÁPIDA DE PRODUCCIÓN - SISTEMA DE NOTIFICACIONES
// ============================================================================
// Copia y pega este código en la consola del navegador de producción
// ============================================================================

async function quickProductionTest() {
  console.log('🚀 INICIANDO PRUEBA RÁPIDA DE PRODUCCIÓN');
  console.log('========================================');

  try {
    // 1. Verificar workers
    console.log('\n👥 PASO 1: Verificando workers...');
    const workersResponse = await fetch('/api/workers');
    const workersData = await workersResponse.json();

    if (!workersData.workers || workersData.workers.length === 0) {
      console.log('❌ ERROR: No hay workers disponibles');
      return { success: false, step: 'workers' };
    }

    console.log(`✅ Workers OK: ${workersData.workers.length} encontrados`);
    const workerId = workersData.workers[0].id;
    const workerName = `${workersData.workers[0].name} ${workersData.workers[0].surname}`;

    // 2. Verificar Supabase
    console.log('\n🔧 PASO 2: Verificando conexión Supabase...');
    const diagResponse = await fetch('/api/diagnose');
    const diagData = await diagResponse.json();

    const supabaseOk =
      diagData.tests?.connection?.status === 'OK' &&
      diagData.tests?.worker_notifications?.status === 'OK';

    if (!supabaseOk) {
      console.log('❌ ERROR: Problemas con Supabase');
      return { success: false, step: 'supabase' };
    }
    console.log('✅ Supabase OK: Conexión estable');

    // 3. Enviar notificación de prueba
    console.log('\n🧪 PASO 3: Enviando notificación de prueba...');
    const testTitle = '🚀 Prueba de Producción Exitosa';
    const testBody = `Sistema funcionando correctamente en producción para ${workerName}`;

    const notifResponse = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: testTitle,
        body: testBody,
        type: 'system_message',
      }),
    });

    const notifData = await notifResponse.json();

    if (!notifResponse.ok || !notifData.success) {
      console.log('❌ ERROR: No se pudo enviar notificación');
      console.log('Detalles:', notifData.error);
      return { success: false, step: 'notification' };
    }

    console.log('✅ Notificación enviada OK');
    console.log(`📋 ID: ${notifData.notification?.id}`);

    // 4. Verificar recepción (esperar 2 segundos)
    console.log('\n📊 PASO 4: Verificando recepción...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const notifsResponse = await fetch(
      `/api/workers/${workerId}/notifications`
    );
    const notifsData = await notifsResponse.json();

    const receivedNotifications = notifsData.notifications?.length || 0;
    console.log(`📊 Notificaciones en sistema: ${receivedNotifications}`);

    // 5. Verificar contador no leídas
    const unreadResponse = await fetch(
      `/api/workers/${workerId}/notifications/unread-count`
    );
    const unreadData = await unreadResponse.json();
    const unreadCount = unreadData.unread_count || 0;
    console.log(`📊 Notificaciones no leídas: ${unreadCount}`);

    // RESULTADO FINAL
    const success =
      workersData.workers.length > 0 &&
      supabaseOk &&
      notifData.success &&
      receivedNotifications > 0;

    console.log('\n🎉 RESULTADO FINAL DE PRODUCCIÓN:');
    console.log('===================================');

    if (success) {
      console.log('✅ ¡PRODUCCIÓN FUNCIONANDO PERFECTAMENTE!');
      console.log('');
      console.log('📋 VERIFICACIÓN COMPLETA:');
      console.log('========================');
      console.log(`✅ ${workersData.workers.length} workers disponibles`);
      console.log('✅ Conexión Supabase correcta');
      console.log('✅ Notificaciones enviándose');
      console.log(`✅ ${receivedNotifications} notificaciones en sistema`);
      console.log(`✅ ${unreadCount} notificaciones no leídas`);
      console.log('');
      console.log('🚀 ¡TU SISTEMA ESTÁ LISTO PARA PRODUCCIÓN!');
      console.log('');
      console.log('💡 PRÓXIMOS PASOS:');
      console.log('==================');
      console.log('1. Ve al dashboard de trabajadores');
      console.log('2. Busca el icono de campana (🔔)');
      console.log('3. Deberías ver la notificación de prueba');
      console.log('4. ¡El sistema está funcionando perfectamente!');
    } else {
      console.log('❌ ALGUNOS COMPONENTES FALLARON');
      console.log('');
      console.log('🔍 DIAGNÓSTICO:');
      console.log('===============');
      console.log(`Workers: ${workersData.workers.length > 0 ? '✅' : '❌'}`);
      console.log(`Supabase: ${supabaseOk ? '✅' : '❌'}`);
      console.log(`Envío: ${notifData.success ? '✅' : '❌'}`);
      console.log(`Recepción: ${receivedNotifications > 0 ? '✅' : '❌'}`);
      console.log('');
      console.log('💡 SOLUCIONES:');
      console.log('==============');
      console.log('• Verifica las variables de entorno en producción');
      console.log('• Revisa la configuración de Supabase');
      console.log('• Verifica que los workers estén en la BD');
      console.log('• Comprueba los logs del servidor');
    }

    return {
      success,
      timestamp: new Date().toISOString(),
      environment: 'production',
      details: {
        workers: workersData.workers.length,
        supabase: supabaseOk,
        notificationSent: notifData.success,
        notificationsReceived: receivedNotifications,
        unreadCount: unreadCount,
      },
    };
  } catch (error) {
    console.log('\n❌ ERROR GENERAL:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Función para mostrar información del sistema
async function showProductionInfo() {
  console.log('📊 INFORMACIÓN DEL SISTEMA EN PRODUCCIÓN');
  console.log('=========================================');

  try {
    // Verificar workers
    const workersRes = await fetch('/api/workers');
    const workers = await workersRes.json();

    // Verificar diagnóstico
    const diagRes = await fetch('/api/diagnose');
    const diag = await diagRes.json();

    console.log(`👥 Workers disponibles: ${workers.workers?.length || 0}`);
    console.log(
      `🔧 Supabase conectado: ${diag.tests?.connection?.status === 'OK' ? '✅' : '❌'}`
    );
    console.log(
      `🔔 Notificaciones activas: ${diag.tests?.worker_notifications?.status === 'OK' ? '✅' : '❌'}`
    );

    if (workers.workers && workers.workers.length > 0) {
      console.log('\n👷 TRABAJADORES REGISTRADOS:');
      console.log('============================');
      workers.workers.forEach((w, i) => {
        console.log(`${i + 1}. ${w.name} ${w.surname} (${w.email})`);
      });
    }

    console.log('\n💡 FUNCIONES DISPONIBLES:');
    console.log('========================');
    console.log('- quickProductionTest()  🚀 Prueba completa del sistema');
    console.log('- showProductionInfo()   📊 Mostrar esta información');
  } catch (error) {
    console.log('❌ Error obteniendo información:', error.message);
  }
}

// Hacer funciones globales disponibles
window.quickProductionTest = quickProductionTest;
window.showProductionInfo = showProductionInfo;

console.log('\n🎯 FUNCIONES DE PRUEBA CARGADAS');
console.log('===============================');
console.log('Comandos disponibles:');
console.log('- quickProductionTest()  🚀 Ejecutar prueba completa');
console.log('- showProductionInfo()   📊 Ver información del sistema');
console.log('');
console.log('💡 COMANDO RECOMENDADO: quickProductionTest()');
console.log('');
console.log(
  'Esto ejecutará una verificación completa del sistema en producción.'
);

// Mostrar información inicial
showProductionInfo();
