-- ============================================================================
-- SAD LAS - CREAR TABLA HOLIDAYS COMPLETA
-- ============================================================================
-- Script completo para crear la tabla holidays desde cero
-- ============================================================================

-- Verificar si la tabla holidays existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'holidays') THEN
        RAISE NOTICE 'La tabla holidays ya existe. Eliminándola...';
        DROP TABLE IF EXISTS holidays CASCADE;
    END IF;
END $$;

-- Crear la tabla holidays con la estructura correcta
CREATE TABLE holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'national',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day, month, year)
);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_holidays_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_holidays_updated_at
    BEFORE UPDATE ON holidays
    FOR EACH ROW
    EXECUTE FUNCTION update_holidays_updated_at_column();

-- Habilitar RLS
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Enable read access for all users" ON holidays
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON holidays
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON holidays
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON holidays
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insertar festivos de prueba para 2024
INSERT INTO holidays (day, month, year, name, type) VALUES
(1, 1, 2024, 'Año Nuevo', 'national'),
(6, 1, 2024, 'Día de Reyes / Epifanía del Señor', 'national'),
(29, 3, 2024, 'Viernes Santo', 'national'),
(1, 4, 2024, 'Lunes de Pascua', 'regional'),
(1, 5, 2024, 'Fiesta del trabajo', 'national'),
(24, 6, 2024, 'Sant Joan', 'regional'),
(15, 8, 2024, 'Asunción', 'national'),
(11, 9, 2024, 'Diada Nacional de Catalunya', 'regional'),
(12, 10, 2024, 'Fiesta Nacional de España', 'national'),
(1, 11, 2024, 'Día de todos los Santos', 'national'),
(6, 12, 2024, 'Día de la Constitución', 'national'),
(8, 12, 2024, 'Inmaculada Concepción', 'national'),
(25, 12, 2024, 'Navidad', 'national'),
(26, 12, 2024, 'Sant Esteve', 'regional')
ON CONFLICT (day, month, year) DO NOTHING;

-- Insertar festivos de prueba para 2025
INSERT INTO holidays (day, month, year, name, type) VALUES
(1, 1, 2025, 'Año Nuevo', 'national'),
(6, 1, 2025, 'Día de Reyes / Epifanía del Señor', 'national'),
(18, 4, 2025, 'Viernes Santo', 'national'),
(21, 4, 2025, 'Lunes de Pascua', 'regional'),
(1, 5, 2025, 'Fiesta del trabajo', 'national'),
(24, 6, 2025, 'Sant Joan', 'regional'),
(15, 8, 2025, 'Asunción', 'national'),
(11, 9, 2025, 'Diada Nacional de Catalunya', 'regional'),
(12, 10, 2025, 'Fiesta Nacional de España', 'national'),
(1, 11, 2025, 'Día de todos los Santos', 'national'),
(6, 12, 2025, 'Día de la Constitución', 'national'),
(8, 12, 2025, 'Inmaculada Concepción', 'national'),
(25, 12, 2025, 'Navidad', 'national'),
(26, 12, 2025, 'Sant Esteve', 'regional')
ON CONFLICT (day, month, year) DO NOTHING;

-- Verificar que se creó correctamente
SELECT 'Holidays table created successfully' as status;
SELECT COUNT(*) as total_holidays FROM holidays;
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'holidays' ORDER BY ordinal_position;
