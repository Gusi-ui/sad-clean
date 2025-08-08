-- ============================================================================
-- SAD LAS - DIAGNÓSTICO DE TABLAS
-- ============================================================================
-- Script para verificar el estado actual de las tablas
-- ============================================================================

-- Verificar si las tablas existen
SELECT
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as status
FROM information_schema.tables
WHERE table_name IN ('holidays', 'assignments');

-- Verificar estructura de la tabla holidays si existe
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'holidays'
ORDER BY ordinal_position;

-- Verificar restricciones únicas en holidays
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'holidays'
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY');

-- Verificar estructura de la tabla assignments si existe
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- Verificar restricciones únicas en assignments
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'assignments'
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY');

-- Verificar datos existentes
SELECT 'holidays' as table_name, COUNT(*) as count FROM holidays
UNION ALL
SELECT 'assignments' as table_name, COUNT(*) as count FROM assignments;
