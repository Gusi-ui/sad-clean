-- Script para configurar políticas RLS en la tabla holidays
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla holidays
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Enable read access for all users" ON public.holidays;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.holidays;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.holidays;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.holidays;

-- 3. Crear políticas para permitir acceso completo a usuarios autenticados
CREATE POLICY "Enable read access for all users" ON public.holidays
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for all users" ON public.holidays
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.holidays
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.holidays
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Verificar que las políticas se crearon correctamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'holidays'
ORDER BY policyname;
