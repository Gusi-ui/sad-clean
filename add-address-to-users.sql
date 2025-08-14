-- Agregar columna address a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Crear índice para mejorar el rendimiento de búsquedas por dirección
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address) WHERE address IS NOT NULL;

-- Comentario para documentar la nueva columna
COMMENT ON COLUMN users.address IS 'Dirección completa del usuario para cálculos de rutas';

-- Ejemplo de cómo actualizar direcciones (opcional)
-- UPDATE users SET address = 'Calle Mayor 123, Madrid' WHERE id = 'user_id_here';
