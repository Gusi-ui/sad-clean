# 🚨 Solución de Problemas en Producción

## Error: "API key de Google Maps no configurada"

### 🔍 Diagnóstico Rápido

Si ves este error en producción pero funciona en local, significa que las variables de entorno no
están configuradas correctamente en tu plataforma de despliegue.

### 🛠️ Solución Paso a Paso

#### 1. Verificar Variables Locales

```bash
# Ejecuta este comando en tu proyecto local
node scripts/verify-env-config.js
```

#### 2. Acceder a la Página de Diagnóstico

Ve a: `https://tu-dominio.com/debug-env`

**⚠️ IMPORTANTE:** Esta página muestra información sensible. Elimínala después de verificar.

#### 3. Configurar Variables en Producción

##### Para Vercel:

1. Ve a [vercel.com](https://vercel.com) → tu proyecto
2. Settings → Environment Variables
3. Agrega:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = tu_api_key_real
   NEXT_PUBLIC_SUPABASE_URL = tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_supabase_anon_key
   NEXT_PUBLIC_APP_URL = https://tu-dominio.vercel.app
   ```
4. Selecciona: Production, Preview, Development
5. Redespliega

##### Para Netlify:

1. Ve a [netlify.com](https://netlify.com) → tu sitio
2. Site settings → Environment variables
3. Agrega las mismas variables
4. Redespliega

##### Para Railway:

1. Ve a [railway.app](https://railway.app) → tu proyecto
2. Variables tab
3. Agrega las variables
4. Redespliega automáticamente

#### 4. Verificar en Producción

```bash
# Si tienes acceso SSH al servidor
node scripts/check-production-env.js
```

### 🔧 Comandos de Verificación

#### Verificación Local

```bash
# Verificar configuración local
node scripts/verify-env-config.js

# Verificar como si fuera producción (sin .env.local)
NODE_ENV=production node scripts/check-production-env.js
```

#### Verificación en Producción

```bash
# Usando CLI de tu plataforma

# Vercel
vercel env ls

# Netlify
netlify env:list

# Railway
railway variables

# Heroku
heroku config --app tu-app-name
```

### 🚀 Lista de Verificación Completa

- [ ] ✅ Variables configuradas en local (`.env.local`)
- [ ] ✅ Variables configuradas en plataforma de despliegue
- [ ] ✅ API Key de Google Maps válida (empieza con "AIza")
- [ ] ✅ Dominios autorizados en Google Cloud Console
- [ ] ✅ Aplicación redesplegada después de configurar variables
- [ ] ✅ Página `/debug-env` muestra variables correctas
- [ ] ✅ Error resuelto en producción
- [ ] 🗑️ Página `/debug-env` eliminada por seguridad

### 🔍 Herramientas de Diagnóstico Incluidas

1. **Script de Verificación Local**

   ```bash
   node scripts/verify-env-config.js
   ```

2. **Script de Verificación de Producción**

   ```bash
   node scripts/check-production-env.js
   ```

3. **Página de Diagnóstico Web**
   - URL: `/debug-env`
   - ⚠️ Solo para diagnóstico temporal

### 🆘 Si Aún No Funciona

#### Verificar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Selecciona tu API Key
4. Verifica que estos dominios están autorizados:
   - `localhost:3000` (desarrollo)
   - `tu-dominio.vercel.app` (producción)
   - `*.vercel.app` (previews)

#### Verificar Restricciones de API

1. En Google Cloud Console
2. APIs & Services → Credentials → tu API Key
3. API restrictions → Asegúrate de que estén habilitadas:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Places API (si la usas)

#### Logs de Depuración

```bash
# Ver logs en tiempo real (Vercel)
vercel logs tu-proyecto --follow

# Ver logs (Netlify)
netlify logs:function

# Ver logs (Railway)
railway logs
```

### 📞 Contacto y Recursos

- 📖 [DEPLOYMENT-ENV-SETUP.md](./DEPLOYMENT-ENV-SETUP.md) - Guía completa de configuración
- 🗺️ [GOOGLE-MAPS-SETUP-DETAILED.md](./GOOGLE-MAPS-SETUP-DETAILED.md) - Configuración de Google Maps
- 🔧 [GOOGLE-MAPS-TROUBLESHOOTING.md](./GOOGLE-MAPS-TROUBLESHOOTING.md) - Solución de problemas
  específicos

---

**💡 Tip:** Guarda este archivo como referencia para futuros despliegues.
