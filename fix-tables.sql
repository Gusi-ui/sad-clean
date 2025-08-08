  -- ============================================================================
  -- SAD LAS - CORREGIR TABLAS
  -- ============================================================================
  -- Script para corregir las tablas existentes o recrearlas
  -- ============================================================================

  -- Eliminar tablas existentes si tienen estructura incorrecta
  DROP TABLE IF EXISTS assignments CASCADE;
  DROP TABLE IF EXISTS holidays CASCADE;

  -- Crear tabla holidays con la estructura correcta
  CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Restricción única para evitar duplicados
    UNIQUE(day, month, year)
  );

  -- Crear índices para holidays
  CREATE INDEX idx_holidays_year_month ON holidays (year, month);
  CREATE INDEX idx_holidays_date ON holidays (day, month, year);

  -- Crear tabla assignments con la estructura correcta
  CREATE TABLE assignments (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para assignments
  CREATE INDEX idx_assignments_user_id ON assignments (user_id);
  CREATE INDEX idx_assignments_worker_id ON assignments (worker_id);
  CREATE INDEX idx_assignments_type ON assignments (assignment_type);
  CREATE INDEX idx_assignments_status ON assignments (status);
  CREATE INDEX idx_assignments_dates ON assignments (start_date, end_date);

  -- Crear función para updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Crear triggers
  DROP TRIGGER IF EXISTS update_holidays_updated_at ON holidays;
  CREATE TRIGGER update_holidays_updated_at
      BEFORE UPDATE ON holidays
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
  CREATE TRIGGER update_assignments_updated_at
      BEFORE UPDATE ON assignments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Habilitar RLS
  ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
  ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

  -- Crear políticas RLS
  DROP POLICY IF EXISTS "Holidays are viewable by everyone" ON holidays;
  CREATE POLICY "Holidays are viewable by everyone" ON holidays
      FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Holidays are insertable by authenticated users" ON holidays;
  CREATE POLICY "Holidays are insertable by authenticated users" ON holidays
      FOR INSERT WITH CHECK (auth.role() IN ('admin', 'super_admin'));

  DROP POLICY IF EXISTS "Holidays are updatable by authenticated users" ON holidays;
  CREATE POLICY "Holidays are updatable by authenticated users" ON holidays
      FOR UPDATE USING (auth.role() IN ('admin', 'super_admin'));

  DROP POLICY IF EXISTS "Holidays are deletable by authenticated users" ON holidays;
  CREATE POLICY "Holidays are deletable by authenticated users" ON holidays
      FOR DELETE USING (auth.role() IN ('admin', 'super_admin'));

  DROP POLICY IF EXISTS "Assignments are viewable by authenticated users" ON assignments;
  CREATE POLICY "Assignments are viewable by authenticated users" ON assignments
      FOR SELECT USING (auth.role() IN ('admin', 'super_admin', 'worker'));

  DROP POLICY IF EXISTS "Assignments are insertable by authenticated users" ON assignments;
  CREATE POLICY "Assignments are insertable by authenticated users" ON assignments
      FOR INSERT WITH CHECK (auth.role() IN ('admin', 'super_admin'));

  DROP POLICY IF EXISTS "Assignments are updatable by authenticated users" ON assignments;
  CREATE POLICY "Assignments are updatable by authenticated users" ON assignments
      FOR UPDATE USING (auth.role() IN ('admin', 'super_admin'));

  DROP POLICY IF EXISTS "Assignments are deletable by authenticated users" ON assignments;
  CREATE POLICY "Assignments are deletable by authenticated users" ON assignments
      FOR DELETE USING (auth.role() IN ('admin', 'super_admin'));

  -- Insertar datos de prueba
  INSERT INTO holidays (day, month, year, name, type) VALUES
  -- Enero 2024
  (1, 1, 2024, 'Año Nuevo', 'national'),
  (6, 1, 2024, 'Epifanía del Señor', 'national'),

  -- Febrero 2024
  (12, 2, 2024, 'Carnaval', 'regional'),

  -- Marzo 2024
  (29, 3, 2024, 'Viernes Santo', 'national'),

  -- Abril 2024
  (1, 4, 2024, 'Lunes de Pascua', 'national'),

  -- Mayo 2024
  (1, 5, 2024, 'Día del Trabajador', 'national'),

  -- Junio 2024
  (24, 6, 2024, 'San Juan', 'regional'),

  -- Julio 2024
  (15, 7, 2024, 'Virgen del Carmen', 'regional'),

  -- Agosto 2024
  (15, 8, 2024, 'Asunción de la Virgen', 'national'),

  -- Septiembre 2024
  (11, 9, 2024, 'Diada de Catalunya', 'regional'),

  -- Octubre 2024
  (12, 10, 2024, 'Día de la Hispanidad', 'national'),

  -- Noviembre 2024
  (1, 11, 2024, 'Todos los Santos', 'national'),

  -- Diciembre 2024
  (6, 12, 2024, 'Día de la Constitución', 'national'),
  (8, 12, 2024, 'Inmaculada Concepción', 'national'),
  (25, 12, 2024, 'Navidad', 'national'),
  (26, 12, 2024, 'San Esteban', 'regional');

  -- Insertar usuarios de prueba
  INSERT INTO users (id, name, surname, email, phone, address, postal_code, city, client_code, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Juan', 'López García', 'juan.lopez@test.com', '612345678', 'Calle Mayor 123, Mataró', '08301', 'Mataró', 'CLI001', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'María', 'García Ruiz', 'maria.garcia@test.com', '623456789', 'Avenida Catalunya 45, Mataró', '08302', 'Mataró', 'CLI002', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Pedro', 'Ruiz López', 'pedro.ruiz@test.com', '634567890', 'Plaza España 7, Mataró', '08303', 'Mataró', 'CLI003', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insertar trabajadoras de prueba
INSERT INTO workers (id, name, surname, email, phone, dni, worker_type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Ana', 'Martínez', 'ana.martinez@test.com', '645678901', '12345678A', 'worker', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Carmen', 'Rodríguez', 'carmen.rodriguez@test.com', '656789012', '23456789B', 'worker', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Isabel', 'Fernández', 'isabel.fernandez@test.com', '667890123', '34567890C', 'worker', NOW())
ON CONFLICT (id) DO NOTHING;

  -- Insertar asignaciones de prueba
  INSERT INTO assignments (
    id,
    user_id,
    worker_id,
    assignment_type,
    weekly_hours,
    schedule,
    start_date,
    end_date,
    status,
    created_at
  ) VALUES
  -- Usuario 1: 86 horas mensuales, servicio todos los días
  (
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440004',
    'laborables',
    86,
    '{
      "monday": {
        "slots": [
          {"start": "08:00", "end": "09:30"},
          {"start": "13:00", "end": "15:00"}
        ],
        "totalHours": 3.5
      },
      "tuesday": {
        "slots": [
          {"start": "08:00", "end": "09:30"},
          {"start": "13:00", "end": "15:00"}
        ],
        "totalHours": 3.5
      },
      "wednesday": {
        "slots": [
          {"start": "08:00", "end": "09:30"},
          {"start": "13:00", "end": "15:00"}
        ],
        "totalHours": 3.5
      },
      "thursday": {
        "slots": [
          {"start": "08:00", "end": "09:30"},
          {"start": "13:00", "end": "15:00"}
        ],
        "totalHours": 3.5
      },
      "friday": {
        "slots": [
          {"start": "08:00", "end": "09:30"},
          {"start": "13:00", "end": "15:00"}
        ],
        "totalHours": 3.5
      },
      "saturday": {
        "slots": [
          {"start": "08:00", "end": "09:30"}
        ],
        "totalHours": 1.5
      },
      "sunday": {
        "slots": [
          {"start": "08:00", "end": "09:30"}
        ],
        "totalHours": 1.5
      }
    }',
    '2024-01-01',
    '2024-12-31',
    'active',
    NOW()
  ),

  -- Usuario 2: 41 horas mensuales, solo días laborables
  (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440005',
    'laborables',
    41,
    '{
      "monday": {
        "slots": [
          {"start": "11:15", "end": "11:45"}
        ],
        "totalHours": 0.5
      },
      "tuesday": {
        "slots": [
          {"start": "09:45", "end": "12:45"}
        ],
        "totalHours": 3.0
      },
      "wednesday": {
        "slots": [
          {"start": "11:15", "end": "11:45"}
        ],
        "totalHours": 0.5
      },
      "thursday": {
        "slots": [
          {"start": "09:45", "end": "12:45"}
        ],
        "totalHours": 3.0
      },
      "friday": {
        "slots": [
          {"start": "11:45", "end": "12:45"}
        ],
        "totalHours": 1.0
      },
      "saturday": {
        "slots": [],
        "totalHours": 0
      },
      "sunday": {
        "slots": [],
        "totalHours": 0
      }
    }',
    '2024-01-01',
    '2024-12-31',
    'active',
    NOW()
  ),

  -- Usuario 3: 60 horas mensuales, servicio flexible
  (
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440006',
    'flexible',
    60,
    '{
      "monday": {
        "slots": [
          {"start": "09:00", "end": "11:00"}
        ],
        "totalHours": 2.0
      },
      "tuesday": {
        "slots": [
          {"start": "09:00", "end": "11:00"}
        ],
        "totalHours": 2.0
      },
      "wednesday": {
        "slots": [
          {"start": "09:00", "end": "11:00"}
        ],
        "totalHours": 2.0
      },
      "thursday": {
        "slots": [
          {"start": "09:00", "end": "11:00"}
        ],
        "totalHours": 2.0
      },
      "friday": {
        "slots": [
          {"start": "09:00", "end": "11:00"}
        ],
        "totalHours": 2.0
      },
      "saturday": {
        "slots": [
          {"start": "10:00", "end": "12:00"}
        ],
        "totalHours": 2.0
      },
      "sunday": {
        "slots": [
          {"start": "10:00", "end": "12:00"}
        ],
        "totalHours": 2.0
      }
    }',
    '2024-01-01',
    '2024-12-31',
    'active',
    NOW()
  );

  -- Verificar que todo esté correcto
  SELECT 'Sistema configurado correctamente' as status;
  SELECT 'Holidays count:' as info, COUNT(*) as count FROM holidays
  UNION ALL
  SELECT 'Users count:', COUNT(*) FROM users WHERE id LIKE 'user-test-%'
  UNION ALL
  SELECT 'Workers count:', COUNT(*) FROM workers WHERE id LIKE 'worker-test-%'
  UNION ALL
  SELECT 'Assignments count:', COUNT(*) FROM assignments WHERE id LIKE 'assign-test-%';
