-- ============================================================================
-- SAD LAS - ACTUALIZACIÓN DEL SISTEMA DE ROLES
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- 1. ACTUALIZAR ESTRUCTURA DE ROLES
-- ============================================================================

-- Eliminar constraint anterior
ALTER TABLE auth_users 
DROP CONSTRAINT IF EXISTS auth_users_role_check;

-- Agregar nuevo constraint con super_admin
ALTER TABLE auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('super_admin', 'admin', 'worker'));

-- ============================================================================
-- 2. CREAR SÚPER ADMINISTRADOR
-- ============================================================================

-- Insertar en auth.users (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'conectomail@gmail.com',
  crypt('Federe_4231', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "super_admin", "name": "alamia"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. INSERTAR EN TABLA auth_users
-- ============================================================================

-- Obtener el ID del usuario creado
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'conectomail@gmail.com';
    
    -- Insertar en auth_users si no existe
    IF user_id IS NOT NULL THEN
        INSERT INTO auth_users (id, email, role, created_at, updated_at)
        VALUES (user_id, 'conectomail@gmail.com', 'super_admin', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            updated_at = NOW();
        
        RAISE NOTICE '✅ Súper administrador creado con ID: %', user_id;
    ELSE
        RAISE NOTICE '❌ Error: No se pudo encontrar el usuario en auth.users';
    END IF;
END $$;

-- ============================================================================
-- 4. CREAR POLÍTICAS RLS PARA SÚPER ADMIN
-- ============================================================================

-- Política para auth_users (súper admin puede ver todos)
DROP POLICY IF EXISTS "Super admin can view all users" ON auth_users;
CREATE POLICY "Super admin can view all users" ON auth_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth_users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Política para auth_users (súper admin puede insertar)
DROP POLICY IF EXISTS "Super admin can insert users" ON auth_users;
CREATE POLICY "Super admin can insert users" ON auth_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Política para auth_users (súper admin puede actualizar)
DROP POLICY IF EXISTS "Super admin can update users" ON auth_users;
CREATE POLICY "Super admin can update users" ON auth_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth_users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 5. VERIFICAR CREACIÓN
-- ============================================================================

SELECT 
    '✅ Sistema de roles actualizado' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'worker' THEN 1 END) as workers
FROM auth_users; 