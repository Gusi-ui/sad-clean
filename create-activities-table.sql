-- ============================================================================
-- SAD LAS - TABLA DE ACTIVIDADES DEL SISTEMA
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- TABLA DE ACTIVIDADES
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'worker_created',
      'worker_updated',
      'worker_deleted',
      'user_created',
      'user_updated',
      'user_deleted',
      'assignment_created',
      'assignment_updated',
      'assignment_completed',
      'assignment_cancelled',
      'service_completed',
      'admin_created',
      'admin_updated',
      'admin_deleted',
      'login',
      'logout',
      'password_reset',
      'profile_updated'
    )
  ),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'worker',
      'user',
      'assignment',
      'service',
      'admin',
      'system'
    )
  ),
  entity_id UUID,
  entity_name TEXT,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_system_activities_user_id ON system_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activities_activity_type ON system_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activities_entity_type ON system_activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_system_activities_created_at ON system_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_activities_user_email ON system_activities(user_email);

-- ============================================================================
-- FUNCIÓN PARA REGISTRAR ACTIVIDADES
-- ============================================================================

CREATE OR REPLACE FUNCTION log_system_activity(
  p_activity_type TEXT,
  p_entity_type TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
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
    user_agent
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
    p_user_agent
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN PARA OBTENER ACTIVIDADES RECIENTES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_recent_activities(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  user_name TEXT,
  activity_type TEXT,
  entity_type TEXT,
  entity_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  time_ago TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

ALTER TABLE system_activities ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a administradores y super administradores
CREATE POLICY "Allow admins to read activities" ON system_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_users au
      WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'super_admin')
    )
  );

-- Permitir inserción a todos los usuarios autenticados
CREATE POLICY "Allow authenticated users to insert activities" ON system_activities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- MENSAJE DE VERIFICACIÓN
-- ============================================================================

SELECT '✅ Tabla system_activities creada exitosamente' as status;
SELECT '✅ Función log_system_activity creada' as status;
SELECT '✅ Función get_recent_activities creada' as status;
SELECT '✅ Políticas RLS configuradas' as status;
