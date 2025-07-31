-- ============================================================================
-- SAD LAS - CONSULTAR DATOS DE WORKERS
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- CONSULTAR TODOS LOS WORKERS
-- ============================================================================

SELECT
    '📊 DATOS ACTUALES DE WORKERS' as info,
    COUNT(*) as total_workers
FROM workers;

-- ============================================================================
-- MOSTRAR TODOS LOS WORKERS CON DETALLES
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
    created_at,
    updated_at
FROM workers
ORDER BY created_at DESC;

-- ============================================================================
-- ESTADÍSTICAS DE WORKERS
-- ============================================================================

SELECT
    '📈 ESTADÍSTICAS DE WORKERS' as info,
    COUNT(*) as total_workers,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_workers,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_workers,
    COUNT(CASE WHEN worker_type = 'cuidadora' THEN 1 END) as cuidadoras,
    COUNT(CASE WHEN worker_type = 'auxiliar' THEN 1 END) as auxiliares,
    COUNT(CASE WHEN worker_type = 'enfermera' THEN 1 END) as enfermeras
FROM workers;

-- ============================================================================
-- WORKERS POR TIPO
-- ============================================================================

SELECT
    worker_type,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN is_active = true THEN 1 END) as activos,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactivos
FROM workers
GROUP BY worker_type
ORDER BY cantidad DESC;

-- ============================================================================
-- WORKERS ACTIVOS ÚLTIMOS 30 DÍAS
-- ============================================================================

SELECT
    '🆕 WORKERS ACTIVOS ÚLTIMOS 30 DÍAS' as info,
    COUNT(*) as nuevos_workers
FROM workers
WHERE created_at >= NOW() - INTERVAL '30 days'
AND is_active = true;

-- ============================================================================
-- VERIFICAR SI HAY DATOS DE PRUEBA
-- ============================================================================

SELECT
    '🧪 DATOS DE PRUEBA' as info,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Hay datos en la tabla workers'
        ELSE '❌ No hay datos en la tabla workers'
    END as status,
    COUNT(*) as total_records
FROM workers;
