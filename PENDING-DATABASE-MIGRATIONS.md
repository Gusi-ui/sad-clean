# Migraciones de Base de Datos Pendientes

## ⚠️ IMPORTANTE: Columna monthly_contracted_hours faltante

### Problema

El dashboard de trabajadoras intenta acceder a la columna `monthly_contracted_hours` en la tabla
`workers`, pero esta columna no existe en la base de datos actual.

### Solución

Ejecutar el siguiente script SQL en el editor SQL de Supabase:

```sql
-- Ejecutar en el SQL Editor de Supabase
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS monthly_contracted_hours INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.workers.monthly_contracted_hours IS 'Horas mensuales contratadas por la empresa con esta trabajadora';

CREATE INDEX IF NOT EXISTS idx_workers_monthly_contracted_hours
ON public.workers(monthly_contracted_hours);
```

### Script Completo

Alternativamente, puedes ejecutar el script completo que se encuentra en:
`add-contracted-hours-to-workers.sql`

### Estado Actual

- ✅ **Código actualizado**: El código ahora usa un valor por defecto (0) para evitar errores
- ❌ **Base de datos**: La columna aún no existe en la tabla workers
- 🔄 **Acción requerida**: Ejecutar el script SQL en Supabase

### Después de ejecutar el script

1. La aplicación funcionará correctamente
2. Las trabajadoras podrán tener horas contratadas mensuales configuradas
3. Los cálculos de balance serán más precisos

### Verificación

Después de ejecutar el script, puedes verificar que la columna se creó correctamente con:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workers'
AND column_name = 'monthly_contracted_hours';
```
