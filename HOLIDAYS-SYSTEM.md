# 🎯 Sistema de Festivos - SAD LAS

## 📋 **Descripción General**

Este sistema gestiona los festivos oficiales de Mataró de forma automatizada y confiable, eliminando
la dependencia de fallbacks hardcodeados y asegurando que todos los cálculos de servicios se basen
únicamente en la base de datos.

## 🏗️ **Arquitectura**

### **Fuente de Verdad Única**

- **Tabla `holidays`** en Supabase como única fuente de verdad
- **Eliminación completa** de fallbacks hardcodeados en el código
- **Validación automática** de integridad de datos

### **Estructura de la Base de Datos**

```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day, month, year)
);
```

## 🔧 **Scripts Disponibles**

### **1. Importación Automática**

```bash
# Importar festivos para el año actual
npm run import-holidays

# Importar festivos para un año específico
npm run import-holidays 2025
```

**Funcionalidades:**

- Extrae festivos desde la web oficial del Ayuntamiento de Mataró
- Determina automáticamente el tipo de festivo (nacional, regional, local)
- Valida la integridad de los datos antes de importar
- Elimina festivos existentes del año antes de importar nuevos

### **2. Validación de Datos**

```bash
# Validar festivos del año actual
npm run validate-holidays

# Validar festivos de un año específico
npm run validate-holidays 2025

# Verificar festivos faltantes
npm run validate-holidays 2025 missing
```

**Validaciones incluidas:**

- Verificación de duplicados
- Validación de fechas (días/meses válidos)
- Comprobación de festivos específicos de Mataró
- Tests de conteo por mes
- Verificación de distribución por tipos

### **3. Tests Unitarios**

```bash
# Ejecutar tests de conteo para 2025
npm run test-holidays
```

## 📊 **Tipos de Festivos**

### **Nacionales**

- Cap d'Any (1 de enero)
- Reis (6 de enero)
- Divendres Sant (variable)
- Dilluns de Pasqua Florida (variable)
- Festa del Treball (1 de mayo)
- Sant Joan (24 de junio)
- L'Assumpció (15 de agosto)
- Diada Nacional de Catalunya (11 de septiembre)
- Tots Sants (1 de noviembre)
- Dia de la Constitució (6 de diciembre)
- La Immaculada (8 de diciembre)
- Nadal (25 de diciembre)
- Sant Esteve (26 de diciembre)

### **Locales (Mataró)**

- Fira a Mataró (9 de junio)
- Festa major de Les Santes (28 de julio)

## 🔄 **Proceso de Actualización**

### **Automático (Recomendado)**

1. **Ejecutar importación:** `npm run import-holidays 2025`
2. **Validar datos:** `npm run validate-holidays 2025`
3. **Verificar en aplicación:** Comprobar que los cálculos son correctos

### **Manual (Si es necesario)**

1. Acceder a Supabase Dashboard
2. Ir a la tabla `holidays`
3. Insertar/editar festivos manualmente
4. Ejecutar validación: `npm run validate-holidays 2025`

## 🧪 **Validaciones Automáticas**

### **Festivos Requeridos**

El sistema verifica que estén presentes estos festivos esenciales:

- ✅ Cap d'Any (1/1)
- ✅ Reis (6/1)
- ✅ Festa del Treball (1/5)
- ✅ Sant Joan (24/6)
- ✅ L'Assumpció (15/8)
- ✅ Diada Nacional (11/9)
- ✅ Nadal (25/12)

### **Tests de Conteo**

Para agosto 2025 en Mataró:

- **Esperado:** 1 festivo (15 de agosto)
- **Validación:** El sistema verifica que el conteo sea exacto

## 🚨 **Manejo de Errores**

### **Errores Comunes**

1. **Festivos duplicados:** El sistema detecta y reporta duplicados
2. **Fechas inválidas:** Valida que días/meses estén en rangos correctos
3. **Festivos faltantes:** Alerta sobre festivos esperados no encontrados
4. **Tipos incorrectos:** Verifica que los tipos coincidan con los esperados

### **Logs y Reportes**

- **Consola detallada** durante importación y validación
- **Resumen de resultados** con estadísticas
- **Lista de errores y advertencias** específicas

## 🔗 **Integración con la Aplicación**

### **Código Limpio**

- ✅ **Sin fallbacks hardcodeados**
- ✅ **Solo consultas a la base de datos**
- ✅ **Validación automática de integridad**

### **Funciones Principales**

```typescript
// Verificar si una fecha es festivo
const isHoliday = (date: Date): boolean => {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return holidaySet.has(dateKey);
};
```

### **Cálculos de Servicios**

- **Festivos:** Solo fines de semana + festivos oficiales
- **Laborables:** Solo L-V, excluyendo festivos oficiales
- **Flexibles:** Todos los días del mes

## 📅 **Calendario de Mantenimiento**

### **Anual**

- **Diciembre:** Importar festivos del año siguiente
- **Enero:** Verificar que todos los festivos estén correctos

### **Mensual**

- **Última semana del mes:** Verificar festivos del mes siguiente
- **Primera semana del mes:** Validar festivos del mes actual

### **Cuando sea necesario**

- **Nuevos festivos locales:** Importar inmediatamente
- **Cambios en festivos:** Actualizar y validar
- **Errores detectados:** Corregir y revalidar

## 🎯 **Beneficios del Sistema**

### **Confiabilidad**

- ✅ **Fuente única de verdad**
- ✅ **Sin dependencias de código hardcodeado**
- ✅ **Validación automática de integridad**

### **Mantenibilidad**

- ✅ **Actualización automatizada**
- ✅ **Scripts reutilizables**
- ✅ **Documentación completa**

### **Precisión**

- ✅ **Cálculos exactos de servicios**
- ✅ **Detección automática de errores**
- ✅ **Tests unitarios incluidos**

## 🚀 **Comandos de Uso Rápido**

```bash
# Configuración inicial
npm run import-holidays 2025
npm run validate-holidays 2025

# Mantenimiento regular
npm run validate-holidays
npm run test-holidays

# Solución de problemas
npm run validate-holidays 2025 missing
```

## 📞 **Soporte**

Si encuentras problemas:

1. Ejecuta `npm run validate-holidays` para diagnosticar
2. Revisa los logs de la consola
3. Verifica la tabla `holidays` en Supabase
4. Ejecuta `npm run import-holidays` para reimportar si es necesario

---

**¡Sistema de festivos 100% confiable y automatizado! 🎉**
