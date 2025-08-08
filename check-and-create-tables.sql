-- ============================================================================
-- SAD LAS - VERIFICAR Y CREAR TABLAS
-- ============================================================================
-- Script para verificar si las tablas existen y crearlas si es necesario
-- ============================================================================

-- Verificar si las tablas existen
DO $$
BEGIN
    -- Verificar si la tabla holidays existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'holidays') THEN
        RAISE NOTICE 'Creando tabla holidays...';

        CREATE TABLE holidays (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
          month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
          year INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

          -- Índices para optimizar consultas
          UNIQUE(day, month, year)
        );

        -- Crear índices
        CREATE INDEX idx_holidays_year_month ON holidays (year, month);
        CREATE INDEX idx_holidays_date ON holidays (day, month, year);

        RAISE NOTICE 'Tabla holidays creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla holidays ya existe';
    END IF;

    -- Verificar si la tabla assignments existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignments') THEN
        RAISE NOTICE 'Creando tabla assignments...';

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

        -- Crear índices
        CREATE INDEX idx_assignments_user_id ON assignments (user_id);
        CREATE INDEX idx_assignments_worker_id ON assignments (worker_id);
        CREATE INDEX idx_assignments_type ON assignments (assignment_type);
        CREATE INDEX idx_assignments_status ON assignments (status);
        CREATE INDEX idx_assignments_dates ON assignments (start_date, end_date);

        RAISE NOTICE 'Tabla assignments creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla assignments ya existe';
    END IF;
END $$;

-- Verificar la estructura de las tablas
SELECT
    'holidays' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'holidays'
ORDER BY ordinal_position;

SELECT
    'assignments' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- Verificar restricciones únicas
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('holidays', 'assignments')
    AND tc.constraint_type = 'UNIQUE';
