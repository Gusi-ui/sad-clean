-- ============================================================================
-- AÑADIR CAMPOS DE DIRECCIÓN A LA TABLA WORKERS
-- ============================================================================
-- Este script añade los campos de dirección y código postal a la tabla workers
-- para permitir el cálculo de rutas desde la dirección de la trabajadora
-- ============================================================================

-- Añadir campo de dirección
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Añadir campo de código postal
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Añadir campo de ciudad
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Comentario para documentar los cambios
COMMENT ON COLUMN workers.address IS 'Dirección completa de la trabajadora para cálculo de rutas';
COMMENT ON COLUMN workers.postal_code IS 'Código postal de la trabajadora';
COMMENT ON COLUMN workers.city IS 'Ciudad donde reside la trabajadora';

-- Verificar que las columnas se han añadido correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workers' 
AND column_name IN ('address', 'postal_code', 'city')
ORDER BY column_name;