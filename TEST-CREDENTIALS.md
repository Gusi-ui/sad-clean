# 🔑 CREDENCIALES DE PRUEBA - SAD LAS

## **📋 USUARIOS DISPONIBLES PARA TESTING**

### **👤 ADMINISTRADOR**

- **Email**: `admin@sadlas.com`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Acceso**: Dashboard administrativo completo

### **👤 TRABAJADOR**

- **Email**: `maria.garcia@sadlas.com`
- **Contraseña**: `worker123`
- **Rol**: `worker`
- **Acceso**: Dashboard de trabajador

### **👤 CLIENTE (Solo datos)**

- **Email**: `juan.lopez@email.com`
- **Código**: `CLI001`
- **Rol**: Cliente (sin autenticación)
- **Acceso**: Solo datos de ejemplo

## **🚀 PASOS PARA CONFIGURAR CREDENCIALES**

### **1. Ejecutar Script SQL en Supabase**

1. Ir a tu proyecto de Supabase
2. Abrir el **SQL Editor**
3. Ejecutar primero: `supabase-setup.sql`
4. Ejecutar después: `create-test-users.sql`

### **2. Verificar Configuración**

1. Ir a **Authentication > Users** en Supabase
2. Verificar que aparecen los usuarios:
   - `admin@sadlas.com`
   - `maria.garcia@sadlas.com`

### **3. Probar Acceso**

1. Ir a `http://localhost:3000`
2. Usar las credenciales de arriba
3. Verificar que funciona la autenticación

## **🔧 TROUBLESHOOTING**

### **Si no funciona la autenticación:**

1. **Verificar variables de entorno**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
   ```

2. **Verificar que las tablas existen**:
   - `auth_users`
   - `workers`
   - `users`

3. **Verificar RLS (Row Level Security)**:
   - Asegurar que las políticas permiten acceso

### **Si hay errores de conexión:**

1. **Probar conexión**: Ir a `/test-supabase`
2. **Verificar credenciales** en Supabase Dashboard
3. **Revisar logs** en la consola del navegador

## **📱 FLUJO DE PRUEBA RECOMENDADO**

### **1. Prueba de Administrador**

1. Login con `admin@sadlas.com` / `admin123`
2. Verificar acceso a dashboard administrativo
3. Probar navegación entre secciones

### **2. Prueba de Trabajador**

1. Login con `maria.garcia@sadlas.com` / `worker123`
2. Verificar acceso limitado
3. Probar funcionalidades de trabajador

### **3. Prueba de Protección de Rutas**

1. Intentar acceder a rutas protegidas sin login
2. Verificar redirección a `/auth`
3. Probar logout y limpieza de sesión

## **🎯 CRITERIOS DE ÉXITO**

- ✅ **Login exitoso** con ambas credenciales
- ✅ **Protección de rutas** funcionando
- ✅ **Roles diferenciados** (admin vs worker)
- ✅ **Logout** limpia la sesión
- ✅ **Sin errores** en consola del navegador
- ✅ **Responsive design** en móvil y desktop

## **🔒 SEGURIDAD**

⚠️ **IMPORTANTE**: Estas credenciales son solo para **desarrollo y pruebas**.

**NUNCA usar en producción**:

- Cambiar contraseñas en producción
- Usar variables de entorno seguras
- Configurar autenticación robusta
- Implementar políticas de seguridad

## **📞 SOPORTE**

Si tienes problemas con las credenciales:

1. **Verificar configuración de Supabase**
2. **Revisar logs de autenticación**
3. **Probar con credenciales diferentes**
4. **Contactar al equipo de desarrollo**
