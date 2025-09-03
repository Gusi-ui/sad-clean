-- ============================================================================
-- SAD LAS - FIX RLS SECURITY ISSUES
-- ============================================================================
-- Script para solucionar las advertencias de seguridad de Supabase
-- Habilitar RLS en las tablas users y hours_balances
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS EN TABLA USERS
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREAR POLÍTICAS RLS PARA USERS
-- ============================================================================

-- Política para que super_admin y admin puedan ver todos los usuarios
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan insertar usuarios
DROP POLICY IF EXISTS "Admin can insert users" ON public.users;
CREATE POLICY "Admin can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan actualizar usuarios
DROP POLICY IF EXISTS "Admin can update users" ON public.users;
CREATE POLICY "Admin can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan eliminar usuarios
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
CREATE POLICY "Admin can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que workers puedan ver usuarios asignados a ellos
DROP POLICY IF EXISTS "Workers can view assigned users" ON public.users;
CREATE POLICY "Workers can view assigned users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments a
            JOIN workers w ON a.worker_id = w.id
            JOIN auth_users au ON w.email = au.email
            WHERE a.user_id = users.id
            AND au.id = auth.uid()
            AND au.role = 'worker'
        )
    );

-- ============================================================================
-- 3. HABILITAR RLS EN TABLA HOURS_BALANCES
-- ============================================================================

ALTER TABLE public.hours_balances ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREAR POLÍTICAS RLS PARA HOURS_BALANCES
-- ============================================================================

-- Política para que super_admin y admin puedan ver todos los balances
DROP POLICY IF EXISTS "Admin can view all hours balances" ON public.hours_balances;
CREATE POLICY "Admin can view all hours balances" ON public.hours_balances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan insertar balances
DROP POLICY IF EXISTS "Admin can insert hours balances" ON public.hours_balances;
CREATE POLICY "Admin can insert hours balances" ON public.hours_balances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan actualizar balances
DROP POLICY IF EXISTS "Admin can update hours balances" ON public.hours_balances;
CREATE POLICY "Admin can update hours balances" ON public.hours_balances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que super_admin y admin puedan eliminar balances
DROP POLICY IF EXISTS "Admin can delete hours balances" ON public.hours_balances;
CREATE POLICY "Admin can delete hours balances" ON public.hours_balances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth_users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Política para que workers puedan ver sus propios balances
DROP POLICY IF EXISTS "Workers can view own hours balances" ON public.hours_balances;
CREATE POLICY "Workers can view own hours balances" ON public.hours_balances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workers w
            JOIN auth_users au ON w.email = au.email
            WHERE hours_balances.worker_id = w.id
            AND au.id = auth.uid()
            AND au.role = 'worker'
        )
    );

-- ============================================================================
-- 5. VERIFICAR POLÍTICAS CREADAS
-- ============================================================================

-- Verificar políticas para users
SELECT
    'users' as table_name,
    schemaname,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Verificar políticas para hours_balances
SELECT
    'hours_balances' as table_name,
    schemaname,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'hours_balances'
ORDER BY policyname;

-- ============================================================================
-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================================================

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'hours_balances')
ORDER BY tablename;

-- ============================================================================
-- 7. MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ RLS habilitado en tabla users' as status;
SELECT '✅ RLS habilitado en tabla hours_balances' as status;
SELECT '✅ Políticas de seguridad configuradas correctamente' as status;
SELECT '✅ Advertencias de seguridad de Supabase solucionadas' as status;
