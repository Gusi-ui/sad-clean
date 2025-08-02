-- ============================================================================
-- SAD LAS - MIGRACIÓN DE ESQUEMA
-- ============================================================================
-- OBJETIVO: Añadir la columna 'name' a la tabla 'auth_users' para
--           almacenar el nombre completo de los administradores y otros usuarios.
--
-- Ejecutar este script en el SQL Editor de Supabase para aplicar el cambio.
-- ============================================================================

-- Añadir la columna 'name' de tipo TEXT a la tabla 'auth_users'
-- La columna puede ser NULL inicialmente si ya existen usuarios.
ALTER TABLE public.auth_users
ADD COLUMN IF NOT EXISTS name TEXT;

-- Comentario para documentar la nueva columna
COMMENT ON COLUMN public.auth_users.name IS 'Nombre completo del usuario, sincronizado desde user_metadata.';

-- Mensaje de verificación
SELECT '✅ Columna "name" añadida exitosamente a la tabla "auth_users".' as status;
