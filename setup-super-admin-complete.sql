-- ============================================================================
-- SAD LAS - CONFIGURACIÓN COMPLETA SÚPER ADMINISTRADOR
-- ============================================================================
-- Este script hace TODO lo necesario en el orden correcto:
-- 1. Actualiza el constraint de roles
-- 2. Crea el súper administrador
-- 3. Verifica que todo funcione
-- ============================================================================

-- ============================================================================
-- PASO 1: ACTUALIZAR CONSTRAINT DE ROLES
-- ============================================================================

-- Eliminar constraint anterior que solo permite ('admin', 'worker')
ALTER TABLE auth_users
DROP CONSTRAINT IF EXISTS auth_users_role_check;

-- Agregar nuevo constraint que incluye 'super_admin'
ALTER TABLE auth_users
ADD CONSTRAINT auth_users_role_check
CHECK (role IN ('super_admin', 'admin', 'worker'));

-- Confirmar actualización
SELECT '✅ Constraint actualizado para incluir super_admin' as step_1;

-- ============================================================================
-- PASO 2: CREAR SÚPER ADMINISTRADOR EN auth.users
-- ============================================================================

-- Verificar si el usuario ya existe antes de insertarlo
DO $$
DECLARE
    user_exists BOOLEAN;
    new_user_id UUID;
BEGIN
    -- Verificar si el usuario ya existe
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'conectomail@gmail.com'
    ) INTO user_exists;

    -- Solo insertar si no existe
    IF NOT user_exists THEN
        -- Generar nuevo UUID para el usuario
        new_user_id := gen_random_uuid();

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
          new_user_id,
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
        );
        RAISE NOTICE '✅ Usuario súper administrador creado en auth.users con ID: %', new_user_id;
    ELSE
        RAISE NOTICE '⚠️  El usuario conectomail@gmail.com ya existe en auth.users';
    END IF;
END $$;

-- ============================================================================
-- PASO 3: INSERTAR SÚPER ADMINISTRADOR EN auth_users
-- ============================================================================

-- Obtener el ID del usuario e insertarlo en auth_users
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'conectomail@gmail.com';

    -- Insertar en auth_users si existe el usuario
    IF user_id IS NOT NULL THEN
        -- Verificar si ya existe en auth_users
        IF NOT EXISTS (SELECT 1 FROM auth_users WHERE id = user_id) THEN
            INSERT INTO auth_users (id, email, role, created_at, updated_at)
            VALUES (
                user_id,
                'conectomail@gmail.com',
                'super_admin',
                NOW(),
                NOW()
            );
            RAISE NOTICE '✅ Usuario insertado en auth_users';
        ELSE
            -- Si existe, actualizar el rol
            UPDATE auth_users
            SET role = 'super_admin', updated_at = NOW()
            WHERE id = user_id;
            RAISE NOTICE '✅ Usuario actualizado en auth_users';
        END IF;

        RAISE NOTICE '✅ Súper administrador configurado con ID: %', user_id;
    ELSE
        RAISE NOTICE '❌ ERROR: No se pudo encontrar el usuario en auth.users';
    END IF;
END $$;

-- ============================================================================
-- PASO 4: VERIFICAR CONFIGURACIÓN COMPLETA
-- ============================================================================

-- Verificar el usuario creado en ambas tablas
SELECT
    u.email,
    u.raw_user_meta_data->>'name' as name,
    u.raw_user_meta_data->>'role' as meta_role,
    au.role as auth_users_role,
    u.created_at,
    '✅ Usuario encontrado y configurado' as status
FROM auth.users u
LEFT JOIN auth_users au ON u.id = au.id
WHERE u.email = 'conectomail@gmail.com';

-- Verificar que el usuario puede autenticarse
SELECT
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    '✅ Credenciales configuradas' as auth_status
FROM auth.users
WHERE email = 'conectomail@gmail.com';

-- ============================================================================
-- CONFIRMACIÓN FINAL
-- ============================================================================

SELECT '🎉 SÚPER ADMINISTRADOR CREADO CORRECTAMENTE' as final_status;
SELECT 'Email: conectomail@gmail.com' as credentials_1;
SELECT 'Password: Federe_4231' as credentials_2;
SELECT 'Rol: super_admin' as credentials_3;
SELECT 'Ahora puedes hacer login en la aplicación' as next_step;
