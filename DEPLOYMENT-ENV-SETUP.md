# 🚀 Configuración de Variables de Entorno para Producción

## 📋 Problema Identificado

El error
`"API key de Google Maps no configurada. Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env"`
indica que la variable de entorno `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` no está disponible en el entorno
de producción.

## 🚀 Configuración por Plataforma

### Vercel

```bash
# Usando Vercel CLI
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Pega tu API key cuando se solicite

# Configurar múltiples variables a la vez
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL

# O desde el dashboard de Vercel:
# 1. Ve a tu proyecto en vercel.com
# 2. Settings → Environment Variables
# 3. Agrega todas las variables NEXT_PUBLIC_*
# 4. Asegúrate de seleccionar Production, Preview y Development
```

### Netlify

```bash
# Usando Netlify CLI
netlify env:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY "tu_api_key_aqui"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "tu_supabase_url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "tu_supabase_anon_key"
netlify env:set NEXT_PUBLIC_APP_URL "https://tu-dominio.netlify.app"

# O desde el dashboard de Netlify:
# 1. Ve a tu sitio en netlify.com
# 2. Site settings → Environment variables
# 3. Agrega todas las variables NEXT_PUBLIC_*
```

### Railway

```bash
# Usando Railway CLI
railway variables set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui"
railway variables set NEXT_PUBLIC_SUPABASE_URL="tu_supabase_url"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key"
railway variables set NEXT_PUBLIC_APP_URL="https://tu-dominio.railway.app"

# O desde el dashboard de Railway:
# 1. Ve a tu proyecto en railway.app
# 2. Variables tab
# 3. Agrega todas las variables NEXT_PUBLIC_*
```

### Heroku

```bash
# Usando Heroku CLI
heroku config:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui" --app tu-app-name
heroku config:set NEXT_PUBLIC_SUPABASE_URL="tu_supabase_url" --app tu-app-name
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key" --app tu-app-name
heroku config:set NEXT_PUBLIC_APP_URL="https://tu-app-name.herokuapp.com" --app tu-app-name

# O desde el dashboard de Heroku:
# 1. Ve a tu app en dashboard.heroku.com
# 2. Settings → Config Vars
# 3. Agrega todas las variables NEXT_PUBLIC_*
```

### DigitalOcean App Platform

```bash
# Desde el dashboard de DigitalOcean:
# 1. Ve a tu app en cloud.digitalocean.com
# 2. Settings → App-Level Environment Variables
# 3. Agrega todas las variables NEXT_PUBLIC_*
# 4. Redespliega la aplicación
```

### Render

```bash
# Desde el dashboard de Render:
# 1. Ve a tu servicio en render.com
# 2. Environment → Environment Variables
# 3. Agrega todas las variables NEXT_PUBLIC_*
# 4. Redespliega automáticamente
```

## 🔑 Configuración de Google Maps API Key para Producción

### 1. Actualizar Restricciones de Dominio

En Google Cloud Console:

1. Ve a **"APIs & Services" > "Credentials"**
2. Edita tu API key
3. En **"Application restrictions"** agrega tu dominio de producción:

```
# Para Vercel
https://tu-proyecto.vercel.app
https://tu-dominio-personalizado.com

# Para Netlify
https://tu-sitio.netlify.app
https://tu-dominio-personalizado.com

# Mantén también los de desarrollo
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001
```

### 2. Verificar APIs Habilitadas

Asegúrate de que estas APIs estén habilitadas:

- ✅ **Maps JavaScript API**
- ✅ **Geocoding API**
- ✅ **Directions API**

## 🧪 Verificación del Despliegue

### 1. Verificar Variables en Producción

Puedes crear una página temporal para verificar que las variables estén disponibles:

```typescript
// pages/debug-env.tsx (eliminar después de verificar)
export default function DebugEnv() {
  return (
    <div>
      <h1>Debug Environment Variables</h1>
      <p>Google Maps API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada'}</p>
      <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}</p>
      <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'No configurada'}</p>
    </div>
  );
}
```

### 2. Verificar en la Consola del Navegador

En producción, abre las herramientas de desarrollador y verifica:

```javascript
// En la consola del navegador
console.log('Google Maps API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

## 🔒 Consideraciones de Seguridad

### Variables Públicas vs Privadas

**Variables PÚBLICAS** (prefijo `NEXT_PUBLIC_`):

- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`

**Variables PRIVADAS** (solo server-side):

- 🔒 `SUPABASE_SERVICE_ROLE_KEY`
- 🔒 `NEXTAUTH_SECRET`
- 🔒 `DATABASE_URL`

### Protección de la API Key

1. **Restricciones de Dominio**: Siempre configura dominios específicos
2. **Restricciones de API**: Solo habilita las APIs necesarias
3. **Monitoreo**: Revisa el uso regularmente en Google Cloud Console
4. **Rotación**: Cambia la API key periódicamente

## 🚨 Solución de Problemas

### Error: "API key de Google Maps no configurada"

1. ✅ Verifica que la variable esté configurada en tu plataforma de despliegue
2. ✅ Confirma que el nombre sea exactamente `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. ✅ Redespliega la aplicación después de agregar las variables
4. ✅ Verifica que no haya espacios extra en el valor

### Error: "RefererNotAllowedMapError"

1. ✅ Agrega tu dominio de producción a las restricciones de la API key
2. ✅ No uses `/*` al final de las URLs
3. ✅ Espera unos minutos para que los cambios se propaguen

### Error: "REQUEST_DENIED"

1. ✅ Verifica que las APIs estén habilitadas en Google Cloud Console
2. ✅ Confirma que la API key tenga permisos para las APIs necesarias

## 📋 Checklist de Despliegue

Antes de desplegar a producción:

- [ ] ✅ Variables de entorno configuradas en la plataforma de despliegue
- [ ] ✅ API key de Google Maps configurada
- [ ] ✅ Dominio de producción agregado a las restricciones de Google Maps
- [ ] ✅ APIs de Google Maps habilitadas
- [ ] ✅ Variables de Supabase configuradas
- [ ] ✅ NEXTAUTH_SECRET configurado
- [ ] ✅ URLs de producción actualizadas
- [ ] ✅ Página de debug temporal creada (opcional)
- [ ] ✅ Despliegue realizado
- [ ] ✅ Funcionalidad verificada en producción
- [ ] ✅ Página de debug eliminada

## 📞 Soporte

Si continúas teniendo problemas:

1. **Verifica los logs** de tu plataforma de despliegue
2. **Revisa la consola del navegador** en producción
3. **Confirma la configuración** de Google Cloud Console
4. **Contacta al soporte** de tu plataforma de despliegue si es necesario

---

**¡Con esta configuración, tu aplicación debería funcionar correctamente en producción! 🚀**
