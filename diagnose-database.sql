-- ============================================================================
-- SAD LAS - DIAGNÓSTICO DE BASE DE DATOS
-- ============================================================================
-- Script para diagnosticar el estado actual de la base de datos
-- ============================================================================

-- Verificar todas las tablas existentes
SELECT 'TABLES IN DATABASE:' as info;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar si holidays existe
SELECT 'HOLIDAYS TABLE STATUS:' as info;
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'holidays')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as holidays_status;

-- Si holidays existe, verificar su estructura
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'holidays') THEN
        RAISE NOTICE 'HOLIDAYS TABLE STRUCTURE:';
        PERFORM column_name || ' - ' || data_type || ' - ' || is_nullable
        FROM information_schema.columns
        WHERE table_name = 'holidays'
        ORDER BY ordinal_position;

        RAISE NOTICE 'HOLIDAYS CONSTRAINTS:';
        PERFORM conname || ' - ' || pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'holidays'::regclass;

        RAISE NOTICE 'HOLIDAYS DATA COUNT: %', (SELECT COUNT(*) FROM holidays);
    ELSE
        RAISE NOTICE 'HOLIDAYS TABLE DOES NOT EXIST';
    END IF;
END $$;

-- Verificar si assignments existe
SELECT 'ASSIGNMENTS TABLE STATUS:' as info;
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignments')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as assignments_status;

-- Verificar si users existe
SELECT 'USERS TABLE STATUS:' as info;
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as users_status;

-- Verificar si workers existe
SELECT 'WORKERS TABLE STATUS:' as info;
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workers')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as workers_status;

-- Verificar RLS en holidays si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'holidays') THEN
        RAISE NOTICE 'HOLIDAYS RLS STATUS:';
        PERFORM
            schemaname || '.' || tablename || ' - RLS: ' || rowsecurity
        FROM pg_tables
        WHERE tablename = 'holidays';

        RAISE NOTICE 'HOLIDAYS POLICIES:';
        PERFORM policyname || ' - ' || cmd || ' - ' || qual
        FROM pg_policies
        WHERE tablename = 'holidays';
    END IF;
END $$;
