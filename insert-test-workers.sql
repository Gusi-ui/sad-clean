-- ============================================================================
-- SAD LAS - INSERTAR WORKERS DE PRUEBA
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- VERIFICAR SI LA TABLA ESTÁ VACÍA
-- ============================================================================

DO $$
BEGIN
    -- Verificar si hay datos en la tabla workers
    IF NOT EXISTS (SELECT 1 FROM workers LIMIT 1) THEN
        RAISE NOTICE '📝 Insertando workers de prueba...';

        -- ============================================================================
        -- INSERTAR WORKERS DE PRUEBA
        -- ============================================================================

        -- Worker 1: María García (Cuidadora)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'María', 'García', 'maria.garcia@sadlas.com', '612345678',
            '12345678A', 'cuidadora', true
        );

        -- Worker 2: Ana López (Auxiliar)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Ana', 'López', 'ana.lopez@sadlas.com', '623456789',
            '23456789B', 'auxiliar', true
        );

        -- Worker 3: Carmen Rodríguez (Enfermera)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Carmen', 'Rodríguez', 'carmen.rodriguez@sadlas.com', '634567890',
            '34567890C', 'enfermera', true
        );

        -- Worker 4: Isabel Martínez (Cuidadora)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Isabel', 'Martínez', 'isabel.martinez@sadlas.com', '645678901',
            '45678901D', 'cuidadora', true
        );

        -- Worker 5: Rosa Fernández (Auxiliar)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Rosa', 'Fernández', 'rosa.fernandez@sadlas.com', '656789012',
            '56789012E', 'auxiliar', true
        );

        -- Worker 6: Teresa Jiménez (Cuidadora)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Teresa', 'Jiménez', 'teresa.jimenez@sadlas.com', '667890123',
            '67890123F', 'cuidadora', true
        );

        -- Worker 7: Elena Moreno (Enfermera)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Elena', 'Moreno', 'elena.moreno@sadlas.com', '678901234',
            '78901234G', 'enfermera', true
        );

        -- Worker 8: Laura González (Auxiliar)
        INSERT INTO workers (
            name, surname, email, phone, dni, worker_type, is_active
        ) VALUES (
            'Laura', 'González', 'laura.gonzalez@sadlas.com', '689012345',
            '89012345H', 'auxiliar', true
        );

        RAISE NOTICE '✅ Workers de prueba insertados correctamente';
    ELSE
        RAISE NOTICE '⚠️ La tabla workers ya tiene datos. No se insertan workers de prueba.';
    END IF;
END $$;

-- ============================================================================
-- MOSTRAR WORKERS INSERTADOS
-- ============================================================================

SELECT
    '📊 WORKERS DISPONIBLES' as info,
    COUNT(*) as total_workers
FROM workers;

-- ============================================================================
-- MOSTRAR DETALLES DE LOS WORKERS
-- ============================================================================

SELECT
    id,
    name,
    surname,
    email,
    phone,
    dni,
    worker_type,
    is_active,
    created_at
FROM workers
ORDER BY created_at DESC;

-- ============================================================================
-- ESTADÍSTICAS FINALES
-- ============================================================================

SELECT
    '📈 ESTADÍSTICAS FINALES' as info,
    COUNT(*) as total_workers,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_workers,
    COUNT(CASE WHEN worker_type = 'cuidadora' THEN 1 END) as cuidadoras,
    COUNT(CASE WHEN worker_type = 'auxiliar' THEN 1 END) as auxiliares,
    COUNT(CASE WHEN worker_type = 'enfermera' THEN 1 END) as enfermeras
FROM workers;
