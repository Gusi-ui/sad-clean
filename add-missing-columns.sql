-- ============================================================================
-- AGREGAR COLUMNAS FALTANTES A worker_notification_settings
-- ============================================================================
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Agregar las columnas que faltan en worker_notification_settings
ALTER TABLE worker_notification_settings
ADD COLUMN IF NOT EXISTS assignment_change_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS route_update_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS urgent_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS holiday_update_notifications BOOLEAN DEFAULT true;

-- Verificar que las columnas se agregaron correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'worker_notification_settings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensaje de confirmación
-- Si todo sale bien, deberías ver las 5 columnas nuevas en la lista
