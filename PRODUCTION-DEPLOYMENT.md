# 🚀 DESPLIEGUE EN PRODUCCIÓN - SAD LAS

## 🎯 **VERIFICACIÓN PREVIA EN DESARROLLO**

**¡Excelente!** Tu sistema está funcionando perfectamente en desarrollo:

```
✅ Sistema 100% operativo en desarrollo:
=======================================
✅ 3 workers reales disponibles
✅ 18 notificaciones totales
✅ 1 notificación no leída
✅ Notificaciones enviándose correctamente
✅ Endpoint /api/workers funcionando
✅ Todos los componentes operativos
```

## 📋 **PASOS PARA PRODUCCIÓN**

### **1. Configuración de Variables de Entorno en Producción**

#### **Opción A: Vercel (Recomendado)**

```bash
# Ve a tu dashboard de Vercel
# Proyecto SAD LAS → Settings → Environment Variables

# Agrega estas variables:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_real
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_real
NODE_ENV=production
```

#### **Opción B: Variables de Entorno del Sistema**

```bash
# En tu servidor de producción:
export NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_real
export SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_real
export NODE_ENV=production
```

#### **Opción C: Archivo .env.production**

```bash
# Crear archivo .env.production
touch .env.production

# Contenido:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_real
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_real
NODE_ENV=production
```

### **2. Verificación de Base de Datos en Producción**

Antes del despliegue, ejecuta estos scripts:

#### **Script: Verificar Workers en Producción**

```javascript
// Ejecutar en la consola del navegador de producción
async function verifyProductionWorkers() {
  console.log("🔍 Verificando workers en producción...");

  try {
    const response = await fetch("/api/workers");
    const result = await response.json();

    if (result.workers && result.workers.length > 0) {
      console.log("✅ Workers encontrados:", result.workers.length);
      result.workers.forEach((w, i) => {
        console.log(`${i + 1}. ${w.name} ${w.surname} (${w.email})`);
      });
      return true;
    } else {
      console.log("❌ No hay workers en producción");
      return false;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return false;
  }
}

verifyProductionWorkers();
```

#### **Script: Verificar Conexión Supabase**

```javascript
// Verificar configuración de Supabase en producción
async function verifyProductionSupabase() {
  console.log("🔧 Verificando configuración Supabase...");

  // Verificar variables públicas
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Key configurada:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Verificar conexión
  try {
    const response = await fetch("/api/diagnose");
    const result = await response.json();

    console.log("📊 Estado de conexión:");
    Object.entries(result.tests || {}).forEach(([key, test]) => {
      console.log(
        `${test.status === "OK" ? "✅" : "❌"} ${key}: ${test.status}`,
      );
    });

    return result.tests?.connection?.status === "OK";
  } catch (error) {
    console.log("❌ Error de conexión:", error.message);
    return false;
  }
}

verifyProductionSupabase();
```

### **3. Script de Prueba Completa en Producción**

```javascript
// SCRIPT PARA PROBAR SISTEMA COMPLETO EN PRODUCCIÓN
// COPIA Y PEGA EN LA CONSOLA DEL NAVEGADOR DE PRODUCCIÓN

async function testProductionNotificationSystem() {
  console.log("🚀 PRUEBA DE PRODUCCIÓN - SISTEMA DE NOTIFICACIONES");
  console.log("===================================================");

  // 1. Verificar workers
  console.log("\n👥 PASO 1: Verificando workers...");
  try {
    const workersResponse = await fetch("/api/workers");
    const workersResult = await workersResponse.json();

    if (!workersResult.workers || workersResult.workers.length === 0) {
      console.log("❌ ERROR: No hay workers en producción");
      return false;
    }

    console.log("✅ Workers encontrados:", workersResult.workers.length);
    const workerId = workersResult.workers[0].id;
    console.log("👤 Usando worker:", workersResult.workers[0].name);

    // 2. Verificar diagnóstico
    console.log("\n📋 PASO 2: Verificando configuración...");
    const diagResponse = await fetch("/api/diagnose");
    const diagResult = await diagResponse.json();

    const diagOK =
      diagResult.tests?.connection?.status === "OK" &&
      diagResult.tests?.worker_notifications?.status === "OK";

    if (!diagOK) {
      console.log("❌ ERROR: Configuración de Supabase fallida");
      return false;
    }
    console.log("✅ Configuración correcta");

    // 3. Enviar notificación de prueba
    console.log("\n🧪 PASO 3: Enviando notificación de prueba...");
    const notifResponse = await fetch("/api/test-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: workerId,
        title: "🎯 Prueba de Producción",
        body:
          "Sistema funcionando correctamente en producción - " +
          new Date().toISOString(),
        type: "system_message",
      }),
    });

    const notifResult = await notifResponse.json();

    if (!notifResponse.ok || !notifResult.success) {
      console.log("❌ ERROR: No se pudo enviar notificación");
      console.log("Detalles:", notifResult.error);
      return false;
    }

    console.log("✅ Notificación enviada exitosamente");
    console.log("📋 ID:", notifResult.notification?.id);

    // 4. Verificar recepción
    console.log("\n📊 PASO 4: Verificando recepción...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const notifsResponse = await fetch(
      `/api/workers/${workerId}/notifications`,
    );
    const notifsResult = await notifsResponse.json();

    const unreadResponse = await fetch(
      `/api/workers/${workerId}/notifications/unread-count`,
    );
    const unreadResult = await unreadResponse.json();

    console.log(
      "📋 Total notificaciones:",
      notifsResult.notifications?.length || 0,
    );
    console.log("📊 No leídas:", unreadResult.unread_count || 0);

    if (notifsResult.notifications && notifsResult.notifications.length > 0) {
      console.log("\n🎉 ¡PRODUCCIÓN FUNCIONANDO PERFECTAMENTE!");
      console.log("=======================================");

      const latest = notifsResult.notifications[0];
      console.log("📝 Última notificación:");
      console.log("   Título:", latest.title);
      console.log("   Mensaje:", latest.body);
      console.log("   Tipo:", latest.type);

      console.log("\n✅ VERIFICACIÓN COMPLETA:");
      console.log("==========================");
      console.log("✅ Workers disponibles");
      console.log("✅ Configuración Supabase correcta");
      console.log("✅ Notificaciones enviándose");
      console.log("✅ Notificaciones recibiéndose");
      console.log("✅ Sistema 100% operativo en producción");

      console.log("\n🎊 ¡FELICITACIONES!");
      console.log("==================");
      console.log(
        "Tu aplicación SAD LAS está funcionando perfectamente en producción.",
      );
      console.log(
        "El sistema de notificaciones está operativo y listo para uso real.",
      );

      return true;
    } else {
      console.log("⚠️ Notificación enviada pero no visible en la lista");
      return false;
    }
  } catch (error) {
    console.log("❌ ERROR GENERAL:", error.message);
    return false;
  }
}

// Ejecutar prueba
testProductionNotificationSystem();
```

### **4. Checklist de Despliegue**

#### **Pre-Despliegue**

- [ ] Variables de entorno configuradas en producción
- [ ] Base de datos de Supabase creada y configurada
- [ ] Workers creados en la base de datos
- [ ] Políticas RLS configuradas correctamente
- [ ] Proyecto de Next.js construido sin errores

#### **Durante el Despliegue**

- [ ] Despliegue exitoso en Vercel/Netlify/servidor
- [ ] Variables de entorno aplicadas correctamente
- [ ] Aplicación carga sin errores
- [ ] Consola del navegador sin errores de Supabase

#### **Post-Despliegue**

- [ ] Ejecutar script de verificación de workers
- [ ] Ejecutar script de verificación de Supabase
- [ ] Ejecutar script de prueba completa
- [ ] Verificar dashboard de trabajadores
- [ ] Probar envío de notificaciones desde panel administrativo

### **5. Monitoreo en Producción**

#### **Script de Monitoreo Diario**

```javascript
// Ejecutar diariamente para verificar estado del sistema
async function dailyProductionCheck() {
  console.log("📊 MONITOREO DIARIO - SAD LAS PRODUCCIÓN");
  console.log("=========================================");

  const results = {
    timestamp: new Date().toISOString(),
    workers: false,
    notifications: false,
    database: false,
  };

  // Verificar workers
  try {
    const workersRes = await fetch("/api/workers");
    const workersData = await workersRes.json();
    results.workers = workersData.workers && workersData.workers.length > 0;
    console.log(
      `👥 Workers: ${results.workers ? "✅" : "❌"} (${workersData.workers?.length || 0})`,
    );
  } catch (e) {
    console.log("👥 Workers: ❌ Error de conexión");
  }

  // Verificar notificaciones
  try {
    const diagRes = await fetch("/api/diagnose");
    const diagData = await diagRes.json();
    results.notifications =
      diagData.tests?.worker_notifications?.status === "OK";
    results.database = diagData.tests?.connection?.status === "OK";
    console.log(`🔔 Notificaciones: ${results.notifications ? "✅" : "❌"}`);
    console.log(`🗄️ Base de datos: ${results.database ? "✅" : "❌"}`);
  } catch (e) {
    console.log("🔧 Sistema: ❌ Error general");
  }

  // Resultado final
  const allGood = results.workers && results.notifications && results.database;

  console.log("\n📋 RESULTADO FINAL:");
  console.log("==================");
  console.log(
    `Estado general: ${allGood ? "✅ OPERATIVO" : "❌ REQUIERE ATENCIÓN"}`,
  );

  if (!allGood) {
    console.log("\n🚨 ACCIONES RECOMENDADAS:");
    console.log("=========================");
    if (!results.workers) console.log("• Verificar tabla workers en Supabase");
    if (!results.notifications)
      console.log("• Revisar configuración de notificaciones");
    if (!results.database) console.log("• Verificar conexión a Supabase");
  }

  return results;
}

// Ejecutar monitoreo
dailyProductionCheck();
```

### **6. Solución de Problemas en Producción**

#### **Problema: "Workers no encontrados"**

```javascript
// Verificar si es problema de RLS
async function debugProductionWorkers() {
  console.log("🔍 DEBUG: Workers en producción");

  // Verificar endpoint
  const response = await fetch("/api/workers");
  console.log("Status:", response.status);

  if (response.ok) {
    const data = await response.json();
    console.log("Workers:", data.workers?.length || 0);

    if (data.workers?.length === 0) {
      console.log("💡 POSIBLE SOLUCIÓN:");
      console.log("1. Verificar que hay workers en la BD de Supabase");
      console.log("2. Revisar políticas RLS en tabla workers");
      console.log("3. Verificar SUPABASE_SERVICE_ROLE_KEY en producción");
    }
  } else {
    console.log("❌ Error HTTP:", response.status);
  }
}
```

#### **Problema: "Error de conexión a Supabase"**

```javascript
// Verificar configuración de Supabase
async function debugSupabaseConnection() {
  console.log("🔧 DEBUG: Conexión Supabase");

  console.log("Variables disponibles:");
  console.log(
    "- NEXT_PUBLIC_SUPABASE_URL:",
    !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  console.log(
    "- NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  // Probar conexión básica
  try {
    const response = await fetch("/api/diagnose");
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Conexión exitosa");
      console.log("Tests:", data.tests);
    } else {
      console.log("❌ Error de conexión:", response.status);
    }
  } catch (e) {
    console.log("❌ Error de red:", e.message);
  }
}
```

### **7. URLs de Producción**

Después del despliegue, actualiza estas URLs:

```javascript
// En tu código, reemplaza:
const PRODUCTION_URL = 'https://tu-dominio-produccion.com';

// Para las redirecciones de NextAuth:
NEXTAUTH_URL=https://tu-dominio-produccion.com

// Para Google Maps:
NEXT_PUBLIC_APP_URL=https://tu-dominio-produccion.com
```

### **8. Verificación Final**

Una vez en producción:

1. **Accede a tu aplicación**: `https://tu-dominio-produccion.com`
2. **Abre la consola del navegador** (F12)
3. **Ejecuta el script de verificación** completo
4. **Verifica el dashboard** de trabajadores
5. **Prueba enviar notificaciones** desde el panel administrativo

## 🎉 **¡LISTO PARA PRODUCCIÓN!**

Tu sistema está completamente probado y listo para producción. El proceso de despliegue es:

1. ✅ **Configurar variables** de entorno
2. ✅ **Desplegar aplicación**
3. ✅ **Ejecutar scripts** de verificación
4. ✅ **Monitorear** diariamente
5. ✅ **¡Disfrutar** del sistema operativo!

## 📞 **Soporte**

Si encuentras problemas en producción:

1. Ejecuta los scripts de debug proporcionados
2. Revisa la consola del navegador y del servidor
3. Verifica las variables de entorno
4. Consulta los logs de Supabase
5. Contacta soporte si es necesario

**¡Tu aplicación SAD LAS está lista para brillar en producción! 🚀**
