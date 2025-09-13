# 🔧 Configuración de GitHub Secrets - Paso 2

## 📋 **Secrets Necesarios para Builds Automáticos**

### **2.1 Acceder a la Configuración de Secrets**

1. **Ir a GitHub**: `https://github.com/Gusi-ui/sad-clean`
2. **Ir a Settings**: Click en "Settings" (pestaña superior)
3. **Ir a Secrets**: En el menú lateral, click en "Secrets and variables" > "Actions"
4. **Agregar Secrets**: Click en "New repository secret"

### **2.2 Secrets a Configurar**

#### **KEYSTORE_PASSWORD** (Requerido para firma del APK)

```bash
# Valor: sadlas2024
# Descripción: Contraseña del archivo keystore (.jks)
# Uso: Protege el archivo keystore completo
```

#### **KEY_ALIAS** (Requerido para firma del APK)

```bash
# Valor: sadlasworker
# Descripción: Alias de la clave dentro del keystore
# Uso: Identifica la clave específica dentro del keystore
```

#### **KEY_PASSWORD** (Requerido para firma del APK)

```bash
# Valor: sadlas2024
# Descripción: Contraseña de la clave específica
# Uso: Protege la clave individual dentro del keystore
```

#### **EXPO_TOKEN** (Opcional para builds en la nube)

```bash
# Valor: Tu token de Expo
# Descripción: Token para builds automáticos en EAS
# Cómo obtenerlo:
# 1. Ir a https://expo.dev/accounts/gusideveloper/settings/access-tokens
# 2. Click en "Create token"
# 3. Nombre: "GitHub Actions"
# 4. Copiar el token generado
```

#### **SUPABASE_URL** (Recomendado)

```bash
# Valor: https://mfvifwfmvhbztprakeaj.supabase.co
# Descripción: URL del proyecto Supabase
```

#### **SUPABASE_ANON_KEY** (Recomendado)

```bash
# Valor: [TU_SUPABASE_ANON_KEY_AQUI]
# Descripción: Clave anónima de Supabase
# Cómo obtenerlo:
# 1. Ir a tu proyecto Supabase
# 2. Ir a Settings > API
# 3. Copiar el valor de "anon" key
```

### **2.3 Pasos Detallados para Configurar Secrets**

#### **Paso 1: Configurar KEYSTORE_PASSWORD**

1. **Nombre del secret**: `KEYSTORE_PASSWORD`
2. **Valor**: `sadlas2024`
3. **Click**: "Add secret"

#### **Paso 2: Configurar KEY_ALIAS**

1. **Nombre del secret**: `KEY_ALIAS`
2. **Valor**: `sadlasworker`
3. **Click**: "Add secret"

#### **Paso 3: Configurar KEY_PASSWORD**

1. **Nombre del secret**: `KEY_PASSWORD`
2. **Valor**: `sadlas2024`
3. **Click**: "Add secret"

#### **Paso 4: Configurar EXPO_TOKEN (Opcional)**

1. **Ir a**: https://expo.dev/accounts/gusideveloper/settings/access-tokens
2. **Click**: "Create token"
3. **Nombre**: "GitHub Actions"
4. **Copiar**: El token generado
5. **Nombre del secret**: `EXPO_TOKEN`
6. **Valor**: [Token obtenido del paso anterior]
7. **Click**: "Add secret"

#### **Paso 5: Configurar SUPABASE_URL**

1. **Nombre del secret**: `SUPABASE_URL`
2. **Valor**: `https://mfvifwfmvhbztprakeaj.supabase.co`
3. **Click**: "Add secret"

#### **Paso 6: Configurar SUPABASE_ANON_KEY**

1. **Nombre del secret**: `SUPABASE_ANON_KEY`
2. **Valor**: `[TU_SUPABASE_ANON_KEY_AQUI]`
3. **Click**: "Add secret"

### **2.4 Regenerar el APK**

#### **Método 1: Ejecutar Workflow Manualmente**

1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow **"Build Mobile APK"**
3. Haz clic en **"Run workflow"**
4. Selecciona la rama `mobile-app`
5. Haz clic en **"Run workflow"**

#### **Método 2: Push a la rama mobile-app**

```bash
# Cambiar a la rama mobile-app
git checkout mobile-app

# Hacer un cambio menor para triggear el build
echo "# APK signing configuration completed" >> README.md
git add README.md
git commit -m "fix: Configure APK signing with proper keystore secrets"
git push origin mobile-app
```

### **2.5 Verificar Configuración y Build**

#### **Verificar Secrets Configurados**

Después de agregar todos los secrets, deberías ver:

- ✅ KEYSTORE_PASSWORD
- ✅ KEY_ALIAS
- ✅ KEY_PASSWORD
- ✅ EXPO_TOKEN (opcional)
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY

#### **Monitorear el Build**

1. **Ir a Actions**: `https://github.com/Gusi-ui/sad-clean/actions`
2. **Verificar workflow**: "Build Mobile APK" debería aparecer
3. **Monitorear logs**: Verificar que no hay errores de firma
4. **Verificar release**: El APK se generará automáticamente

#### **Verificar Firma del APK**

El nuevo APK debería:

- ✅ Instalarse sin problemas en dispositivos Android
- ✅ Contener archivos de firma en META-INF
- ✅ Estar firmado con el keystore de producción

### **2.6 Alternativa: Build Local**

Si no quieres configurar los secrets ahora:

```bash
# Build local sin secrets
cd mobile-app
npm run build:android-apk
```

## 🎯 **Beneficios de Configurar Secrets**

- ✅ **Builds automáticos** en cada push
- ✅ **APK generado** automáticamente
- ✅ **Releases automáticos** en GitHub
- ✅ **CI/CD completo** para móvil

## 📞 **Soporte**

Si tienes problemas:

1. Verificar que los secrets están configurados correctamente
2. Revisar los logs del workflow en GitHub Actions
3. Crear issue con etiqueta `mobile-app`
