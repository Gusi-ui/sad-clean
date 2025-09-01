-- ============================================================================
-- SAD LAS - AÑADIR HORAS CONTRATADAS A TRABAJADORAS
-- ============================================================================
-- Script para añadir el campo de horas contratadas mensuales a la tabla workers
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================================

-- 1. Añadir columna de horas contratadas mensuales
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS monthly_contracted_hours INTEGER NOT NULL DEFAULT 0;

-- 2. Añadir comentario descriptivo
COMMENT ON COLUMN public.workers.monthly_contracted_hours IS 'Horas mensuales contratadas por la empresa con esta trabajadora';

-- 3. Crear índice para optimizar consultas por horas contratadas
CREATE INDEX IF NOT EXISTS idx_workers_monthly_contracted_hours
ON public.workers(monthly_contracted_hours);

-- 4. Verificar que la columna se creó correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    col_description(table_name::regclass, ordinal_position) as comment
FROM information_schema.columns
WHERE table_name = 'workers'
AND column_name = 'monthly_contracted_hours';

-- 5. Mostrar mensaje de confirmación
SELECT '✅ Columna monthly_contracted_hours añadida exitosamente a la tabla workers' AS status;
