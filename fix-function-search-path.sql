-- ============================================================================
-- SAD LAS - FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================================================
-- Script para corregir las advertencias de search_path mutable en funciones
-- ============================================================================

-- ============================================================================
-- 1. CORREGIR FUNCIÓN log_system_activity
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_system_activity(
    p_activity_type TEXT,
    p_entity_type TEXT,
    p_description TEXT,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO system_activities (
        user_id,
        user_email,
        user_name,
        activity_type,
        entity_type,
        entity_id,
        entity_name,
        description,
        details,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        p_user_id,
        p_user_email,
        p_user_name,
        p_activity_type,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_description,
        p_details,
        p_ip_address,
        p_user_agent,
        NOW()
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- ============================================================================
-- 2. CORREGIR FUNCIÓN get_recent_activities
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_recent_activities(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    user_name TEXT,
    activity_type TEXT,
    entity_type TEXT,
    entity_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    time_ago TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.user_name,
        sa.activity_type,
        sa.entity_type,
        sa.entity_name,
        sa.description,
        sa.created_at,
        CASE
            WHEN EXTRACT(EPOCH FROM (NOW() - sa.created_at)) < 60 THEN
                'Hace menos de 1 min'
            WHEN EXTRACT(EPOCH FROM (NOW() - sa.created_at)) < 3600 THEN
                'Hace ' || FLOOR(EXTRACT(EPOCH FROM (NOW() - sa.created_at)) / 60)::TEXT || ' min'
            WHEN EXTRACT(EPOCH FROM (NOW() - sa.created_at)) < 86400 THEN
                'Hace ' || FLOOR(EXTRACT(EPOCH FROM (NOW() - sa.created_at)) / 3600)::TEXT || 'h'
            ELSE
                'Hace ' || FLOOR(EXTRACT(EPOCH FROM (NOW() - sa.created_at)) / 86400)::TEXT || ' días'
        END as time_ago
    FROM system_activities sa
    ORDER BY sa.created_at DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 3. CORREGIR FUNCIÓN update_holidays_updated_at_column
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_holidays_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. CORREGIR FUNCIÓN update_updated_at_column
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. VERIFICAR FUNCIONES CORREGIDAS
-- ============================================================================

SELECT
    proname as function_name,
    prosrc as function_source,
    CASE
        WHEN proconfig IS NOT NULL AND array_to_string(proconfig, ',') LIKE '%search_path%' THEN '✅ SEARCH_PATH FIJADO'
        ELSE '❌ SEARCH_PATH MUTABLE'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND proname IN (
        'log_system_activity',
        'get_recent_activities',
        'update_holidays_updated_at_column',
        'update_updated_at_column'
    )
ORDER BY proname;

-- ============================================================================
-- 6. MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Función log_system_activity corregida' as status;
SELECT '✅ Función get_recent_activities corregida' as status;
SELECT '✅ Función update_holidays_updated_at_column corregida' as status;
SELECT '✅ Función update_updated_at_column corregida' as status;
SELECT '✅ Todas las funciones tienen search_path fijo' as status;
