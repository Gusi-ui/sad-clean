# 🛠️ CONFIGURACIÓN DEL ENTORNO - SAD LAS

## 🚨 ERROR ACTUAL: `supabaseKey is required`

Si estás viendo el error `supabaseKey is required`, significa que necesitas configurar las variables
de entorno de Supabase.

## 📋 PASOS PARA SOLUCIONAR

### 1. Obtener las credenciales de Supabase

Ve a tu [Dashboard de Supabase](https://app.supabase.com) y:

1. Selecciona tu proyecto
2. Ve a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** (termina en `.supabase.co`)
   - **anon/public key**
   - **service_role key** (⚠️ **MUY IMPORTANTE**: Esta clave es privada)

### 2. Crear archivo de variables de entorno

Crea un archivo llamado `.env.local` en la raíz del proyecto:

```bash
# Crear el archivo
touch .env.local
```

### 3. Configurar las variables

Edita el archivo `.env.local` y agrega:

```env
# ============================================================================
# SUPABASE CONFIGURATION - REQUERIDO
# ============================================================================

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co

# Clave anónima (pública) - COPIA DE TU DASHBOARD
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave de servicio (privada) - COPIA DE TU DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Reiniciar el servidor

Después de configurar las variables, reinicia el servidor:

```bash
# Detener el servidor actual (Ctrl+C si está ejecutándose)
# Luego reiniciar
npm run dev
```

## 🔍 VERIFICACIÓN

Para verificar que las variables están configuradas correctamente:

### Opción 1: Verificar en la consola del navegador

```javascript
// Abre la consola del navegador (F12) y ejecuta:
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Supabase Key:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "✅ Configurada"
    : "❌ No configurada",
);
```

### Opción 2: Verificar en el servidor

```javascript
// En la consola del servidor deberías ver:
✅ WARNING: Using placeholder Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file
✅ WARNING: Using placeholder Supabase key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file
```

## ⚠️ NOTAS IMPORTANTES

1. **Nunca** subas el archivo `.env.local` al repositorio (ya está en `.gitignore`)
2. La **service_role key** es muy sensible - solo úsala en el servidor
3. Si cambias las variables, **reinicia el servidor**
4. Las variables con `NEXT_PUBLIC_` están disponibles en el navegador

## 🔧 CONFIGURACIÓN COMPLETA

Para una configuración completa, tu `.env.local` debería verse así:

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Google Maps (opcional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps

# Características
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## 🎯 PRUEBA FINAL

Después de configurar todo:

1. **Reinicia el servidor**: `npm run dev`
2. **Ve al navegador**: `http://localhost:3001`
3. **Verifica que no hay errores** en la consola
4. **Prueba el sistema de notificaciones** con el script del navegador

## 📞 AYUDA ADICIONAL

Si sigues teniendo problemas:

1. Verifica que las claves de Supabase sean correctas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Revisa la consola del navegador y del servidor por errores específicos
4. Verifica que no haya espacios extra o caracteres especiales en las variables

## ✅ CONFIRMACIÓN DE ÉXITO

Cuando todo esté configurado correctamente, deberías ver:

- ✅ La aplicación carga sin errores
- ✅ No hay warnings sobre "placeholder" en la consola
- ✅ El sistema de notificaciones funciona
- ✅ Los workers se cargan correctamente

¡El sistema está listo para funcionar! 🚀
