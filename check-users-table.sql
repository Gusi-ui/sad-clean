-- ============================================================================
-- SAD LAS - VERIFICAR ESTRUCTURA DE TABLA USERS
-- ============================================================================
-- Script para verificar la estructura actual de la tabla users
-- ============================================================================

-- Verificar estructura de la tabla users
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verificar si existe la columna status
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'status'
        ) THEN 'EXISTE'
        ELSE 'NO EXISTE'
    END as status_column_exists;

-- Mostrar todas las columnas de users
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
