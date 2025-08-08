-- Verificar si la tabla holidays existe y sus políticas RLS
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'holidays';

-- Verificar políticas RLS existentes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'holidays';

-- Habilitar RLS en la tabla holidays si no está habilitado
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura a todos los usuarios autenticados
DROP POLICY IF EXISTS "Allow read access to holidays" ON public.holidays;
CREATE POLICY "Allow read access to holidays" ON public.holidays
    FOR SELECT
    TO authenticated
    USING (true);

-- Crear política para permitir inserción a usuarios autenticados
DROP POLICY IF EXISTS "Allow insert access to holidays" ON public.holidays;
CREATE POLICY "Allow insert access to holidays" ON public.holidays
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Crear política para permitir actualización a usuarios autenticados
DROP POLICY IF EXISTS "Allow update access to holidays" ON public.holidays;
CREATE POLICY "Allow update access to holidays" ON public.holidays
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar que las políticas se crearon correctamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'holidays';
