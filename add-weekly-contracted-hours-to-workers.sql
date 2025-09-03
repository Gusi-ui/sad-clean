-- ============================================================================
-- SAD LAS - AÑADIR HORAS CONTRATADAS SEMANALES A TRABAJADORAS
-- ============================================================================
-- Script para añadir el campo de horas contratadas semanales a la tabla workers
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================================

-- 1. Añadir columna de horas contratadas semanales
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS weekly_contracted_hours INTEGER NOT NULL DEFAULT 0;

-- 2. Añadir comentario descriptivo
COMMENT ON COLUMN public.workers.weekly_contracted_hours IS 'Horas semanales contratadas por la empresa con esta trabajadora';

-- 3. Crear índice para optimizar consultas por horas contratadas
CREATE INDEX IF NOT EXISTS idx_workers_weekly_contracted_hours
ON public.workers(weekly_contracted_hours);

-- 4. Nota: No hay datos previos de horas contratadas para migrar
-- La columna monthly_contracted_hours no existe en la tabla actual
-- Las horas semanales se configurarán manualmente desde el formulario de trabajadoras

-- 5. Verificar que la columna se creó correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    col_description(table_name::regclass, ordinal_position) as comment
FROM information_schema.columns
WHERE table_name = 'workers'
AND column_name = 'weekly_contracted_hours';

-- 6. Mostrar trabajadoras existentes con la nueva columna
SELECT 
    name,
    surname,
    weekly_contracted_hours,
    CASE 
        WHEN weekly_contracted_hours > 0 THEN 
            CONCAT('Configurado: ', weekly_contracted_hours, 'h/semana')
        ELSE 'Pendiente de configurar'
    END as status
FROM public.workers
ORDER BY name, surname;

-- 7. Mostrar mensaje de confirmación
SELECT '✅ Columna weekly_contracted_hours añadida exitosamente a la tabla workers' AS status;