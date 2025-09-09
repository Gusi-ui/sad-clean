# 🔔 Guía de Pruebas - Sistema de Notificaciones

## 📋 **Problema Reportado**

Las notificaciones no aparecen en la aplicación de las trabajadoras cuando se realizan cambios desde
el panel administrativo.

## 🔧 **Cambios Implementados**

### 1. **Corrección del Sistema de Tiempo Real**

- ✅ Corregido el canal de Supabase Realtime (`worker-${user.id}-notifications`)
- ✅ Configuración correcta del broadcast con `{ self: false }`
- ✅ Timeout automático para evitar canales abiertos

### 2. **Mejora del Servicio de Notificaciones**

- ✅ Logs de debug agregados para rastrear el flujo
- ✅ Verificación de tabla `worker_notifications` antes de enviar
- ✅ Fallback a inserción directa si falla el servicio completo

### 3. **Herramientas de Prueba**

- ✅ Página de prueba: `/test-notifications`
- ✅ API de prueba: `/api/test-notifications`
- ✅ Script de navegador: `test-notifications-browser.js`

## 🧪 **Cómo Probar el Sistema**

### **Opción 1: Interfaz Gráfica (Recomendada)**

1. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

2. **Abrir la página de pruebas:**
   - Ve a: `http://localhost:3001/test-notifications`
   - Completa el formulario con:
     - **Worker ID**: ID de un trabajador real (de la tabla `workers`)
     - **Título**: Cualquier título descriptivo
     - **Contenido**: Mensaje de la notificación
     - **Tipo**: `assignment_change` para probar cambios de asignación

3. **Enviar la notificación:**
   - Haz clic en "🚀 Enviar Notificación de Prueba"
   - Verifica la consola del navegador para logs

4. **Verificar recepción:**
   - Abre otra pestaña en: `http://localhost:3001/worker-dashboard`
   - Inicia sesión como el trabajador
   - Las notificaciones deberían aparecer automáticamente

### **Opción 2: Consola del Navegador**

1. **Cargar el script de pruebas:**

   ```javascript
   // Copia y pega el contenido de test-notifications-browser.js en la consola
   ```

2. **Ejecutar pruebas:**

   ```javascript
   // Ejecutar todas las pruebas automáticamente
   runAllTests();

   // O ejecutar pruebas individuales
   testBasicNotification();
   checkNotificationStatus("worker-id-real");
   ```

### **Opción 3: Prueba Manual desde Assignments**

1. **Ve al panel de asignaciones:**
   - URL: `http://localhost:3001/assignments`

2. **Modifica una asignación:**
   - Selecciona una asignación existente
   - Cambia las horas semanales
   - Guarda los cambios

3. **Verifica los logs:**
   - Revisa la consola del navegador para ver los logs de debug
   - Deberías ver mensajes como:
     ```
     🚀 Intentando enviar notificación completa usando notificationService
     ✅ Notificación enviada exitosamente
     📋 Detalles de la notificación: {...}
     ```

4. **Verifica recepción:**
   - Ve al dashboard del trabajador correspondiente
   - Las notificaciones deberían aparecer en el `NotificationCenter`

## 🔍 **Diagnóstico Paso a Paso**

### **Paso 1: Verificar Conectividad**

```javascript
// En la consola del navegador
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("User ID:", user?.id); // Desde el contexto de autenticación
```

### **Paso 2: Verificar Tablas**

```sql
-- Ejecuta en Supabase SQL Editor
SELECT * FROM worker_notifications LIMIT 5;
SELECT * FROM worker_devices LIMIT 5;
```

### **Paso 3: Verificar Realtime**

```javascript
// En la consola del navegador desde worker-dashboard
const channel = supabase.channel("test-channel");
channel.subscribe((status) => console.log("Realtime status:", status));
```

### **Paso 4: Verificar Permisos**

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'worker_notifications';
```

## 🐛 **Posibles Problemas y Soluciones**

### **Problema 1: No llegan notificaciones en tiempo real**

**Síntomas:** Las notificaciones se guardan en BD pero no aparecen inmediatamente **Solución:**

- Verificar que el canal Realtime esté suscrito correctamente
- Revisar configuración de `{ self: false }` en el canal
- Verificar que el `workerId` sea correcto

### **Problema 2: Error al crear notificaciones**

**Síntomas:** Error "TypeError: fetch failed" **Solución:**

- Verificar que Supabase esté ejecutándose
- Revisar configuración de URL y claves de Supabase
- Verificar permisos de la tabla `worker_notifications`

### **Problema 3: Notificaciones no se muestran**

**Síntomas:** Las notificaciones llegan pero no se muestran en la UI **Solución:**

- Verificar que el `NotificationCenter` esté renderizado
- Revisar que el hook `useNotifications` esté activo
- Verificar que el `user.id` coincida con el `worker_id`

## 📊 **Logs de Debug Esperados**

### **En el Panel Administrativo (al cambiar asignación):**

```
🚀 Intentando enviar notificación completa usando notificationService para [Nombre] ([ID])
✅ Tabla worker_notifications accesible, datos de prueba: [...]
✅ Notificación enviada exitosamente a [Nombre]: [oldHours]h → [newHours]h
📋 Detalles de la notificación: { workerId: "...", ... }
```

### **En el Worker Dashboard:**

```
📋 Nueva notificación recibida: { title: "...", body: "...", ... }
🔊 Reproduciendo sonido: notification-assignment_changed_new.wav
🔔 Mostrando notificación del navegador
```

## 🚀 **Próximos Pasos**

1. **Probar el sistema** siguiendo las instrucciones arriba
2. **Verificar logs** en la consola del navegador
3. **Reportar cualquier error** encontrado
4. **Confirmar funcionamiento** del sistema completo

## 📞 **Soporte**

Si encuentras algún problema:

1. Revisa los logs de la consola del navegador
2. Verifica que todas las variables de entorno estén configuradas
3. Confirma que Supabase esté ejecutándose correctamente
4. Comparte los logs de error para diagnóstico

---

**¡El sistema de notificaciones está listo para pruebas! 🚀**
