-- Migración para corregir los IDs de workers para que coincidan con auth_users
-- Esto resolverá el problema de foreign key constraint en worker_notifications

-- Paso 1: Identificar workers y sus correspondientes usuarios auth
CREATE TEMP TABLE worker_auth_mapping AS
SELECT
    w.id as current_worker_id,
    au.id as correct_auth_id,
    w.name,
    w.surname,
    w.email
FROM workers w
JOIN auth_users au ON LOWER(TRIM(w.email)) = LOWER(TRIM(au.email))
WHERE w.id != au.id;

-- Paso 2: Mostrar el mapping para verificación
SELECT * FROM worker_auth_mapping;

-- Paso 3: Actualizar assignments (si existen)
UPDATE assignments
SET worker_id = wam.correct_auth_id
FROM worker_auth_mapping wam
WHERE assignments.worker_id = wam.current_worker_id;

-- Paso 4: Actualizar worker_notifications (si existen)
UPDATE worker_notifications
SET worker_id = wam.correct_auth_id
FROM worker_auth_mapping wam
WHERE worker_notifications.worker_id = wam.current_worker_id;

-- Paso 5: Actualizar worker_devices (si existen)
UPDATE worker_devices
SET worker_id = wam.correct_auth_id
FROM worker_auth_mapping wam
WHERE worker_devices.worker_id = wam.current_worker_id;

-- Paso 6: Actualizar worker_notification_settings (si existen)
UPDATE worker_notification_settings
SET worker_id = wam.correct_auth_id
FROM worker_auth_mapping wam
WHERE worker_notification_settings.worker_id = wam.current_worker_id;

-- Paso 7: Finalmente, actualizar los workers para usar los IDs correctos
UPDATE workers
SET id = wam.correct_auth_id
FROM worker_auth_mapping wam
WHERE workers.id = wam.current_worker_id;

-- Paso 8: Verificación final
SELECT
    'Workers actualizados' as resultado,
    COUNT(*) as cantidad
FROM worker_auth_mapping;

-- Paso 9: Verificar que ahora los workers coincidan con auth_users
SELECT
    w.id,
    w.name,
    w.surname,
    w.email,
    CASE WHEN au.id IS NOT NULL THEN '✅ Coincide' ELSE '❌ No coincide' END as estado
FROM workers w
LEFT JOIN auth_users au ON w.id = au.id;

-- Limpiar tabla temporal
DROP TABLE worker_auth_mapping;
