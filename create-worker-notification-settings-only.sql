-- ============================================================================
-- SOLO TABLA: worker_notification_settings (Configuración de Notificaciones)
-- Ejecutar este SQL en el SQL Editor de Supabase Dashboard
-- ============================================================================

-- Crear tabla
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
-- POLÍTICAS RLS SIMPLIFICADAS PARA worker_notification_settings
-- ============================================================================

-- Habilitar RLS
ALTER TABLE worker_notification_settings ENABLE ROW LEVEL SECURITY;

-- Política básica: Los trabajadores solo pueden acceder a su propia configuración
DROP POLICY IF EXISTS "Users can manage own notification settings" ON worker_notification_settings;
CREATE POLICY "Users can manage own notification settings" ON worker_notification_settings
    FOR ALL USING (auth.uid() = worker_id);

-- Verificación
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'worker_notification_settings';
