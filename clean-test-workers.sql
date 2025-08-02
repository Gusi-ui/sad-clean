-- ============================================================================
-- SAD LAS - LIMPIAR TRABAJADORAS DE PRUEBA
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- Ver trabajadoras que parecen datos de prueba
SELECT
    id,
    name,
    surname,
    email,
    created_at
FROM workers
WHERE
    name ILIKE '%test%'
    OR surname ILIKE '%test%'
    OR email ILIKE '%test%'
    OR name ILIKE '%fake%'
    OR id LIKE 'fake-worker-%'
ORDER BY created_at DESC;

-- ============================================================================
-- ELIMINAR TRABAJADORAS DE PRUEBA (DESCOMENTA PARA EJECUTAR)
-- ============================================================================

-- ADVERTENCIA: Solo ejecuta esto si estás seguro de qué workers eliminar

-- Eliminar workers con datos claramente de prueba
-- DELETE FROM workers
-- WHERE
--     name ILIKE '%test%'
--     OR surname ILIKE '%test%'
--     OR email ILIKE '%test%'
--     OR name ILIKE '%fake%'
--     OR id LIKE 'fake-worker-%';

-- Verificar que se eliminaron correctamente
-- SELECT
--     COUNT(*) as total_workers_remaining
-- FROM workers;

-- ============================================================================
-- NOTA: Prefiere usar la interfaz web para tener control visual
-- ============================================================================
