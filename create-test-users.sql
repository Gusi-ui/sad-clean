-- ============================================================================
-- SAD LAS - CREAR USUARIOS DE PRUEBA CON AUTENTICACIÓN
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- USUARIOS DE PRUEBA CON CONTRASEÑAS
-- ============================================================================

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

-- ============================================================================
-- ACTUALIZAR TABLA auth_users CON LOS IDs CORRECTOS
-- ============================================================================

-- Obtener el ID del usuario admin y actualizar auth_users
UPDATE auth_users 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@sadlas.com')
WHERE email = 'admin@sadlas.com';

-- Obtener el ID del usuario worker y actualizar auth_users
UPDATE auth_users 
SET id = (SELECT id FROM auth.users WHERE email = 'maria.garcia@sadlas.com')
WHERE email = 'maria.garcia@sadlas.com';

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Usuarios de prueba creados correctamente' as status;