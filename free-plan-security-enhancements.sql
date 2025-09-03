-- ============================================================================
-- SAD LAS - MEJORAS DE SEGURIDAD PARA PLAN FREE
-- ============================================================================
-- Script para implementar mejoras de seguridad adicionales
-- Compatible con el plan Free de Supabase
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE INTENTOS DE LOGIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failure_reason TEXT
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);

-- ============================================================================
-- 2. HABILITAR RLS EN LOGIN_ATTEMPTS
-- ============================================================================

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan ver intentos de login
CREATE POLICY "Admin can view login attempts" ON public.login_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para insertar intentos de login
CREATE POLICY "Insert login attempts" ON public.login_attempts
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. FUNCIÓN PARA REGISTRAR INTENTOS DE LOGIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_login_attempt(
    p_user_email TEXT,
    p_success BOOLEAN,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    attempt_id UUID;
BEGIN
    INSERT INTO login_attempts (
        user_email,
        ip_address,
        user_agent,
        success,
        failure_reason
    ) VALUES (
        p_user_email,
        p_ip_address,
        p_user_agent,
        p_success,
        p_failure_reason
    ) RETURNING id INTO attempt_id;

    RETURN attempt_id;
END;
$$;

-- ============================================================================
-- 4. FUNCIÓN PARA VERIFICAR INTENTOS FALLIDOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_failed_attempts(
    p_user_email TEXT,
    p_hours_back INTEGER DEFAULT 24
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO failed_count
    FROM login_attempts
    WHERE user_email = p_user_email
        AND success = FALSE
        AND attempt_time > NOW() - INTERVAL '1 hour' * p_hours_back;

    RETURN failed_count;
END;
$$;

-- ============================================================================
-- 5. FUNCIÓN PARA LIMPIAR INTENTOS ANTIGUOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts(
    p_days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_attempts
    WHERE attempt_time < NOW() - INTERVAL '1 day' * p_days_to_keep;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- 6. TABLA DE SESIONES ACTIVAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);

-- ============================================================================
-- 7. HABILITAR RLS EN ACTIVE_SESSIONS
-- ============================================================================

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean sus propias sesiones
CREATE POLICY "Users can view own sessions" ON public.active_sessions
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Política para que admins vean todas las sesiones
CREATE POLICY "Admin can view all sessions" ON public.active_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================================================
-- 8. FUNCIÓN PARA LIMPIAR SESIONES EXPIRADAS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM active_sessions
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- 9. TRIGGER PARA ACTUALIZAR LAST_ACTIVITY
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_session_activity_trigger
    BEFORE UPDATE ON active_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- ============================================================================
-- 10. FUNCIÓN PARA OBTENER ESTADÍSTICAS DE SEGURIDAD
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_security_stats(
    p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_login_attempts BIGINT,
    successful_logins BIGINT,
    failed_logins BIGINT,
    unique_users BIGINT,
    suspicious_ips BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_login_attempts,
        COUNT(*) FILTER (WHERE success = TRUE) as successful_logins,
        COUNT(*) FILTER (WHERE success = FALSE) as failed_logins,
        COUNT(DISTINCT user_email) as unique_users,
        COUNT(DISTINCT ip_address) FILTER (WHERE success = FALSE) as suspicious_ips
    FROM login_attempts
    WHERE attempt_time > NOW() - INTERVAL '1 day' * p_days_back;
END;
$$;

-- ============================================================================
-- 11. VERIFICAR CONFIGURACIONES
-- ============================================================================

SELECT 'Tabla login_attempts creada' as status;
SELECT 'Tabla active_sessions creada' as status;
SELECT 'Funciones de seguridad creadas' as status;
SELECT 'RLS habilitado en nuevas tablas' as status;

-- ============================================================================
-- 12. MENSAJE FINAL
-- ============================================================================

SELECT 'Mejoras de seguridad para plan Free implementadas' as status;
SELECT 'Recuerda configurar MFA en Authentication > Settings' as reminder;
