# 🔐 Guía Actualizada: Configuraciones de Autenticación en Supabase

## 📍 Ubicaciones Actuales de las Configuraciones

### **1. Leaked Password Protection**

#### **Ubicación Actual:**

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Settings** (Configuración)
3. Busca la sección **"Password Policy"** o **"Password Requirements"**
4. Busca la opción **"Prevent use of compromised passwords"** o **"Check against breached
   passwords"**

#### **Alternativas si no encuentras la opción:**

- Busca en **"Security"** o **"Advanced Settings"**
- Revisa la sección **"Password Strength"**
- Busca **"HaveIBeenPwned"** o **"Breach Check"**

### **2. Multi-Factor Authentication (MFA)**

#### **Ubicación Actual:**

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Settings** (Configuración)
3. Busca la sección **"Multi-Factor Authentication"** o **"MFA"**
4. Habilita las opciones disponibles:
   - **TOTP** (Time-based One-Time Password)
   - **SMS** (si está disponible)
   - **Email** (si está disponible)

#### **Si no encuentras MFA:**

- Busca en **"Security"** o **"Advanced"**
- Revisa **"User Management"** → **"Security"**
- Busca **"Two-Factor Authentication"** o **"2FA"**

## 🔍 Pasos de Verificación

### **Paso 1: Verificar Configuración Actual**

1. Ve a **Authentication** → **Settings**
2. Revisa todas las secciones disponibles
3. Toma nota de las opciones que encuentres

### **Paso 2: Buscar Configuraciones de Seguridad**

1. Busca secciones como:
   - **Security**
   - **Password Policy**
   - **Advanced Settings**
   - **User Management**

### **Paso 3: Verificar en Diferentes Ubicaciones**

1. **Authentication** → **Settings**
2. **Authentication** → **Users** → **Settings**
3. **Settings** (nivel de proyecto) → **Authentication**
4. **Security** → **Authentication**

## 📋 Configuraciones Recomendadas

### **Password Security:**

- ✅ **Minimum password length**: 8 caracteres
- ✅ **Require uppercase letters**: Sí
- ✅ **Require lowercase letters**: Sí
- ✅ **Require numbers**: Sí
- ✅ **Require special characters**: Sí
- ✅ **Prevent use of compromised passwords**: Sí (si está disponible)

### **Multi-Factor Authentication:**

- ✅ **Enable TOTP**: Sí
- ✅ **Enable SMS** (opcional): Sí
- ✅ **Enable Email** (opcional): Sí
- ✅ **Require MFA for all users**: Considerar según necesidades

### **Session Management:**

- ✅ **Session timeout**: 24 horas o menos
- ✅ **Refresh token rotation**: Habilitado
- ✅ **Secure cookie settings**: Habilitado

## 🚨 Si No Encuentras las Opciones

### **Posibles Razones:**

1. **Plan de Supabase**: Algunas opciones solo están disponibles en planes superiores
2. **Versión de Supabase**: La interfaz puede variar según la versión
3. **Configuración de proyecto**: Algunas opciones pueden estar deshabilitadas

### **Alternativas:**

1. **Contactar soporte de Supabase** para confirmar la ubicación
2. **Revisar la documentación oficial** de Supabase
3. **Verificar el plan de tu proyecto** y sus limitaciones

## 📞 Pasos de Acción

### **Inmediato:**

1. Ejecuta los scripts SQL que ya tienes
2. Verifica las configuraciones disponibles en tu panel
3. Documenta qué opciones encuentras

### **Siguiente:**

1. Busca en la documentación oficial de Supabase
2. Contacta soporte si es necesario
3. Implementa las configuraciones que estén disponibles

## ✅ Verificación Final

### **Después de aplicar las configuraciones:**

1. Ejecuta `verify-all-security.sql`
2. Verifica que las advertencias desaparezcan
3. Prueba la funcionalidad de la aplicación
4. Confirma que la seguridad está mejorada

---

**Nota:** Las ubicaciones exactas pueden variar según la versión de Supabase y el plan de tu
proyecto. Esta guía te ayudará a encontrar las configuraciones disponibles en tu panel específico.
