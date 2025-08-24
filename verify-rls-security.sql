-- ============================================================================
-- SAD LAS - VERIFICAR RLS SECURITY
-- ============================================================================
-- Script para verificar que RLS está correctamente configurado
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR ESTADO RLS EN TODAS LAS TABLAS
-- ============================================================================

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users')
ORDER BY tablename;

-- ============================================================================
-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE
        WHEN cmd = 'SELECT' THEN '📖 LECTURA'
        WHEN cmd = 'INSERT' THEN '➕ INSERCIÓN'
        WHEN cmd = 'UPDATE' THEN '✏️ ACTUALIZACIÓN'
        WHEN cmd = 'DELETE' THEN '🗑️ ELIMINACIÓN'
        WHEN cmd = 'ALL' THEN '🔐 TODAS'
        ELSE cmd
    END as operation_type
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- 3. VERIFICAR POLÍTICAS ESPECÍFICAS PARA USERS
-- ============================================================================

SELECT
    'USERS' as table_name,
    policyname,
    cmd,
    qual as condition
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================================================
-- 4. VERIFICAR POLÍTICAS ESPECÍFICAS PARA HOURS_BALANCES
-- ============================================================================

SELECT
    'HOURS_BALANCES' as table_name,
    policyname,
    cmd,
    qual as condition
FROM pg_policies
WHERE tablename = 'hours_balances'
ORDER BY cmd, policyname;

-- ============================================================================
-- 5. VERIFICAR QUE NO HAY TABLAS SIN RLS
-- ============================================================================

SELECT
    '⚠️ ADVERTENCIA' as alert,
    tablename,
    'Esta tabla no tiene RLS habilitado' as issue
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users')
    AND NOT rowsecurity;

-- ============================================================================
-- 6. RESUMEN DE SEGURIDAD
-- ============================================================================

WITH rls_summary AS (
    SELECT
        pt.tablename,
        pt.rowsecurity,
        COUNT(pp.policyname) as policy_count
    FROM pg_tables pt
    LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename AND pt.schemaname = pp.schemaname
    WHERE pt.schemaname = 'public'
        AND pt.tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users')
    GROUP BY pt.tablename, pt.rowsecurity
)
SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status,
    policy_count as total_policies,
    CASE
        WHEN rowsecurity AND policy_count > 0 THEN '🔒 SEGURO'
        WHEN rowsecurity AND policy_count = 0 THEN '⚠️ RLS SIN POLÍTICAS'
        ELSE '🚨 SIN SEGURIDAD'
    END as security_status
FROM rls_summary
ORDER BY tablename;

-- ============================================================================
-- 7. MENSAJE FINAL
-- ============================================================================

SELECT '🔍 Verificación de seguridad RLS completada' as status;
