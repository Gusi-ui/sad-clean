-- ============================================================================
-- SAD LAS - SISTEMA DE ASIGNACIONES Y FESTIVOS
-- ============================================================================
-- Script para crear las tablas necesarias para el sistema de asignaciones
-- ============================================================================

-- ============================================================================
-- TABLA DE FESTIVOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices para optimizar consultas
  UNIQUE(day, month, year),
  INDEX idx_holidays_year_month (year, month),
  INDEX idx_holidays_date (day, month, year)
);

-- ============================================================================
-- TABLA DE ASIGNACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('laborables', 'festivos', 'flexible')),
  weekly_hours DECIMAL(5,2) NOT NULL CHECK (weekly_hours > 0),
  schedule JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices para optimizar consultas
  INDEX idx_assignments_user_id (user_id),
  INDEX idx_assignments_worker_id (worker_id),
  INDEX idx_assignments_type (assignment_type),
  INDEX idx_assignments_status (status),
  INDEX idx_assignments_dates (start_date, end_date)
);

-- ============================================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ============================================================================

CREATE TRIGGER update_holidays_updated_at
    BEFORE UPDATE ON holidays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS en las tablas
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para holidays (lectura pública, escritura solo para admins)
CREATE POLICY "Holidays are viewable by everyone" ON holidays
    FOR SELECT USING (true);

CREATE POLICY "Holidays are insertable by authenticated users" ON holidays
    FOR INSERT WITH CHECK (auth.role() IN ('admin', 'super_admin'));

CREATE POLICY "Holidays are updatable by authenticated users" ON holidays
    FOR UPDATE USING (auth.role() IN ('admin', 'super_admin'));

CREATE POLICY "Holidays are deletable by authenticated users" ON holidays
    FOR DELETE USING (auth.role() IN ('admin', 'super_admin'));

-- Políticas para assignments
CREATE POLICY "Assignments are viewable by authenticated users" ON assignments
    FOR SELECT USING (auth.role() IN ('admin', 'super_admin', 'worker'));

CREATE POLICY "Assignments are insertable by authenticated users" ON assignments
    FOR INSERT WITH CHECK (auth.role() IN ('admin', 'super_admin'));

CREATE POLICY "Assignments are updatable by authenticated users" ON assignments
    FOR UPDATE USING (auth.role() IN ('admin', 'super_admin'));

CREATE POLICY "Assignments are deletable by authenticated users" ON assignments
    FOR DELETE USING (auth.role() IN ('admin', 'super_admin'));

-- ============================================================================
-- DATOS DE EJEMPLO - FESTIVOS DE MATARÓ 2024
-- ============================================================================

INSERT INTO holidays (date, name, type, city, year) VALUES
-- Festivos nacionales 2024
('2024-01-01', 'Año Nuevo', 'national', 'Mataró', 2024),
('2024-01-06', 'Epifanía del Señor', 'national', 'Mataró', 2024),
('2024-03-29', 'Viernes Santo', 'national', 'Mataró', 2024),
('2024-04-01', 'Lunes de Pascua', 'national', 'Mataró', 2024),
('2024-05-01', 'Día del Trabajador', 'national', 'Mataró', 2024),
('2024-08-15', 'Asunción de la Virgen', 'national', 'Mataró', 2024),
('2024-10-12', 'Día de la Hispanidad', 'national', 'Mataró', 2024),
('2024-11-01', 'Todos los Santos', 'national', 'Mataró', 2024),
('2024-12-06', 'Día de la Constitución', 'national', 'Mataró', 2024),
('2024-12-25', 'Navidad', 'national', 'Mataró', 2024),

-- Festivos de Cataluña 2024
('2024-06-24', 'San Juan', 'regional', 'Mataró', 2024),
('2024-09-11', 'Diada de Catalunya', 'regional', 'Mataró', 2024),
('2024-12-26', 'San Esteban', 'regional', 'Mataró', 2024)

ON CONFLICT (date, city) DO NOTHING;

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista para obtener estadísticas de asignaciones
CREATE OR REPLACE VIEW assignment_stats AS
SELECT
    COUNT(*) as total_assignments,
    COUNT(*) FILTER (WHERE is_active = true) as active_assignments,
    COUNT(*) FILTER (WHERE assignment_type = 'laborables') as laborable_assignments,
    COUNT(*) FILTER (WHERE assignment_type = 'festivos') as holiday_assignments,
    COUNT(*) FILTER (WHERE assignment_type = 'flexible') as flexible_assignments,
    SUM(monthly_hours) as total_monthly_hours
FROM assignments;

-- Vista para obtener asignaciones con información de usuario y trabajadora
CREATE OR REPLACE VIEW assignment_details AS
SELECT
    a.*,
    u.name as user_name,
    u.surname as user_surname,
    w.name as worker_name,
    w.surname as worker_surname
FROM assignments a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN workers w ON a.worker_id = w.id;
