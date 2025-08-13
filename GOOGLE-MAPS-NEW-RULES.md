# 🆕 Nuevas Reglas de Google Maps API - URLs de Referencia HTTP

## 📋 Cambios Importantes

Google ha actualizado las reglas para las URLs de referencia HTTP en Google Cloud Console. Las
siguientes reglas son **obligatorias** para que tu API key funcione correctamente.

## 🔧 Reglas Actualizadas

### ✅ URLs Permitidas

```
http://localhost:8080
http://localhost:3001
http://127.0.0.1:8080
http://127.0.0.1:3001
https://tu-dominio.com
https://www.tu-dominio.com
```

### ❌ URLs NO Permitidas

```
http://localhost:8080/*          ❌ NO usar /* al final
http://localhost:3001/*          ❌ NO usar /* al final
http://localhost:8080/test.html  ❌ NO usar rutas específicas
http://localhost:3001/api        ❌ NO usar parámetros de consulta
```

## 📝 Ejemplos de Configuración Correcta

### Para Desarrollo Local:

```
http://localhost:8080
http://localhost:3001
http://127.0.0.1:8080
http://127.0.0.1:3001
```

### Para Producción:

```
https://tu-dominio.com
https://www.tu-dominio.com
```

### Para Subdominios:

```
https://app.tu-dominio.com
https://api.tu-dominio.com
```

## ⚠️ Restricciones Importantes

1. **NO se admiten parámetros de consulta** (`?param=value`)
2. **NO se admiten fragmentos** (`#section`)
3. **NO se admiten rutas específicas** (`/path/to/file`)
4. **NO se admiten comodines** (`/*`) al final de las URLs
5. **Solo se admiten dominios y puertos específicos**

## 🔄 Pasos para Actualizar tu Configuración

### 1. Acceder a Google Cloud Console

- Ve a: https://console.cloud.google.com/
- Selecciona tu proyecto

### 2. Editar la API Key

- Ve a "APIs & Services" > "Credentials"
- Encuentra tu API key: `AIzaSyDJO-K651Oj7Pkh_rVHGw0hmPb7NtQCozQ`
- Haz clic para editarla

### 3. Configurar HTTP Referrers

- En "Application restrictions" selecciona "HTTP referrers (web sites)"
- **ELIMINA** todas las URLs que contengan `/*`
- **AGREGA** estas URLs correctas:

```
http://localhost:8080
http://localhost:3001
http://127.0.0.1:8080
http://127.0.0.1:3001
```

### 4. Guardar Cambios

- Haz clic en "Save"
- Espera unos minutos para que los cambios se propaguen

## 🧪 Verificar la Configuración

### Archivo de Test Actualizado:

- Abre: http://localhost:8080/test-google-maps-simple.html
- Haz clic en "Verificar API Key"
- Prueba los botones de test

### Aplicación Next.js:

- Ve a: http://localhost:3001/worker-dashboard/route
- Haz clic en "📍 Mostrar Mapa"

## 🚨 Errores Comunes

### Error: "RefererNotAllowedMapError"

**Causa:** URLs con `/*` o rutas específicas **Solución:** Usar solo dominios y puertos

### Error: "REQUEST_DENIED"

**Causa:** APIs no habilitadas **Solución:** Habilitar Maps JavaScript, Geocoding, Directions APIs

## 📚 Documentación Oficial

Para más información, consulta la documentación oficial de Google:

- [Restringir claves de API](https://cloud.google.com/docs/apis/api-security/api-keys#restrict_http)
- [Mensajes de error de Google Maps](https://developers.google.com/maps/documentation/javascript/error-messages)

## 🎯 Resumen

**ANTES:**

```
http://localhost:8080/*
http://localhost:3001/*
```

**AHORA:**

```
http://localhost:8080
http://localhost:3001
```

**¡Recuerda: NO uses `/*` al final de las URLs!**

---

**Con estas nuevas reglas, tu API key de Google Maps debería funcionar correctamente. 🚀**
