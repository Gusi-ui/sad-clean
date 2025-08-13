# 🔧 Solución de Problemas - Google Maps

## 🚨 Problema: Mapa no carga (ERR_BLOCKED_BY_CLIENT)

### Síntomas

- El mapa se queda en "Cargando..." indefinidamente
- Error en consola: `ERR_BLOCKED_BY_CLIENT`
- No aparecen errores específicos de Google Maps

### Causas Comunes

#### 1. **Bloqueador de Anuncios (Ad Blocker)**

El error `ERR_BLOCKED_BY_CLIENT` indica que un bloqueador está interfiriendo.

**Solución:**

- Desactiva temporalmente tu bloqueador de anuncios
- Agrega `localhost:3000` a la lista blanca
- O usa modo incógnito sin extensiones

#### 2. **Configuración de Dominios en Google Cloud Console**

Los dominios autorizados no están configurados correctamente.

**Solución:**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs & Services" > "Credentials"
4. Edita tu API key
5. En "Application restrictions" selecciona "HTTP referrers"
6. Agrega estos dominios (SIN `/*` al final):
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   https://tu-dominio.com
   ```

#### 3. **APIs No Habilitadas**

Las APIs necesarias no están habilitadas en Google Cloud Console.

**Solución:**

1. Ve a "APIs & Services" > "Library"
2. Busca y habilita estas APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (opcional)

#### 4. **API Key No Configurada**

La variable de entorno no está configurada correctamente.

**Solución:**

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega tu API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```
3. Reinicia el servidor de desarrollo

## 🔍 Diagnóstico Automático

El componente ahora incluye diagnóstico automático que muestra:

- ✅ Estado de la API key
- ✅ Disponibilidad de Google Maps
- ⚠️ Detección de posibles bloqueadores

## 🛠️ Pasos de Verificación

### 1. Verificar Configuración

```bash
# Verifica que la API key esté configurada
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

### 2. Verificar APIs Habilitadas

En Google Cloud Console, verifica que estas APIs estén habilitadas:

- ✅ Maps JavaScript API
- ✅ Geocoding API

### 3. Verificar Dominios Autorizados

En la configuración de tu API key, verifica que tengas:

```
http://localhost:3000
http://127.0.0.1:3000
```

### 4. Verificar Bloqueadores

- Desactiva temporalmente uBlock Origin, AdBlock Plus, etc.
- Prueba en modo incógnito
- Verifica las extensiones del navegador

## 🧪 Test Manual

Puedes probar tu configuración manualmente:

1. Abre el archivo `test-google-maps-simple.html` en tu navegador
2. Haz clic en "Verificar API Key"
3. Haz clic en "Test Map"
4. Si funciona, el problema está en la aplicación
5. Si no funciona, el problema está en la configuración

## 📱 Solución para Móviles

En dispositivos móviles, también verifica:

- Bloqueadores de anuncios en el navegador móvil
- Configuración de red (WiFi vs datos móviles)
- Modo de ahorro de datos

## 🔄 Reinicio Completo

Si nada funciona, intenta:

1. **Limpiar caché del navegador**
2. **Reiniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
3. **Verificar archivo .env.local**
4. **Probar en otro navegador**

## 📞 Soporte

Si el problema persiste:

1. Revisa los logs de la consola del navegador
2. Verifica la pestaña Network en DevTools
3. Comprueba que no haya errores de CORS
4. Verifica que la API key tenga cuota disponible

## 🎯 Configuración Recomendada

### Google Cloud Console

```
APIs Habilitadas:
✅ Maps JavaScript API
✅ Geocoding API
✅ Places API (opcional)

Dominios Autorizados:
✅ http://localhost:3000
✅ http://127.0.0.1:3000
✅ https://tu-dominio-produccion.com

Restricciones:
✅ HTTP referrers (no IP addresses)
❌ NO usar /* al final de las URLs
```

### Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDJO-K651Oj7Pkh_rVHGw0hmPb7NtQCozQ
```

### Navegador

```
Extensiones Desactivadas:
❌ uBlock Origin
❌ AdBlock Plus
❌ Ghostery
❌ Privacy Badger

Modo de Prueba:
✅ Modo incógnito
✅ Sin extensiones
✅ Caché limpiado
```

## ✅ Checklist de Verificación

- [ ] API key configurada en `.env.local`
- [ ] APIs habilitadas en Google Cloud Console
- [ ] Dominios autorizados configurados
- [ ] Bloqueadores de anuncios desactivados
- [ ] Servidor de desarrollo reiniciado
- [ ] Caché del navegador limpiado
- [ ] Prueba en modo incógnito
- [ ] Verificación en `test-google-maps-simple.html`

## 🚀 Una vez Solucionado

Cuando Google Maps funcione correctamente:

1. El mapa se cargará automáticamente
2. Verás marcadores en las ubicaciones de las paradas
3. Podrás hacer zoom y navegar por el mapa
4. Los marcadores mostrarán información al hacer hover

¡Disfruta de tu mapa funcional! 🗺️
