# 🚀 Configuración del Super Administrador - SAD gusi

## 🐛 Problema Identificado

**Error:** `Invalid API key` al acceder al dashboard de super administrador.

**Causa:** Las variables de entorno de Supabase no estaban configuradas correctamente.

## ✅ Solución Implementada

### 1. Variables de Entorno Configuradas

Se ha creado el archivo `.env.local` con las variables necesarias:

```bash
# Archivo creado: .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_clave_anonima]
SUPABASE_SERVICE_ROLE_KEY=[tu_clave_servicio]
```

### 2. Scripts de Ayuda Creados

#### 📋 Verificación de Configuración

```bash
node check-supabase-config.js
```

#### 🔐 Reset de Contraseña del Super Admin

```bash
node reset-super-admin-password.js
```

## 📝 Pasos para Solucionar el Problema

### Opción A: Usar Supabase Local (Recomendado para desarrollo)

1. **Instalar Docker** (si no lo tienes):

   ```bash
   # macOS con Homebrew
   brew install --cask docker

   # O descarga desde: https://www.docker.com/products/docker-desktop
   ```

2. **Iniciar Supabase localmente**:

   ```bash
   supabase start
   ```

3. **Verificar configuración**:

   ```bash
   node check-supabase-config.js
   ```

4. **Reiniciar la aplicación**:
   ```bash
   npm run dev
   ```

### Opción B: Usar Supabase en la Nube

1. **Ve a tu proyecto Supabase**:
   - URL: https://supabase.com/dashboard
   - Selecciona tu proyecto SAD gusi

2. **Obtener las claves API**:
   - Ve a **Settings > API**
   - Copia:
     - **Project URL**
     - **anon/public key**
     - **service_role key**

3. **Actualizar `.env.local`**:
   ```bash
   # Reemplaza estos valores con los reales de tu proyecto
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_real
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio_real
   ```

## 🔑 Configuración del Super Administrador

### Usuario por Defecto

- **Email:** conectomail@gmail.com
- **Rol:** super_admin
- **Estado:** Protegido (no se puede eliminar)

### Cambiar Contraseña

#### 🚨 Problema Identificado: Token de Recuperación

Si al intentar resetear desde Supabase te redirige a `localhost:3000` en lugar de `localhost:3001`,
sigue estas soluciones:

#### ✅ Solución 1: Página Dedicada (Recomendada)

1. **Inicia la aplicación:**

   ```bash
   npm run dev
   ```

2. **Ve a la página de reset:**

   ```
   http://localhost:3001/auth/reset-password
   ```

3. **O usa la URL completa con tu token:**
   ```
   http://localhost:3001/auth/reset-password?access_token=[TU_TOKEN]&refresh_token=[TU_REFRESH_TOKEN]&expires_at=[EXPIRATION]&expires_in=3600&type=recovery
   ```

#### ✅ Solución 2: Script Automático

```bash
node process-recovery-token.js
```

Este script procesa automáticamente tu token de recuperación.

#### ✅ Solución 3: Corregir Configuración de Supabase

**Para Supabase Local:**

- Archivo actualizado: `supabase/config.toml`
- URLs corregidas a puerto 3001

**Para Supabase Cloud:**

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto SAD gusi
3. Ve a **Settings > Authentication**
4. Actualiza **Site URL:** `http://localhost:3001`
5. Actualiza **Redirect URLs:** `http://localhost:3001`
6. Guarda los cambios

#### Método 4: Desde Supabase Dashboard (Original)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication > Users**
4. Busca "conectomail@gmail.com"
5. Haz clic en **Reset password**
6. Establece una nueva contraseña segura

#### Método 5: Script Interactivo (Alternativo)

```bash
node reset-super-admin-password.js
```

Requiere que configures las variables de entorno primero.

## 🧪 Verificación

### 1. Verificar Configuración

```bash
node check-supabase-config.js
```

### 2. Reiniciar Aplicación

```bash
npm run dev
```

### 3. Probar Acceso

1. Ve a http://localhost:3001
2. Inicia sesión con:
   - Email: conectomail@gmail.com
   - Contraseña: [tu nueva contraseña]
3. Ve al dashboard de super admin
4. Verifica que ya no aparezca el error "Invalid API key"

## 🚨 Solución de Problemas

### Error: "Invalid API key"

- ✅ Verifica que las variables en `.env.local` sean correctas
- ✅ Reinicia la aplicación después de cambiar variables
- ✅ Asegúrate de que Supabase esté ejecutándose (local o remoto)

### Error: "Super administrador no encontrado"

- ✅ Verifica que el usuario "conectomail@gmail.com" existe en Supabase
- ✅ Revisa que tenga el rol correcto en `user_metadata.role`

### Error: "Docker no está ejecutándose"

- ✅ Instala Docker Desktop
- ✅ Inicia Docker
- ✅ Ejecuta `supabase start`

## 📊 Estado Actual

- ✅ Archivo `.env.local` creado y configurado
- ✅ Scripts de ayuda implementados
- ✅ Documentación completa preparada
- ✅ Configuración lista para ambos modos (local/cloud)

## 🎯 Próximos Pasos

1. **Configura tus credenciales reales** de Supabase
2. **Cambia la contraseña** del super administrador
3. **Reinicia la aplicación**
4. **Verifica el funcionamiento** del dashboard

---

**¿Necesitas ayuda?** Ejecuta `node check-supabase-config.js` para verificar tu configuración
actual.

_Documentación creada para SAD gusi - Sistema de Asistencia Domiciliaria_ 🦡
