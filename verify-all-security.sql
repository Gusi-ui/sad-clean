-- ============================================================================
-- SAD LAS - VERIFICAR TODAS LAS ADVERTENCIAS DE SEGURIDAD
-- ============================================================================
-- Script para verificar que todas las advertencias de seguridad están solucionadas
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR RLS EN TABLAS
-- ============================================================================

SELECT
    '🔍 VERIFICACIÓN RLS' as section,
    '' as spacer;

SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as rls_status,
    CASE
        WHEN rowsecurity THEN '🔒 SEGURO'
        ELSE '🚨 VULNERABLE'
    END as security_level
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users', 'password_policies')
ORDER BY tablename;

-- ============================================================================
-- 2. VERIFICAR FUNCIONES CON SEARCH_PATH
-- ============================================================================

SELECT
    '' as spacer1,
    '🔍 VERIFICACIÓN SEARCH_PATH' as section,
    '' as spacer2;

SELECT
    proname as function_name,
    CASE
        WHEN proconfig IS NOT NULL AND array_to_string(proconfig, ',') LIKE '%search_path%' THEN '✅ SEARCH_PATH FIJADO'
        ELSE '❌ SEARCH_PATH MUTABLE'
    END as search_path_status,
    CASE
        WHEN proconfig IS NOT NULL AND array_to_string(proconfig, ',') LIKE '%search_path%' THEN '🔒 SEGURO'
        ELSE '⚠️ ADVERTENCIA'
    END as security_level
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND proname IN (
        'log_system_activity',
        'get_recent_activities',
        'update_holidays_updated_at_column',
        'update_updated_at_column',
        'validate_password_strength'
    )
ORDER BY proname;

-- ============================================================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ============================================================================

SELECT
    '' as spacer3,
    '🔍 VERIFICACIÓN POLÍTICAS RLS' as section,
    '' as spacer4;

SELECT
    pt.tablename,
    COUNT(pp.policyname) as total_policies,
    CASE
        WHEN COUNT(pp.policyname) > 0 THEN '✅ POLÍTICAS CONFIGURADAS'
        ELSE '❌ SIN POLÍTICAS'
    END as policies_status
FROM pg_tables pt
LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename AND pt.schemaname = pp.schemaname
WHERE pt.schemaname = 'public'
    AND pt.tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users', 'password_policies')
GROUP BY pt.tablename, pt.rowsecurity
ORDER BY pt.tablename;

-- ============================================================================
-- 4. VERIFICAR FUNCIONES DE SEGURIDAD
-- ============================================================================

SELECT
    '' as spacer5,
    '🔍 VERIFICACIÓN FUNCIONES DE SEGURIDAD' as section,
    '' as spacer6;

SELECT
    proname as function_name,
    CASE
        WHEN proname = 'validate_password_strength' THEN '✅ CREADA'
        ELSE '❌ FALTANTE'
    END as function_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND proname = 'validate_password_strength';

-- ============================================================================
-- 5. RESUMEN GENERAL DE SEGURIDAD
-- ============================================================================

SELECT
    '' as spacer7,
    '📊 RESUMEN GENERAL DE SEGURIDAD' as section,
    '' as spacer8;

WITH security_summary AS (
    -- RLS Status
    SELECT
        'RLS' as category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE rowsecurity) as secure,
        COUNT(*) FILTER (WHERE NOT rowsecurity) as vulnerable
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users', 'password_policies')

    UNION ALL

    -- Search Path Status
    SELECT
        'SEARCH_PATH' as category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE proconfig IS NOT NULL AND array_to_string(proconfig, ',') LIKE '%search_path%') as secure,
        COUNT(*) FILTER (WHERE proconfig IS NULL OR array_to_string(proconfig, ',') NOT LIKE '%search_path%') as vulnerable
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
        AND proname IN (
            'log_system_activity',
            'get_recent_activities',
            'update_holidays_updated_at_column',
            'update_updated_at_column',
            'validate_password_strength'
        )
)
SELECT
    category,
    total as total_items,
    secure as secure_items,
    vulnerable as vulnerable_items,
    CASE
        WHEN vulnerable = 0 THEN '✅ COMPLETAMENTE SEGURO'
        WHEN secure > vulnerable THEN '⚠️ MAYORÍA SEGURA'
        ELSE '🚨 NECESITA ATENCIÓN'
    END as overall_status
FROM security_summary
ORDER BY category;

-- ============================================================================
-- 6. ADVERTENCIAS RESTANTES
-- ============================================================================

SELECT
    '' as spacer9,
    '⚠️ ADVERTENCIAS QUE REQUIEREN ACCIÓN MANUAL' as section,
    '' as spacer10;

SELECT
    'Leaked Password Protection' as warning,
    'Authentication > Settings > Password Policy/Security' as location,
    'Buscar "Prevent use of compromised passwords" o "Breach Check"' as action;

SELECT
    'MFA Options' as warning,
    'Authentication > Settings > Multi-Factor Authentication' as location,
    'Habilitar TOTP y otros métodos disponibles' as action;

SELECT
    'Password Policy' as warning,
    'Authentication > Settings > Password Requirements' as location,
    'Configurar longitud mínima, mayúsculas, números, caracteres especiales' as action;

-- ============================================================================
-- 7. MENSAJE FINAL
-- ============================================================================

SELECT
    '' as spacer11,
    '🎯 ESTADO FINAL' as final_status,
    '' as spacer12;

SELECT
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM pg_tables
            WHERE schemaname = 'public'
                AND tablename IN ('users', 'hours_balances', 'workers', 'assignments', 'holidays', 'auth_users', 'password_policies')
                AND NOT rowsecurity
        ) = 0
        AND (
            SELECT COUNT(*)
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
                AND proname IN (
                    'log_system_activity',
                    'get_recent_activities',
                    'update_holidays_updated_at_column',
                    'update_updated_at_column',
                    'validate_password_strength'
                )
                AND (proconfig IS NULL OR array_to_string(proconfig, ',') NOT LIKE '%search_path%')
        ) = 0
        THEN '✅ TODAS LAS ADVERTENCIAS SQL SOLUCIONADAS'
        ELSE '⚠️ ALGUNAS ADVERTENCIAS SQL PENDIENTES'
    END as sql_status;

SELECT
    '📋 RECUERDA: Completar configuraciones en el panel de Supabase' as reminder;
