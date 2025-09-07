-- ============================================================================
-- SCRIPT PARA CREAR TABLAS FALTANTES DEL SISTEMA DE NOTIFICACIONES
-- ============================================================================

-- ============================================================================
-- TABLA: worker_notifications (Notificaciones Push)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_user', 'user_removed', 'schedule_change', 'assignment_change', 'route_update', 'system_message', 'reminder', 'urgent', 'holiday_update')),
    data JSONB, -- Datos adicionales específicos del tipo
    read_at TIMESTAMPTZ, -- Cuándo fue leída
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Cuándo expira la notificación
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_worker_notifications_worker_id ON worker_notifications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_notifications_read_at ON worker_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_worker_notifications_type ON worker_notifications(type);
CREATE INDEX IF NOT EXISTS idx_worker_notifications_worker_unread ON worker_notifications(worker_id, read_at) WHERE read_at IS NULL;

-- ============================================================================
-- TABLA: worker_devices (Dispositivos Autorizados)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL, -- Identificador único del dispositivo
    device_name TEXT, -- Nombre del dispositivo
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    app_version TEXT, -- Versión de la aplicación
    os_version TEXT, -- Versión del sistema operativo
    push_token TEXT, -- Token para notificaciones push
    authorized BOOLEAN DEFAULT true, -- Si el dispositivo está autorizado
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(worker_id, device_id)
);

-- Índices para dispositivos
CREATE INDEX IF NOT EXISTS idx_worker_devices_worker_id ON worker_devices(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_devices_device_id ON worker_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_worker_devices_authorized ON worker_devices(authorized);

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS en las tablas
ALTER TABLE worker_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_devices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA worker_notifications
-- ============================================================================

-- Los trabajadores solo pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Workers can view own notifications" ON worker_notifications;
CREATE POLICY "Workers can view own notifications" ON worker_notifications
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden marcar sus notificaciones como leídas
DROP POLICY IF EXISTS "Workers can update own notifications" ON worker_notifications;
CREATE POLICY "Workers can update own notifications" ON worker_notifications
    FOR UPDATE USING (auth.uid() = worker_id);

-- Los administradores pueden crear notificaciones para trabajadores
DROP POLICY IF EXISTS "Admins can create notifications" ON worker_notifications;
CREATE POLICY "Admins can create notifications" ON worker_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND (raw_user_meta_data->>'role') IN ('admin', 'super_admin')
        )
    );

-- Los administradores pueden ver todas las notificaciones
DROP POLICY IF EXISTS "Admins can view all notifications" ON worker_notifications;
CREATE POLICY "Admins can view all notifications" ON worker_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND (raw_user_meta_data->>'role') IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA worker_devices
-- ============================================================================

-- Los trabajadores solo pueden ver sus propios dispositivos
DROP POLICY IF EXISTS "Workers can view own devices" ON worker_devices;
CREATE POLICY "Workers can view own devices" ON worker_devices
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden registrar sus propios dispositivos
DROP POLICY IF EXISTS "Workers can insert own devices" ON worker_devices;
CREATE POLICY "Workers can insert own devices" ON worker_devices
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Los trabajadores pueden actualizar sus propios dispositivos
DROP POLICY IF EXISTS "Workers can update own devices" ON worker_devices;
CREATE POLICY "Workers can update own devices" ON worker_devices
    FOR UPDATE USING (auth.uid() = worker_id);

-- Los administradores pueden ver todos los dispositivos
DROP POLICY IF EXISTS "Admins can view all devices" ON worker_devices;
CREATE POLICY "Admins can view all devices" ON worker_devices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND (raw_user_meta_data->>'role') IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- TABLA: worker_notification_settings (Configuración de Notificaciones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    new_user_notifications BOOLEAN DEFAULT true,
    schedule_change_notifications BOOLEAN DEFAULT true,
    assignment_change_notifications BOOLEAN DEFAULT true,
    route_update_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    reminder_notifications BOOLEAN DEFAULT true,
    urgent_notifications BOOLEAN DEFAULT true,
    holiday_update_notifications BOOLEAN DEFAULT true,
    quiet_hours_start TEXT, -- Formato HH:MM
    quiet_hours_end TEXT, -- Formato HH:MM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(worker_id)
);

-- Índices para configuración de notificaciones
CREATE INDEX IF NOT EXISTS idx_worker_notification_settings_worker_id ON worker_notification_settings(worker_id);

-- ============================================================================
-- POLÍTICAS RLS PARA worker_notification_settings
-- ============================================================================

-- Habilitar RLS
ALTER TABLE worker_notification_settings ENABLE ROW LEVEL SECURITY;

-- Los trabajadores solo pueden ver su propia configuración
DROP POLICY IF EXISTS "Workers can view own notification settings" ON worker_notification_settings;
CREATE POLICY "Workers can view own notification settings" ON worker_notification_settings
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden crear su propia configuración
DROP POLICY IF EXISTS "Workers can insert own notification settings" ON worker_notification_settings;
CREATE POLICY "Workers can insert own notification settings" ON worker_notification_settings
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Los trabajadores pueden actualizar su propia configuración
DROP POLICY IF EXISTS "Workers can update own notification settings" ON worker_notification_settings;
CREATE POLICY "Workers can update own notification settings" ON worker_notification_settings
    FOR UPDATE USING (auth.uid() = worker_id);

-- Los trabajadores pueden eliminar su propia configuración
DROP POLICY IF EXISTS "Workers can delete own notification settings" ON worker_notification_settings;
CREATE POLICY "Workers can delete own notification settings" ON worker_notification_settings
    FOR DELETE USING (auth.uid() = worker_id);

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para obtener notificaciones no leídas de un trabajador
CREATE OR REPLACE FUNCTION get_worker_unread_notifications(worker_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    body TEXT,
    type TEXT,
    data JSONB,
    sent_at TIMESTAMPTZ,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wn.id,
        wn.title,
        wn.body,
        wn.type,
        wn.data,
        wn.sent_at,
        wn.priority
    FROM worker_notifications wn
    WHERE wn.worker_id = worker_uuid
    AND wn.read_at IS NULL
    AND (wn.expires_at IS NULL OR wn.expires_at > NOW())
    ORDER BY wn.sent_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que las tablas se crearon correctamente
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY['worker_notifications', 'worker_devices'];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) THEN
            RAISE EXCEPTION 'La tabla % no se creó correctamente', table_name;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ Las tablas de notificaciones se crearon correctamente';
END $$;

-- Mostrar resumen de las tablas creadas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('worker_notifications', 'worker_devices')
ORDER BY table_name;
