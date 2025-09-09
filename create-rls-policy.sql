-- Crear política RLS para permitir acceso de lectura a workers
-- Esta política permite que usuarios anónimos puedan leer la lista de workers

-- Habilitar RLS en la tabla workers (por si no está habilitado)
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Crear política que permite SELECT para todos los usuarios (incluyendo anónimos)
-- Solo permitimos leer campos básicos (id, name, surname, email)
CREATE POLICY "Allow public read access to workers" ON workers
FOR SELECT
TO public
USING (true);

-- Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'workers';
