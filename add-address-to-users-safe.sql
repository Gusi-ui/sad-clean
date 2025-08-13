-- Script seguro para agregar columna address a la tabla users
-- Este script no fallará si la columna ya existe

-- Agregar columna address a la tabla users (si no existe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Crear índice para mejorar el rendimiento de búsquedas por dirección (si no existe)
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address) WHERE address IS NOT NULL;

-- Comentario para documentar la nueva columna
COMMENT ON COLUMN users.address IS 'Dirección completa del usuario para cálculos de rutas';

-- Mensaje de confirmación
SELECT 'Columna address agregada correctamente a la tabla users' as status;
