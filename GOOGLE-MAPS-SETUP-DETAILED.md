# 🗺️ Configuración Detallada de Google Maps API

## 📋 Problema Actual

El error `RefererNotAllowedMapError` indica que la API key de Google Maps no está configurada para
permitir acceso desde los dominios locales de desarrollo.

## 🔧 Solución Paso a Paso

### 1. Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona tu proyecto o crea uno nuevo

### 2. Habilitar las APIs Necesarias

1. Ve a **"APIs & Services" > "Library"**
2. Busca y habilita estas APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Directions API**

### 3. Configurar la API Key

1. Ve a **"APIs & Services" > "Credentials"**
2. Encuentra tu API key: `AIzaSyDJO-K651Oj7Pkh_rVHGw0hmPb7NtQCozQ`
3. Haz clic en ella para editarla

### 4. Configurar Restricciones de Aplicación

En la sección **"Application restrictions"**:

1. Selecciona **"HTTP referrers (web sites)"**
2. Agrega estos dominios autorizados (según las nuevas reglas de Google):

```
http://localhost:8080
http://localhost:3001
http://127.0.0.1:8080
http://127.0.0.1:3001
```

**⚠️ IMPORTANTE:** Según la nueva documentación de Google:

- **NO** uses `/*` al final de las URLs
- **NO** se admiten parámetros de consulta ni fragmentos
- Las URLs deben ser específicas del dominio y puerto

### 5. Configurar Restricciones de API

En la sección **"API restrictions"**:

1. Selecciona **"Restrict key"**
2. Marca estas APIs:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Directions API

### 6. Guardar Cambios

1. Haz clic en **"Save"**
2. Espera unos minutos para que los cambios se propaguen

## 🧪 Probar la Configuración

### Opción 1: Archivo de Test Simple

1. Abre: http://localhost:8080/test-google-maps-simple.html
2. Haz clic en **"Verificar API Key"**
3. Prueba los botones de test

### Opción 2: Archivo de Test Original

1. Abre: http://localhost:8080/test-google-maps.html
2. Prueba los botones de test

### Opción 3: Aplicación Next.js

1. Ve a: http://localhost:3001/worker-dashboard/route
2. Haz clic en **"📍 Mostrar Mapa"**

## 🔍 Verificar que Funciona

### ✅ Indicadores de Éxito:

- No aparecen errores en la consola del navegador
- El mapa se carga correctamente
- Los marcadores aparecen en el mapa
- La geocodificación funciona
- Las direcciones se calculan

### ❌ Indicadores de Error:

- `RefererNotAllowedMapError`: Dominios no autorizados
- `REQUEST_DENIED`: API no habilitada
- `OVER_QUERY_LIMIT`: Límite de consultas excedido

## 🚨 Solución de Problemas

### Error: "RefererNotAllowedMapError"

**Causa:** El dominio no está autorizado en la API key **Solución:** Agregar el dominio a las
restricciones de HTTP referrers

### Error: "REQUEST_DENIED"

**Causa:** La API no está habilitada **Solución:** Habilitar la API correspondiente en Google Cloud
Console

### Error: "OVER_QUERY_LIMIT"

**Causa:** Se excedió el límite de consultas gratuitas **Solución:** Esperar hasta el siguiente día
o configurar facturación

### Error: "INVALID_REQUEST"

**Causa:** Parámetros incorrectos en la solicitud **Solución:** Verificar que las direcciones sean
válidas

## 📱 Configuración para Producción

Cuando despliegues la aplicación en producción, necesitarás:

1. **Agregar el dominio de producción** a las restricciones de HTTP referrers
2. **Configurar facturación** si esperas más de 25,000 consultas por día
3. **Revisar las cuotas** y límites de las APIs

### Ejemplo de dominios de producción:

```
https://tu-dominio.com
https://www.tu-dominio.com
```

## 🔐 Seguridad

### Buenas Prácticas:

- ✅ Restringir la API key a dominios específicos
- ✅ Habilitar solo las APIs necesarias
- ✅ Monitorear el uso de la API key
- ✅ Configurar alertas de uso excesivo

### Evitar:

- ❌ Usar la API key sin restricciones
- ❌ Compartir la API key públicamente
- ❌ Habilitar APIs innecesarias

## 📞 Soporte

Si continúas teniendo problemas:

1. **Verifica la configuración** siguiendo este documento paso a paso
2. **Revisa la consola del navegador** para errores específicos
3. **Consulta la documentación oficial**:
   https://developers.google.com/maps/documentation/javascript/error-messages
4. **Contacta con Google Cloud Support** si es necesario

## 🎯 Próximos Pasos

Una vez que Google Maps funcione correctamente:

1. **Probar la funcionalidad** en la aplicación Next.js
2. **Implementar rutas optimizadas** usando Directions API
3. **Agregar geolocalización** del usuario
4. **Optimizar el rendimiento** de los mapas
5. **Implementar caché** para direcciones frecuentes

---

**¡Con esta configuración, Google Maps debería funcionar perfectamente en tu aplicación! 🚀**
