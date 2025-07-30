-- ============================================================================
-- SAD LAS - CONFIGURACIÓN INICIAL DE SUPABASE
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA DE USUARIOS DE AUTENTICACIÓN
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker')) DEFAULT 'worker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA DE TRABAJADORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  worker_type TEXT NOT NULL CHECK (worker_type IN ('cuidadora', 'auxiliar', 'enfermera')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA DE USUARIOS/CLIENTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  client_code TEXT UNIQUE NOT NULL,
  medical_conditions TEXT[] DEFAULT '{}',
  emergency_contact JSONB NOT NULL DEFAULT '{"name": "", "phone": "", "relationship": ""}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA DE ASIGNACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('laborables', 'festivos', 'flexible')),
  start_date DATE NOT NULL,
  end_date DATE,
  weekly_hours DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'cancelled')) DEFAULT 'active',
  priority INTEGER NOT NULL CHECK (priority IN (1, 2, 3)) DEFAULT 2,
  schedule JSONB NOT NULL DEFAULT '{
    "monday": {"enabled": false, "timeSlots": []},
    "tuesday": {"enabled": false, "timeSlots": []},
    "wednesday": {"enabled": false, "timeSlots": []},
    "thursday": {"enabled": false, "timeSlots": []},
    "friday": {"enabled": false, "timeSlots": []},
    "saturday": {"enabled": false, "timeSlots": []},
    "sunday": {"enabled": false, "timeSlots": []},
    "holiday": {"enabled": false, "timeSlots": []}
  }',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA DE FESTIVOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA DE BALANCE DE HORAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS hours_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  worked_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  holiday_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  balance DECIMAL(5,2) GENERATED ALWAYS AS (worked_hours - total_hours) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(worker_id, year, month)
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices para workers
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_dni ON workers(dni);
CREATE INDEX IF NOT EXISTS idx_workers_type ON workers(worker_type);
CREATE INDEX IF NOT EXISTS idx_workers_active ON workers(is_active);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_code ON users(client_code);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para assignments
CREATE INDEX IF NOT EXISTS idx_assignments_worker_id ON assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignments_dates ON assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);

-- Índices para holidays
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(year, month, day);
CREATE INDEX IF NOT EXISTS idx_holidays_type ON holidays(type);

-- Índices para hours_balances
CREATE INDEX IF NOT EXISTS idx_hours_balances_worker ON hours_balances(worker_id);
CREATE INDEX IF NOT EXISTS idx_hours_balances_period ON hours_balances(year, month);

-- ============================================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hours_balances_updated_at BEFORE UPDATE ON hours_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar un usuario admin de prueba
INSERT INTO auth_users (email, role) 
VALUES ('admin@sadlas.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar un trabajador de prueba
INSERT INTO workers (name, surname, email, phone, dni, worker_type) 
VALUES ('María', 'García', 'maria.garcia@sadlas.com', '612345678', '12345678A', 'cuidadora')
ON CONFLICT (email) DO NOTHING;

-- Insertar un usuario/cliente de prueba
INSERT INTO users (name, surname, email, phone, address, postal_code, city, client_code, emergency_contact) 
VALUES ('Juan', 'López', 'juan.lopez@email.com', '698765432', 'Calle Mayor 123', '28001', 'Madrid', 'CLI001', '{"name": "Ana López", "phone": "698765433", "relationship": "Hija"}')
ON CONFLICT (client_code) DO NOTHING;

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Base de datos SAD LAS configurada correctamente' as status;