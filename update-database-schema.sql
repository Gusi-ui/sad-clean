-- Script para actualizar la estructura de la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Añadir columna monthly_hours a la tabla assignments
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS monthly_hours INTEGER DEFAULT 0;

-- 2. Actualizar registros existentes (convertir weekly_hours a monthly_hours)
UPDATE assignments
SET monthly_hours = weekly_hours * 4
WHERE monthly_hours = 0 AND weekly_hours > 0;

-- 3. Actualizar la estructura del schedule para soportar tramos horarios
-- Primero, crear una función para validar el JSON del schedule
CREATE OR REPLACE FUNCTION validate_schedule_json(schedule_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar que el JSON tiene la estructura correcta
  RETURN (
    schedule_json ? 'monday' AND
    schedule_json ? 'tuesday' AND
    schedule_json ? 'wednesday' AND
    schedule_json ? 'thursday' AND
    schedule_json ? 'friday' AND
    schedule_json ? 'saturday' AND
    schedule_json ? 'sunday'
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Crear tabla de festivos si no existe
CREATE TABLE IF NOT EXISTS holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'local' CHECK (type IN ('national', 'regional', 'local')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(year, month, day);
CREATE INDEX IF NOT EXISTS idx_assignments_monthly_hours ON assignments(monthly_hours);
CREATE INDEX IF NOT EXISTS idx_assignments_assignment_type ON assignments(assignment_type);

-- 6. Insertar festivos oficiales de Mataró 2025
INSERT INTO holidays (day, month, year, name, type) VALUES
-- Festivos Nacionales
(1, 1, 2025, 'Cap d''Any', 'national'),
(6, 1, 2025, 'Reis', 'national'),
(18, 4, 2025, 'Divendres Sant', 'national'),
(21, 4, 2025, 'Dilluns de Pasqua Florida', 'national'),
(1, 5, 2025, 'Festa del Treball', 'national'),
(15, 8, 2025, 'L''Assumpció', 'national'),
(1, 11, 2025, 'Tots Sants', 'national'),
(6, 12, 2025, 'Dia de la Constitució', 'national'),
(8, 12, 2025, 'La Immaculada', 'national'),
(25, 12, 2025, 'Nadal', 'national'),
(26, 12, 2025, 'Sant Esteve', 'national'),

-- Festivos Regionales de Catalunya
(24, 6, 2025, 'Sant Joan', 'regional'),
(11, 9, 2025, 'Diada Nacional de Catalunya', 'regional'),

-- Festivos Locales de Mataró
(9, 6, 2025, 'Fira a Mataró', 'local'),
(28, 7, 2025, 'Festa major de Les Santes', 'local')

ON CONFLICT (day, month, year) DO NOTHING;

-- 7. Crear función para obtener festivos de un mes específico
CREATE OR REPLACE FUNCTION get_holidays_for_month(target_month INTEGER, target_year INTEGER)
RETURNS TABLE (
  day INTEGER,
  month INTEGER,
  year INTEGER,
  name TEXT,
  type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.day, h.month, h.year, h.name, h.type
  FROM holidays h
  WHERE h.month = target_month AND h.year = target_year
  ORDER BY h.day;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear función para calcular días laborables, festivos y fines de semana
CREATE OR REPLACE FUNCTION calculate_month_days(
  target_month INTEGER,
  target_year INTEGER
)
RETURNS TABLE (
  laborables INTEGER,
  festivos INTEGER,
  fines_de_semana INTEGER
) AS $$
DECLARE
  days_in_month INTEGER;
  current_day INTEGER;
  current_date DATE;
  day_of_week INTEGER;
  is_holiday BOOLEAN;
  laborables_count INTEGER := 0;
  festivos_count INTEGER := 0;
  fines_de_semana_count INTEGER := 0;
BEGIN
  -- Obtener días en el mes
  days_in_month := EXTRACT(DAY FROM (DATE(target_year || '-' || target_month || '-01') + INTERVAL '1 month - 1 day'));

  -- Iterar por cada día del mes
  FOR current_day IN 1..days_in_month LOOP
    current_date := DATE(target_year || '-' || target_month || '-' || current_day);
    day_of_week := EXTRACT(DOW FROM current_date);

    -- Verificar si es festivo
    SELECT EXISTS(
      SELECT 1 FROM holidays
      WHERE day = current_day AND month = target_month AND year = target_year
    ) INTO is_holiday;

    -- Clasificar el día
    IF is_holiday THEN
      festivos_count := festivos_count + 1;
    ELSIF day_of_week = 0 OR day_of_week = 6 THEN -- Domingo (0) o Sábado (6)
      fines_de_semana_count := fines_de_semana_count + 1;
    ELSE
      laborables_count := laborables_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT laborables_count, festivos_count, fines_de_semana_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear RLS policies para holidays
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read holidays" ON holidays
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción/actualización solo a super admins
CREATE POLICY "Allow super admins to manage holidays" ON holidays
  FOR ALL USING (auth.role() = 'service_role');

-- 10. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_holidays_updated_at
  BEFORE UPDATE ON holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Comentarios para documentación
COMMENT ON TABLE holidays IS 'Tabla de festivos oficiales para el cálculo de horas';
COMMENT ON FUNCTION get_holidays_for_month IS 'Obtiene los festivos de un mes específico';
COMMENT ON FUNCTION calculate_month_days IS 'Calcula la distribución de días en un mes (laborables, festivos, fines de semana)';
