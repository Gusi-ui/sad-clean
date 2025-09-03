-- ============================================================================
-- SAD LAS - FIX AUTH SECURITY CONFIGURATION (SIMPLIFIED)
-- ============================================================================
-- Script para configurar las opciones de seguridad de autenticacion
-- ============================================================================

-- ============================================================================
-- 1. CREAR FUNCION PARA VERIFICAR FORTALEZA DE CONTRASEÑAS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar longitud minima
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos una letra mayuscula
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos una letra minuscula
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos un numero
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;

    -- Verificar que contenga al menos un caracter especial
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- ============================================================================
-- 2. CONFIGURAR POLITICAS DE CONTRASEÑAS
-- ============================================================================

-- Crear tabla para politicas de contraseñas
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

-- Insertar politica por defecto
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
-- 3. HABILITAR RLS EN TABLA DE POLITICAS
-- ============================================================================

ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;

-- Politica para que solo admins puedan gestionar politicas
CREATE POLICY "Admin can manage password policies" ON public.password_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================================================
-- 4. VERIFICAR CONFIGURACIONES
-- ============================================================================

SELECT 'Funcion validate_password_strength creada' as status;
SELECT 'Tabla password_policies creada' as status;
SELECT 'RLS habilitado en password_policies' as status;

-- ============================================================================
-- 5. INSTRUCCIONES PARA CONFIGURACIONES MANUALES
-- ============================================================================

SELECT 'ACCIONES REQUERIDAS EN EL PANEL DE SUPABASE:' as header;
SELECT '1. Authentication > Settings > Password Security' as action1;
SELECT '   - Habilitar "Leaked password protection"' as detail1;
SELECT '2. Authentication > Settings > Multi-factor Authentication' as action2;
SELECT '   - Habilitar TOTP (Google Authenticator)' as detail2;
SELECT '   - Habilitar SMS (opcional)' as detail3;
SELECT '   - Habilitar Email (opcional)' as detail4;

-- ============================================================================
-- 6. MENSAJE FINAL
-- ============================================================================

SELECT 'Configuraciones de seguridad de Auth preparadas' as status;
SELECT 'Recuerda completar las configuraciones en el panel de Supabase' as reminder;
