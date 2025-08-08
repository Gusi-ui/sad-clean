-- ============================================================================
-- SAD LAS - APLICAR SISTEMA DE ASIGNACIONES (VERSIÓN SIMPLIFICADA)
-- ============================================================================
-- Script para aplicar solo las partes necesarias sin conflictos
-- ============================================================================

-- ============================================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at (si no existe)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- DATOS DE PRUEBA
-- ============================================================================

-- Insertar festivos de prueba para 2024 (Mataró)
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
(26, 12, 2024, 'San Esteban', 'regional')
ON CONFLICT (day, month, year) DO NOTHING;

-- Insertar usuarios de prueba si no existen
INSERT INTO users (id, name, email, phone, address, status, created_at) VALUES
('user-test-1', 'Juan López García', 'juan.lopez@test.com', '612345678', 'Calle Mayor 123, Mataró', 'active', NOW()),
('user-test-2', 'María García Ruiz', 'maria.garcia@test.com', '623456789', 'Avenida Catalunya 45, Mataró', 'active', NOW()),
('user-test-3', 'Pedro Ruiz López', 'pedro.ruiz@test.com', '634567890', 'Plaza España 7, Mataró', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar trabajadoras de prueba si no existen
INSERT INTO workers (id, name, email, phone, status, created_at) VALUES
('worker-test-1', 'Ana Martínez', 'ana.martinez@test.com', '645678901', 'active', NOW()),
('worker-test-2', 'Carmen Rodríguez', 'carmen.rodriguez@test.com', '656789012', 'active', NOW()),
('worker-test-3', 'Isabel Fernández', 'isabel.fernandez@test.com', '667890123', 'active', NOW())
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
  'assign-test-1',
  'user-test-1',
  'worker-test-1',
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
  'assign-test-2',
  'user-test-2',
  'worker-test-2',
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
  'assign-test-3',
  'user-test-3',
  'worker-test-3',
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
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar datos insertados
SELECT 'Holidays count:' as info, COUNT(*) as count FROM holidays WHERE year = 2024
UNION ALL
SELECT 'Users count:', COUNT(*) FROM users WHERE id LIKE 'user-test-%'
UNION ALL
SELECT 'Workers count:', COUNT(*) FROM workers WHERE id LIKE 'worker-test-%'
UNION ALL
SELECT 'Assignments count:', COUNT(*) FROM assignments WHERE id LIKE 'assign-test-%';
