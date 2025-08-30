-- ============================================================================
-- ESQUEMA DE BASE DE DATOS PARA APP MÓVIL - SAD LAS
-- ============================================================================

-- Este script crea las tablas necesarias para soportar la aplicación móvil
-- que se alimenta del panel administrativo web.

-- ============================================================================
-- TABLA: worker_locations (Geolocalización)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    accuracy DECIMAL(5, 2), -- Precisión en metros
    altitude DECIMAL(8, 2), -- Altitud en metros (opcional)
    speed DECIMAL(5, 2), -- Velocidad en m/s (opcional)
    heading DECIMAL(5, 2), -- Dirección en grados (opcional)
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_id TEXT, -- Identificador del dispositivo
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100), -- Nivel de batería
    network_type TEXT, -- Tipo de red (wifi, 4g, 3g, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas de ubicación
CREATE INDEX IF NOT EXISTS idx_worker_locations_worker_id ON worker_locations(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_timestamp ON worker_locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_worker_locations_worker_timestamp ON worker_locations(worker_id, timestamp DESC);

-- ============================================================================
-- TABLA: worker_notifications (Notificaciones Push)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('assignment', 'reminder', 'message', 'system', 'route_change')),
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
-- TABLA: worker_connections (Conexiones WebSocket)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    connection_id TEXT NOT NULL, -- ID de la conexión WebSocket
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ, -- Cuándo se desconectó
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET, -- Dirección IP del cliente
    user_agent TEXT, -- User agent del navegador/app
    is_active BOOLEAN DEFAULT true, -- Si la conexión está activa
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para conexiones
CREATE INDEX IF NOT EXISTS idx_worker_connections_worker_id ON worker_connections(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_connections_active ON worker_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_worker_connections_last_activity ON worker_connections(last_activity);

-- ============================================================================
-- TABLA: refresh_tokens (Tokens de Renovación)
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, -- Hash del token (no almacenar el token directamente)
    device_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ, -- Cuándo fue revocado
    ip_address INET, -- IP desde donde se creó
    user_agent TEXT, -- User agent
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para refresh tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_worker_id ON refresh_tokens(worker_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked_at);

-- ============================================================================
-- TABLA: worker_sessions (Sesiones de Trabajador)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ, -- Cuándo terminó la sesión
    duration_minutes INTEGER, -- Duración en minutos
    ip_address INET,
    user_agent TEXT,
    location_data JSONB, -- Datos de ubicación durante la sesión
    activities_count INTEGER DEFAULT 0, -- Número de actividades realizadas
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_worker_sessions_worker_id ON worker_sessions(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_sessions_session_start ON worker_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_worker_sessions_device_id ON worker_sessions(device_id);

-- ============================================================================
-- TABLA: sync_operations (Operaciones de Sincronización Offline)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('assignment_update', 'note_create', 'location_update', 'status_change')),
    operation_data JSONB NOT NULL, -- Datos de la operación
    client_timestamp TIMESTAMPTZ NOT NULL, -- Timestamp del cliente
    server_timestamp TIMESTAMPTZ DEFAULT NOW(), -- Timestamp del servidor
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT, -- Mensaje de error si falló
    retry_count INTEGER DEFAULT 0, -- Número de reintentos
    processed_at TIMESTAMPTZ, -- Cuándo fue procesada
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para operaciones de sincronización
CREATE INDEX IF NOT EXISTS idx_sync_operations_worker_id ON sync_operations(worker_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
CREATE INDEX IF NOT EXISTS idx_sync_operations_pending ON sync_operations(worker_id, status) WHERE status = 'pending';

-- ============================================================================
-- TABLA: assignment_activities (Actividades de Asignación)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignment_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('started', 'paused', 'resumed', 'completed', 'cancelled', 'note_added', 'location_updated')),
    activity_data JSONB, -- Datos específicos de la actividad
    location_lat DECIMAL(10, 8), -- Latitud donde ocurrió la actividad
    location_lng DECIMAL(11, 8), -- Longitud donde ocurrió la actividad
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_id TEXT, -- Dispositivo desde donde se realizó
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para actividades de asignación
CREATE INDEX IF NOT EXISTS idx_assignment_activities_assignment_id ON assignment_activities(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_activities_worker_id ON assignment_activities(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignment_activities_timestamp ON assignment_activities(timestamp);

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE worker_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA worker_locations
-- ============================================================================

-- Los trabajadores solo pueden ver sus propias ubicaciones
CREATE POLICY "Workers can view own locations" ON worker_locations
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden insertar sus propias ubicaciones
CREATE POLICY "Workers can insert own locations" ON worker_locations
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Los administradores pueden ver todas las ubicaciones
CREATE POLICY "Admins can view all locations" ON worker_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA worker_notifications
-- ============================================================================

-- Los trabajadores solo pueden ver sus propias notificaciones
CREATE POLICY "Workers can view own notifications" ON worker_notifications
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden marcar sus notificaciones como leídas
CREATE POLICY "Workers can update own notifications" ON worker_notifications
    FOR UPDATE USING (auth.uid() = worker_id);

-- Los administradores pueden crear notificaciones para trabajadores
CREATE POLICY "Admins can create notifications" ON worker_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Los administradores pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications" ON worker_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA worker_devices
-- ============================================================================

-- Los trabajadores solo pueden ver sus propios dispositivos
CREATE POLICY "Workers can view own devices" ON worker_devices
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden registrar sus propios dispositivos
CREATE POLICY "Workers can insert own devices" ON worker_devices
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Los trabajadores pueden actualizar sus propios dispositivos
CREATE POLICY "Workers can update own devices" ON worker_devices
    FOR UPDATE USING (auth.uid() = worker_id);

-- Los administradores pueden ver todos los dispositivos
CREATE POLICY "Admins can view all devices" ON worker_devices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA assignment_activities
-- ============================================================================

-- Los trabajadores solo pueden ver actividades de sus asignaciones
CREATE POLICY "Workers can view own assignment activities" ON assignment_activities
    FOR SELECT USING (auth.uid() = worker_id);

-- Los trabajadores pueden crear actividades para sus asignaciones
CREATE POLICY "Workers can insert own assignment activities" ON assignment_activities
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Los administradores pueden ver todas las actividades
CREATE POLICY "Admins can view all assignment activities" ON assignment_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar conexiones inactivas (más de 1 hora)
CREATE OR REPLACE FUNCTION cleanup_inactive_connections()
RETURNS void AS $$
BEGIN
    UPDATE worker_connections
    SET is_active = false, disconnected_at = NOW()
    WHERE is_active = true AND last_activity < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Función para obtener la ubicación más reciente de un trabajador
CREATE OR REPLACE FUNCTION get_worker_latest_location(worker_uuid UUID)
RETURNS TABLE (
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(5, 2),
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wl.latitude,
        wl.longitude,
        wl.accuracy,
        wl.timestamp
    FROM worker_locations wl
    WHERE wl.worker_id = worker_uuid
    ORDER BY wl.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

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
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar last_activity en worker_connections
CREATE OR REPLACE FUNCTION update_connection_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_connection_activity
    BEFORE UPDATE ON worker_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connection_activity();

-- Trigger para registrar actividad cuando se actualiza una asignación
CREATE OR REPLACE FUNCTION log_assignment_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si hay cambios en el estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO assignment_activities (
            assignment_id,
            worker_id,
            activity_type,
            activity_data,
            timestamp
        ) VALUES (
            NEW.id,
            NEW.worker_id,
            CASE
                WHEN NEW.status = 'in_progress' THEN 'started'
                WHEN NEW.status = 'completed' THEN 'completed'
                WHEN NEW.status = 'cancelled' THEN 'cancelled'
                ELSE 'status_change'
            END,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'assignment_id', NEW.id
            ),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_assignment_activity
    AFTER UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_activity();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista para el dashboard de administradores con información de trabajadores
CREATE OR REPLACE VIEW worker_dashboard_view AS
SELECT
    w.id as worker_id,
    w.email,
    w.raw_user_meta_data->>'name' as worker_name,
    wl.latitude,
    wl.longitude,
    wl.timestamp as last_location_time,
    wc.is_active as is_online,
    wc.last_activity,
    COUNT(wn.id) FILTER (WHERE wn.read_at IS NULL) as unread_notifications,
    COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE) as today_assignments,
    COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status = 'completed') as completed_today
FROM auth_users w
LEFT JOIN worker_locations wl ON w.id = wl.worker_id
    AND wl.timestamp = (
        SELECT MAX(timestamp)
        FROM worker_locations
        WHERE worker_id = w.id
    )
LEFT JOIN worker_connections wc ON w.id = wc.worker_id
    AND wc.is_active = true
LEFT JOIN worker_notifications wn ON w.id = wn.worker_id
    AND wn.read_at IS NULL
LEFT JOIN assignments a ON w.id = a.worker_id
WHERE w.role = 'worker'
GROUP BY w.id, w.email, w.raw_user_meta_data, wl.latitude, wl.longitude, wl.timestamp, wc.is_active, wc.last_activity;

-- Vista para trabajadores con resumen de su día
CREATE OR REPLACE VIEW worker_summary_view AS
SELECT
    w.id as worker_id,
    w.email,
    w.raw_user_meta_data->>'name' as worker_name,
    COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE) as today_assignments,
    COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status = 'completed') as completed_today,
    COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status = 'in_progress') as in_progress_today,
    COUNT(wn.id) FILTER (WHERE wn.read_at IS NULL) as unread_notifications,
    wl.latitude as last_lat,
    wl.longitude as last_lng,
    wl.timestamp as last_location_time
FROM auth_users w
LEFT JOIN assignments a ON w.id = a.worker_id
LEFT JOIN worker_notifications wn ON w.id = wn.worker_id
LEFT JOIN worker_locations wl ON w.id = wl.worker_id
    AND wl.timestamp = (
        SELECT MAX(timestamp)
        FROM worker_locations
        WHERE worker_id = w.id
    )
WHERE w.id = auth.uid() AND w.role = 'worker'
GROUP BY w.id, w.email, w.raw_user_meta_data, wl.latitude, wl.longitude, wl.timestamp;

-- ============================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_assignments_worker_date_status ON assignments(worker_id, date, status);
CREATE INDEX IF NOT EXISTS idx_worker_notes_worker_assignment ON worker_notes(worker_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_worker_recent ON worker_locations(worker_id, timestamp DESC) WHERE timestamp > NOW() - INTERVAL '24 hours';

-- Índices para búsquedas de texto
CREATE INDEX IF NOT EXISTS idx_worker_notifications_title_body ON worker_notifications USING gin(to_tsvector('spanish', title || ' ' || body));

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE worker_locations IS 'Almacena las ubicaciones GPS de los trabajadores para tracking en tiempo real';
COMMENT ON TABLE worker_notifications IS 'Notificaciones push y mensajes para los trabajadores';
COMMENT ON TABLE worker_devices IS 'Dispositivos móviles autorizados para cada trabajador';
COMMENT ON TABLE worker_connections IS 'Conexiones WebSocket activas de los trabajadores';
COMMENT ON TABLE refresh_tokens IS 'Tokens de renovación para autenticación JWT';
COMMENT ON TABLE worker_sessions IS 'Sesiones de trabajo con duración y actividades';
COMMENT ON TABLE sync_operations IS 'Operaciones offline pendientes de sincronización';
COMMENT ON TABLE assignment_activities IS 'Registro detallado de actividades en asignaciones';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'worker_locations',
        'worker_notifications',
        'worker_devices',
        'worker_connections',
        'refresh_tokens',
        'worker_sessions',
        'sync_operations',
        'assignment_activities'
    ];
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) THEN
            RAISE EXCEPTION 'La tabla % no se creó correctamente', table_name;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ Todas las tablas para la app móvil se crearon correctamente';
END $$;

-- Mostrar resumen de las tablas creadas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN (
    'worker_locations',
    'worker_notifications',
    'worker_devices',
    'worker_connections',
    'refresh_tokens',
    'worker_sessions',
    'sync_operations',
    'assignment_activities'
)
ORDER BY table_name;
