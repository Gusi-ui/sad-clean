-- ============================================================================
-- SAD LAS - AGREGAR SOLO USUARIOS DE PRUEBA
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================
-- Este script SOLO agrega usuarios de prueba sin recrear tablas
-- ============================================================================

-- ============================================================================
-- VERIFICAR SI LOS USUARIOS YA EXISTEN
-- ============================================================================

DO $$
BEGIN
    -- Verificar si el usuario admin ya existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sadlas.com') THEN
        -- Insertar usuario administrador de prueba
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
            'admin@sadlas.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE '✅ Usuario admin@sadlas.com creado';
    ELSE
        RAISE NOTICE '⚠️ Usuario admin@sadlas.com ya existe';
    END IF;

    -- Verificar si el usuario worker ya existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maria.garcia@sadlas.com') THEN
        -- Insertar usuario trabajador de prueba
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
            'maria.garcia@sadlas.com',
            crypt('worker123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "worker"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE '✅ Usuario maria.garcia@sadlas.com creado';
    ELSE
        RAISE NOTICE '⚠️ Usuario maria.garcia@sadlas.com ya existe';
    END IF;
END $$;

-- ============================================================================
-- ACTUALIZAR TABLA auth_users CON LOS IDs CORRECTOS
-- ============================================================================

-- Actualizar o insertar usuario admin en auth_users
INSERT INTO auth_users (id, email, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@sadlas.com'
ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    updated_at = NOW();

-- Actualizar o insertar usuario worker en auth_users
INSERT INTO auth_users (id, email, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'worker',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'maria.garcia@sadlas.com'
ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    updated_at = NOW();

-- ============================================================================
-- VERIFICAR USUARIOS CREADOS
-- ============================================================================

SELECT 
    'Usuarios de prueba disponibles:' as info,
    COUNT(*) as total_users
FROM auth.users 
WHERE email IN ('admin@sadlas.com', 'maria.garcia@sadlas.com');

-- ============================================================================
-- MOSTRAR CREDENCIALES
-- ============================================================================

SELECT 
    '🔑 CREDENCIALES DE PRUEBA' as title,
    'admin@sadlas.com' as admin_email,
    'admin123' as admin_password,
    'maria.garcia@sadlas.com' as worker_email,
    'worker123' as worker_password;