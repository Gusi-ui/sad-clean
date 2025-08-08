-- ============================================================================
-- SAD LAS - VERIFICAR TABLA HOLIDAYS
-- ============================================================================
-- Script para verificar la estructura actual de la tabla holidays
-- ============================================================================

-- Verificar si la tabla holidays existe
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'holidays'
) as table_exists;

-- Verificar la estructura de la tabla holidays
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'holidays'
ORDER BY ordinal_position;

-- Verificar las restricciones únicas
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'holidays'::regclass
    AND contype = 'u';

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_holidays FROM holidays;

-- Mostrar algunos datos de ejemplo
SELECT * FROM holidays LIMIT 5;
