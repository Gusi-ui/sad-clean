// Script rápido para probar notificaciones con workers reales
async function quickTest() {
  console.log('🚀 Prueba rápida de notificaciones...');

  try {
    // Obtener workers disponibles
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

    // Enviar notificación de prueba
    const notificationResponse = await fetch('/api/test-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: workerId,
        title: '🧪 Prueba Rápida',
        body:
          'Notificación enviada desde script rápido - ' +
          new Date().toLocaleTimeString(),
        type: 'system_message',
      }),
    });

    const notificationResult = await notificationResponse.json();
    console.log('📋 Resultado:', notificationResult);

    if (notificationResponse.ok && notificationResult.success) {
      console.log('✅ ¡Notificación enviada exitosamente!');

      // Verificar que se guardó en la BD
      setTimeout(async () => {
        try {
          const checkResponse = await fetch(
            `/api/workers/${workerId}/notifications`
          );
          const checkResult = await checkResponse.json();

          console.log(
            `📊 Notificaciones en BD: ${checkResult.notifications?.length || 0}`
          );
          console.log(`📊 No leídas: ${checkResult.unread_count || 0}`);

          if (
            checkResult.notifications &&
            checkResult.notifications.length > 0
          ) {
            console.log('🎉 ¡Todo funciona perfectamente!');
          }
        } catch (err) {
          console.log('⚠️ No se pudo verificar el estado final');
        }
      }, 1000);
    } else {
      console.log('❌ Error enviando notificación:', notificationResult.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar prueba
quickTest();
