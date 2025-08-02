-- ============================================================================
-- SAD LAS - FIX WORKERS RLS POLICIES
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- HABILITAR RLS EN TABLA WORKERS (si no está habilitado)
-- ============================================================================

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREAR POLÍTICAS RLS PARA WORKERS
-- ============================================================================

-- Política para que super_admin y admin puedan ver todos los workers
DROP POLICY IF EXISTS "Admin can view all workers" ON workers;
CREATE POLICY "Admin can view all workers" ON workers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan insertar workers
DROP POLICY IF EXISTS "Admin can insert workers" ON workers;
CREATE POLICY "Admin can insert workers" ON workers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan actualizar workers
DROP POLICY IF EXISTS "Admin can update workers" ON workers;
CREATE POLICY "Admin can update workers" ON workers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan eliminar workers
DROP POLICY IF EXISTS "Admin can delete workers" ON workers;
CREATE POLICY "Admin can delete workers" ON workers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que workers puedan ver sus propios datos
DROP POLICY IF EXISTS "Workers can view own data" ON workers;
CREATE POLICY "Workers can view own data" ON workers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role = 'worker'
            AND email = workers.email
        )
    );

-- ============================================================================
-- VERIFICAR POLÍTICAS CREADAS
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'workers';

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Políticas RLS para workers configuradas correctamente' as status;
