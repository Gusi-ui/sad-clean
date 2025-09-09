// ============================================================================
// SCRIPTS DE VERIFICACIÓN PARA PRODUCCIÓN - SAD LAS
// ============================================================================
// Copia y pega estos scripts en la consola del navegador de producción
// ============================================================================

// ============================================================================
// 1. VERIFICACIÓN BÁSICA DE WORKERS EN PRODUCCIÓN
// ============================================================================

async function verifyProductionWorkers() {
  console.log('🔍 VERIFICACIÓN: Workers en Producción');
  console.log('=====================================');

  try {
    const response = await fetch('/api/workers');
    const result = await response.json();

    if (result.workers && result.workers.length > 0) {
      console.log('✅ ÉXITO: Workers encontrados en producción');
      console.log('📊 Total de workers:', result.workers.length);
      console.log('');

      result.workers.forEach((worker, index) => {
        console.log(`${index + 1}. ${worker.name} ${worker.surname}`);
        console.log(`   Email: ${worker.email}`);
        console.log(`   ID: ${worker.id}`);
        console.log('');
      });

      return { success: true, count: result.workers.length };
    } else {
      console.log('❌ ERROR: No hay workers en producción');
      console.log('💡 SOLUCIONES:');
      console.log('   • Verificar tabla workers en Supabase');
      console.log('   • Revisar SUPABASE_SERVICE_ROLE_KEY');
      console.log('   • Verificar políticas RLS');
      return { success: false, count: 0 };
    }
  } catch (error) {
    console.log('❌ ERROR DE CONEXIÓN:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. VERIFICACIÓN DE CONFIGURACIÓN DE SUPABASE
// ============================================================================

async function verifyProductionSupabase() {
  console.log('🔧 VERIFICACIÓN: Configuración Supabase en Producción');
  console.log('===================================================');

  // Verificar variables públicas disponibles
  console.log('📋 VARIABLES PÚBLICAS:');
  console.log(
    '- NEXT_PUBLIC_SUPABASE_URL:',
    !!process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  console.log(
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('');

  try {
    const response = await fetch('/api/diagnose');
    const result = await response.json();

    console.log('📊 RESULTADOS DE DIAGNÓSTICO:');
    const tests = result.tests || {};

    const results = {
      connection: tests.connection?.status === 'OK',
      worker_notifications: tests.worker_notifications?.status === 'OK',
      notification_service: tests.notification_service?.status === 'OK',
    };

    Object.entries(tests).forEach(([testName, testResult]) => {
      const status = testResult.status === 'OK' ? '✅' : '❌';
      console.log(`${status} ${testName}: ${testResult.status}`);
    });

    const allOk =
      results.connection &&
      results.worker_notifications &&
      results.notification_service;

    console.log('');
    console.log('🎯 RESULTADO FINAL:');
    console.log(`Sistema: ${allOk ? '✅ OPERATIVO' : '❌ REQUIERE ATENCIÓN'}`);

    return { success: allOk, details: results };
  } catch (error) {
    console.log('❌ ERROR EN DIAGNÓSTICO:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 3. PRUEBA COMPLETA DEL SISTEMA EN PRODUCCIÓN
// ============================================================================

async function testProductionNotificationSystem() {
  console.log('🚀 PRUEBA COMPLETA: Sistema de Notificaciones en Producción');
  console.log('===========================================================');

  const results = {
    workers: false,
    supabase: false,
    notifications: false,
    reception: false,
  };

  // PASO 1: Verificar workers
  console.log('\n📋 PASO 1: Verificando workers...');
  try {
    const workersResponse = await fetch('/api/workers');
    const workersResult = await workersResponse.json();

    if (!workersResult.workers || workersResult.workers.length === 0) {
      console.log('❌ FALLÓ: No hay workers disponibles');
      return { success: false, step: 'workers', results };
    }

    results.workers = true;
    const workerId = workersResult.workers[0].id;
    console.log(`✅ Workers OK: ${workersResult.workers.length} encontrados`);
    console.log(`👤 Usando worker: ${workersResult.workers[0].name}`);

    // PASO 2: Verificar Supabase
    console.log('\n🔧 PASO 2: Verificando configuración Supabase...');
    const diagResponse = await fetch('/api/diagnose');
    const diagResult = await diagResponse.json();

    const diagOK =
      diagResult.tests?.connection?.status === 'OK' &&
      diagResult.tests?.worker_notifications?.status === 'OK';

    if (!diagOK) {
      console.log('❌ FALLÓ: Configuración de Supabase incorrecta');
      return { success: false, step: 'supabase', results };
    }

    results.supabase = true;
    console.log('✅ Supabase OK: Configuración correcta');

    // PASO 3: Enviar notificación
    console.log('\n🧪 PASO 3: Enviando notificación de prueba...');
    const testTitle = '🎯 Prueba de Producción';
    const testBody = `Sistema funcionando en producción - ${new Date().toLocaleString()}`;

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

    const notifResult = await notifResponse.json();

    if (!notifResponse.ok || !notifResult.success) {
      console.log('❌ FALLÓ: No se pudo enviar notificación');
      console.log('Error:', notifResult.error);
      return { success: false, step: 'notifications', results };
    }

    results.notifications = true;
    const notificationId = notifResult.notification?.id;
    console.log('✅ Notificación enviada OK');
    console.log(`📋 ID de notificación: ${notificationId}`);

    // PASO 4: Verificar recepción
    console.log('\n📊 PASO 4: Verificando recepción de notificaciones...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Esperar 3 segundos

    const notifsResponse = await fetch(
      `/api/workers/${workerId}/notifications`
    );
    const notifsResult = await notifsResponse.json();

    if (
      !notifsResult.notifications ||
      notifsResult.notifications.length === 0
    ) {
      console.log('❌ FALLÓ: Notificación no recibida');
      return { success: false, step: 'reception', results };
    }

    results.reception = true;
    console.log('✅ Notificaciones recibidas OK');
    console.log(
      `📊 Total de notificaciones: ${notifsResult.notifications.length}`
    );

    // Verificar contador de no leídas
    const unreadResponse = await fetch(
      `/api/workers/${workerId}/notifications/unread-count`
    );
    const unreadResult = await unreadResponse.json();
    console.log(
      `📊 Notificaciones no leídas: ${unreadResult.unread_count || 0}`
    );

    // Mostrar la última notificación
    const latestNotification = notifsResult.notifications[0];
    console.log('\n📝 ÚLTIMA NOTIFICACIÓN RECIBIDA:');
    console.log('================================');
    console.log(`Título: ${latestNotification.title}`);
    console.log(`Mensaje: ${latestNotification.body}`);
    console.log(`Tipo: ${latestNotification.type}`);
    console.log(`Prioridad: ${latestNotification.priority}`);

    // RESULTADO FINAL
    const allSuccess =
      results.workers &&
      results.supabase &&
      results.notifications &&
      results.reception;

    console.log('\n🎉 RESULTADO FINAL DE PRODUCCIÓN:');
    console.log('===================================');
    if (allSuccess) {
      console.log('✅ ¡PRODUCCIÓN FUNCIONANDO PERFECTAMENTE!');
      console.log('');
      console.log('📋 VERIFICACIÓN COMPLETA:');
      console.log('========================');
      console.log('✅ Workers disponibles y accesibles');
      console.log('✅ Configuración de Supabase correcta');
      console.log('✅ Sistema de notificaciones operativo');
      console.log('✅ Notificaciones enviándose y recibiéndose');
      console.log('✅ Base de datos funcionando correctamente');
      console.log('');
      console.log('🎊 ¡FELICITACIONES!');
      console.log('==================');
      console.log('Tu aplicación SAD LAS está 100% operativa en producción.');
      console.log('El sistema de notificaciones está listo para uso real.');
      console.log('');
      console.log('🚀 PRÓXIMOS PASOS RECOMENDADOS:');
      console.log('==============================');
      console.log('• Verificar dashboard de trabajadores');
      console.log('• Probar envío desde panel administrativo');
      console.log('• Configurar monitoreo diario');
      console.log('• ¡Disfrutar del sistema funcionando!');
    } else {
      console.log('❌ ALGUNOS COMPONENTES FALLARON');
      console.log('');
      console.log('📋 COMPONENTES CON PROBLEMAS:');
      Object.entries(results).forEach(([component, success]) => {
        console.log(`${success ? '✅' : '❌'} ${component}`);
      });
    }

    return {
      success: allSuccess,
      results: results,
      timestamp: new Date().toISOString(),
      environment: 'production',
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

// ============================================================================
// 4. MONITOREO DIARIO DEL SISTEMA
// ============================================================================

async function dailyProductionMonitoring() {
  console.log('📊 MONITOREO DIARIO - SAD LAS Producción');
  console.log('=======================================');

  const monitoring = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: false,
  };

  // Verificar workers
  try {
    console.log('👥 Verificando workers...');
    const workersRes = await fetch('/api/workers');
    const workersData = await workersRes.json();
    const workersOk = workersData.workers && workersData.workers.length > 0;

    monitoring.checks.workers = {
      status: workersOk ? 'OK' : 'ERROR',
      count: workersData.workers?.length || 0,
      details: workersOk ? 'Workers disponibles' : 'No hay workers',
    };

    console.log(
      `${workersOk ? '✅' : '❌'} Workers: ${workersData.workers?.length || 0} encontrados`
    );
  } catch (e) {
    monitoring.checks.workers = {
      status: 'ERROR',
      error: e.message,
      details: 'Error de conexión',
    };
    console.log('❌ Workers: Error de conexión');
  }

  // Verificar base de datos
  try {
    console.log('🗄️ Verificando base de datos...');
    const diagRes = await fetch('/api/diagnose');
    const diagData = await diagRes.json();

    const dbOk = diagData.tests?.connection?.status === 'OK';
    const notificationsOk =
      diagData.tests?.worker_notifications?.status === 'OK';

    monitoring.checks.database = {
      status: dbOk ? 'OK' : 'ERROR',
      connection: dbOk,
      notifications: notificationsOk,
      details: dbOk ? 'Base de datos operativa' : 'Problemas de conexión',
    };

    console.log(
      `${dbOk ? '✅' : '❌'} Base de datos: ${dbOk ? 'OK' : 'ERROR'}`
    );
    console.log(
      `${notificationsOk ? '✅' : '❌'} Notificaciones: ${notificationsOk ? 'OK' : 'ERROR'}`
    );
  } catch (e) {
    monitoring.checks.database = {
      status: 'ERROR',
      error: e.message,
      details: 'Error al verificar base de datos',
    };
    console.log('❌ Base de datos: Error de verificación');
  }

  // Verificar sistema general
  try {
    console.log('🔧 Verificando sistema general...');
    const systemRes = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: 'test-worker-id',
        title: 'Test',
        body: 'Test message',
        type: 'system_message',
      }),
    });

    const systemOk = systemRes.ok;
    monitoring.checks.system = {
      status: systemOk ? 'OK' : 'ERROR',
      httpStatus: systemRes.status,
      details: systemOk
        ? 'Sistema operativo'
        : `Error HTTP ${systemRes.status}`,
    };

    console.log(
      `${systemOk ? '✅' : '❌'} Sistema: ${systemOk ? 'OK' : 'ERROR'}`
    );
  } catch (e) {
    monitoring.checks.system = {
      status: 'ERROR',
      error: e.message,
      details: 'Error general del sistema',
    };
    console.log('❌ Sistema: Error general');
  }

  // Resultado final
  const allChecksOk = Object.values(monitoring.checks).every(
    (check) => check.status === 'OK'
  );
  monitoring.overall = allChecksOk;

  console.log('\n📋 REPORTE FINAL DE MONITOREO:');
  console.log('==============================');
  console.log(
    `Estado general: ${allChecksOk ? '✅ OPERATIVO' : '❌ REQUIERE ATENCIÓN'}`
  );
  console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);

  if (!allChecksOk) {
    console.log('\n🚨 ACCIONES RECOMENDADAS:');
    console.log('=========================');

    Object.entries(monitoring.checks).forEach(([component, check]) => {
      if (check.status !== 'OK') {
        console.log(`• ${component}: ${check.details}`);
      }
    });

    console.log('\n🔧 SOLUCIONES COMUNES:');
    console.log('=======================');
    console.log('• Verificar variables de entorno en producción');
    console.log('• Revisar conexión a Supabase');
    console.log('• Verificar políticas RLS');
    console.log('• Consultar logs del servidor');
  } else {
    console.log('\n🎉 ¡TODO FUNCIONANDO PERFECTAMENTE!');
    console.log('===================================');
  }

  // Guardar reporte en localStorage para historial
  try {
    const history = JSON.parse(
      localStorage.getItem('sad-las-monitoring') || '[]'
    );
    history.push(monitoring);
    // Mantener solo los últimos 30 reportes
    if (history.length > 30) history.shift();
    localStorage.setItem('sad-las-monitoring', JSON.stringify(history));
  } catch (e) {
    // Ignorar errores de localStorage
  }

  return monitoring;
}

// ============================================================================
// FUNCIONES DE DEBUG PARA PROBLEMAS ESPECÍFICOS
// ============================================================================

async function debugProductionConnection() {
  console.log('🔍 DEBUG: Problemas de conexión en producción');
  console.log('=============================================');

  console.log('1. Verificando variables de entorno...');
  console.log(
    '- URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ No definida'
  );
  console.log(
    '- Key:',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ No definida'
  );

  console.log('\n2. Probando conectividad básica...');
  try {
    const response = await fetch('/api/diagnose');
    console.log(`Status HTTP: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint de diagnóstico responde');
      console.log('Tests disponibles:', Object.keys(data.tests || {}));
    } else {
      console.log('❌ Endpoint de diagnóstico falló');
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
  }

  console.log('\n3. Verificando workers...');
  try {
    const response = await fetch('/api/workers');
    const data = await response.json();
    console.log(`Workers encontrados: ${data.workers?.length || 0}`);
  } catch (error) {
    console.log('❌ Error al obtener workers:', error.message);
  }
}

async function debugNotificationSystem() {
  console.log('🔍 DEBUG: Sistema de notificaciones en producción');
  console.log('=================================================');

  // Obtener workers primero
  try {
    const workersRes = await fetch('/api/workers');
    const workersData = await workersRes.json();

    if (!workersData.workers || workersData.workers.length === 0) {
      console.log('❌ No hay workers disponibles para pruebas');
      return;
    }

    const workerId = workersData.workers[0].id;
    console.log(`Usando worker: ${workersData.workers[0].name} (${workerId})`);

    // Probar envío
    console.log('\n🧪 Probando envío de notificación...');
    const sendRes = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '🔍 Debug Test',
        body: `Prueba de debug - ${new Date().toISOString()}`,
        type: 'system_message',
      }),
    });

    if (sendRes.ok) {
      const sendData = await sendRes.json();
      console.log('✅ Notificación enviada:', sendData.notification?.id);
    } else {
      console.log('❌ Error al enviar:', sendRes.status);
    }

    // Esperar y verificar recepción
    console.log('\n⏳ Esperando recepción...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const receiveRes = await fetch(`/api/workers/${workerId}/notifications`);
    const receiveData = await receiveRes.json();

    console.log(
      `📊 Notificaciones en lista: ${receiveData.notifications?.length || 0}`
    );

    if (receiveData.notifications && receiveData.notifications.length > 0) {
      const latest = receiveData.notifications[0];
      console.log('✅ Última notificación:');
      console.log(`   Título: ${latest.title}`);
      console.log(`   Estado: ${latest.read_at ? 'Leída' : 'No leída'}`);
    }
  } catch (error) {
    console.log('❌ Error en debug:', error.message);
  }
}

// ============================================================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================================================

window.verifyProductionWorkers = verifyProductionWorkers;
window.verifyProductionSupabase = verifyProductionSupabase;
window.testProductionNotificationSystem = testProductionNotificationSystem;
window.dailyProductionMonitoring = dailyProductionMonitoring;
window.debugProductionConnection = debugProductionConnection;
window.debugNotificationSystem = debugNotificationSystem;

// ============================================================================
// MENÚ DE FUNCIONES DISPONIBLES
// ============================================================================

console.log('🎯 SCRIPTS DE VERIFICACIÓN PARA PRODUCCIÓN DISPONIBLES:');
console.log('=======================================================');
console.log('');
console.log('Funciones principales:');
console.log('- verifyProductionWorkers()          👥 Verificar workers');
console.log('- verifyProductionSupabase()         🔧 Verificar Supabase');
console.log('- testProductionNotificationSystem() 🚀 Prueba completa');
console.log('');
console.log('Monitoreo:');
console.log('- dailyProductionMonitoring()        📊 Monitoreo diario');
console.log('');
console.log('Debug:');
console.log('- debugProductionConnection()        🔍 Debug conexión');
console.log('- debugNotificationSystem()          🔍 Debug notificaciones');
console.log('');
console.log('💡 COMANDO RECOMENDADO: testProductionNotificationSystem()');
console.log('');
console.log(
  'Ejecuta este comando para verificar que todo funciona en producción.'
);
console.log(
  'Si hay errores, revisa las funciones de debug para diagnóstico detallado.'
);
