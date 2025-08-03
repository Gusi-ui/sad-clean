# 🔧 SOLUCIÓN ERROR CONSTRAINT - SAD LAS

## **🚨 PROBLEMA IDENTIFICADO**

### **Error SQL 23514**

```sql
ERROR:  23514: new row for relation "auth_users" violates check constraint "auth_users_role_check"
DETAIL:  Failing row contains (..., super_admin, ...)
```

### **🔍 CAUSA RAÍZ**

La tabla `auth_users` se creó originalmente con un constraint que **SOLO permite**:

```sql
CHECK (role IN ('admin', 'worker'))
```

Pero el súper administrador necesita el role `'super_admin'` que **NO estaba incluido**.

## **✅ SOLUCIÓN IMPLEMENTADA**

### **Script Completo**: `setup-super-admin-complete.sql`

Este script hace **TODO** en el orden correcto:

1. **Actualiza el constraint** de `auth_users`:

   ```sql
   ALTER TABLE auth_users
   DROP CONSTRAINT IF EXISTS auth_users_role_check;

   ALTER TABLE auth_users
   ADD CONSTRAINT auth_users_role_check
   CHECK (role IN ('super_admin', 'admin', 'worker'));
   ```

2. **Crea el súper administrador** en `auth.users`
3. **Lo registra** en `auth_users` con role `'super_admin'`
4. **Verifica** que todo funcione correctamente

## **🎯 EJECUCIÓN**

### **Paso Único**:

1. **Ir a Supabase** → **SQL Editor**
2. **Ejecutar**: `setup-super-admin-complete.sql`
3. **Verificar mensajes**:
   ```
   ✅ Constraint actualizado para incluir super_admin
   ✅ Usuario súper administrador creado en auth.users
   ✅ Usuario insertado en auth_users
   🎉 SÚPER ADMINISTRADOR CREADO CORRECTAMENTE
   ```

## **🧪 VERIFICACIÓN**

### **En Supabase Dashboard**:

- **Authentication** → **Users** → Debe aparecer `conectomail@gmail.com`

### **En la App**:

- **Login**: `conectomail@gmail.com` / `Federe_4231`
- **Dashboard**: `/super-dashboard`
- **Crear trabajadoras**: ✅ Debe funcionar sin colgarse

## **📋 DIFERENCIAS CLAVE**

### **❌ Scripts Anteriores**:

- `supabase-setup.sql`: Creaba constraint limitado
- `create-super-admin.sql`: Error ON CONFLICT
- `create-super-admin-fixed.sql`: Error de constraint

### **✅ Script Actual**:

- `setup-super-admin-complete.sql`: **SOLUCIONA TODO** en una sola ejecución

## **🚨 IMPORTANTE**

- **NO ejecutar** otros scripts SQL anteriores
- **SOLO ejecutar**: `setup-super-admin-complete.sql`
- **Verificar** en navegador antes de commit [[memory:4865410]]

## **🎉 RESULTADO FINAL**

Después de ejecutar el script:

- ✅ **Constraint actualizado** para incluir `super_admin`
- ✅ **Súper admin real** creado en Supabase
- ✅ **Login funcional** con credenciales reales
- ✅ **Crear trabajadoras** funciona sin errores
- ✅ **Sin error 403** en logout
- ✅ **Sin formularios colgados**
