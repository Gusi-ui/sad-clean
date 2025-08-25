# 🔧 Configuración de GitHub Secrets - Paso 2

## 📋 **Secrets Necesarios para Builds Automáticos**

### **2.1 Acceder a la Configuración de Secrets**

1. **Ir a GitHub**: `https://github.com/Gusi-ui/sad-clean`
2. **Ir a Settings**: Click en "Settings" (pestaña superior)
3. **Ir a Secrets**: En el menú lateral, click en "Secrets and variables" > "Actions"
4. **Agregar Secrets**: Click en "New repository secret"

### **2.2 Secrets a Configurar**

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
# Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdmlmd2ZtdmhienRwcmFrZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODU4MTUsImV4cCI6MjA2OTM2MTgxNX0.eVWp6w2YR4H0XtWJwrsXyfOhGZ4PdNRTQBtGPr9zgbo
# Descripción: Clave anónima de Supabase
```

### **2.3 Pasos Detallados**

#### **Paso 1: Obtener EXPO_TOKEN**

1. **Ir a**: https://expo.dev/accounts/gusideveloper/settings/access-tokens
2. **Click**: "Create token"
3. **Nombre**: "GitHub Actions"
4. **Copiar**: El token generado

#### **Paso 2: Configurar EXPO_TOKEN en GitHub**

1. **Nombre del secret**: `EXPO_TOKEN`
2. **Valor**: [Token obtenido del paso anterior]
3. **Click**: "Add secret"

#### **Paso 3: Configurar SUPABASE_URL**

1. **Nombre del secret**: `SUPABASE_URL`
2. **Valor**: `https://mfvifwfmvhbztprakeaj.supabase.co`
3. **Click**: "Add secret"

#### **Paso 4: Configurar SUPABASE_ANON_KEY**

1. **Nombre del secret**: `SUPABASE_ANON_KEY`
2. **Valor**:
   `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdmlmd2ZtdmhienRwcmFrZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODU4MTUsImV4cCI6MjA2OTM2MTgxNX0.eVWp6w2YR4H0XtWJwrsXyfOhGZ4PdNRTQBtGPr9zgbo`
3. **Click**: "Add secret"

### **2.4 Verificar Configuración**

Después de configurar los secrets:

1. **Ir a Actions**: `https://github.com/Gusi-ui/sad-clean/actions`
2. **Verificar workflow**: "Build Mobile APK" debería aparecer
3. **Hacer push**: `git push origin mobile-app`
4. **Verificar build**: El workflow se ejecutará automáticamente

### **2.5 Alternativa: Build Local**

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
