-- ============================================================================
-- SAD LAS - FIX AUTH SECURITY CONFIGURATION
-- ============================================================================
-- Script para configurar las opciones de seguridad de autenticación
-- Nota: Algunas configuraciones deben hacerse desde el panel de Supabase
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR CONFIGURACIÓN ACTUAL DE AUTH
-- ============================================================================

-- Verificar configuración actual (solo lectura)
SELECT
    'Configuración actual de Auth' as info,
    'Algunas configuraciones requieren cambios en el panel de Supabase' as note;

-- ============================================================================
-- 2. INSTRUCCIONES PARA CONFIGURAR LEAKED PASSWORD PROTECTION
-- ============================================================================

-- Esta configuración debe hacerse desde el panel de Supabase
-- No se puede configurar via SQL

SELECT
    '🔧 CONFIGURAR LEAKED PASSWORD PROTECTION' as action,
    '1. Ve a Authentication > Settings' as step1,
    '2. Busca "Password Security"' as step2,
    '3. Habilita "Leaked password protection"' as step3,
    '4. Guarda los cambios' as step4;

-- ============================================================================
-- 3. INSTRUCCIONES PARA CONFIGURAR MFA
-- ============================================================================

SELECT
    '🔧 CONFIGURAR MFA OPTIONS' as action,
    '1. Ve a Authentication > Settings' as step1,
    '2. Busca "Multi-factor Authentication"' as step2,
    '3. Habilita al menos 2 métodos:' as step3,
    '   - TOTP (Google Authenticator)' as mfa1,
    '   - SMS' as mfa2,
    '   - Email' as mfa3,
    '4. Configura los métodos deseados' as step4,
    '5. Guarda los cambios' as step5;

-- ============================================================================
-- 4. CONFIGURACIONES ADICIONALES DE SEGURIDAD
-- ============================================================================

-- Crear función para verificar fortaleza de contraseñas
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar longitud mínima
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos una letra mayúscula
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos una letra minúscula
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos un número
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos un carácter especial
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- ============================================================================
-- 5. CONFIGURAR POLÍTICAS DE CONTRASEÑAS
-- ============================================================================

-- Crear tabla para políticas de contraseñas
CREATE TABLE IF NOT EXISTS public.password_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name TEXT NOT NULL UNIQUE,
    min_length INTEGER NOT NULL DEFAULT 8,
    require_uppercase BOOLEAN NOT NULL DEFAULT TRUE,
    require_lowercase BOOLEAN NOT NULL DEFAULT TRUE,
    require_numbers BOOLEAN NOT NULL DEFAULT TRUE,
    require_special_chars BOOLEAN NOT NULL DEFAULT TRUE,
    max_age_days INTEGER DEFAULT 90,
    prevent_reuse_count INTEGER DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar política por defecto
INSERT INTO public.password_policies (
    policy_name,
    min_length,
    require_uppercase,
    require_lowercase,
    require_numbers,
    require_special_chars,
    max_age_days,
    prevent_reuse_count
) VALUES (
    'default_policy',
    8,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    90,
    5
) ON CONFLICT (policy_name) DO NOTHING;

-- ============================================================================
-- 6. HABILITAR RLS EN TABLA DE POLÍTICAS
-- ============================================================================

ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan gestionar políticas
CREATE POLICY "Admin can manage password policies" ON public.password_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================================================
-- 7. VERIFICAR CONFIGURACIONES
-- ============================================================================

SELECT
    '✅ Función validate_password_strength creada' as status,
    '✅ Tabla password_policies creada' as status,
    '✅ RLS habilitado en password_policies' as status;

-- ============================================================================
-- 8. RESUMEN DE ACCIONES REQUERIDAS
-- ============================================================================

SELECT
    '📋 ACCIONES REQUERIDAS EN EL PANEL DE SUPABASE:' as header,
    '' as spacer1,
    '1. Authentication > Settings > Password Security' as action1,
    '   - Habilitar "Leaked password protection"' as detail1,
    '' as spacer2,
    '2. Authentication > Settings > Multi-factor Authentication' as action2,
    '   - Habilitar TOTP (Google Authenticator)' as detail2,
    '   - Habilitar SMS (opcional)' as detail3,
    '   - Habilitar Email (opcional)' as detail4,
    '' as spacer3,
    '3. Authentication > Settings > Security' as action3,
    '   - Configurar "Session timeout"' as detail5,
    '   - Configurar "Refresh token rotation"' as detail6;

-- ============================================================================
-- 9. MENSAJE FINAL
-- ============================================================================

SELECT '🔒 Configuraciones de seguridad de Auth preparadas' as status;
SELECT '⚠️ Recuerda completar las configuraciones en el panel de Supabase' as reminder;
