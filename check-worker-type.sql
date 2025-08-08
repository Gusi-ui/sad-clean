-- ============================================================================
-- SAD LAS - VERIFICAR VALORES DE WORKER_TYPE
-- ============================================================================
-- Script para verificar qué valores son permitidos en worker_type
-- ============================================================================

-- Verificar la restricción CHECK de worker_type
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'workers'::regclass
    AND contype = 'c'
    AND conname LIKE '%worker_type%';

-- Verificar la estructura de la tabla workers
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'workers' AND column_name = 'worker_type';

-- Verificar si hay datos existentes en workers
SELECT worker_type, COUNT(*) as count
FROM workers
GROUP BY worker_type;
