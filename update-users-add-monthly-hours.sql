-- Añade la columna de horas mensuales asignadas a la tabla users
-- Ejecutar en el editor SQL de Supabase

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS monthly_assigned_hours INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.monthly_assigned_hours IS 'Horas totales asignadas al mes por servicios sociales';

-- Verificación rápida
SELECT '✅ Columna monthly_assigned_hours creada/ya existente' AS status;
