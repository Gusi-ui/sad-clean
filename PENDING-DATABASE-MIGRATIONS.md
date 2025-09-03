# Migraciones de Base de Datos Pendientes

## ✅ COMPLETADO: Migración a weekly_contracted_hours

### Cambio Implementado

Se ha migrado el sistema de horas contratadas de **mensual** a **semanal** para mayor precisión en
los cálculos.

### Script Ejecutado

Se debe ejecutar el script SQL que se encuentra en: `add-weekly-contracted-hours-to-workers.sql`

### Estado Actual

- ✅ **Código actualizado**: El código ahora usa `weekly_contracted_hours`
- ✅ **Tipos TypeScript**: Actualizados para incluir `weekly_contracted_hours`
- ✅ **Formularios**: Modificados para capturar horas semanales
- ✅ **Dashboard**: Actualizado para mostrar horas semanales
- 🔄 **Base de datos**: Ejecutar script `add-weekly-contracted-hours-to-workers.sql`

### Beneficios del Cambio

1. **Mayor precisión**: Los cálculos semanales son más exactos
2. **Mejor UX**: Más intuitivo para las trabajadoras pensar en horas semanales
3. **Flexibilidad**: Permite ajustes más granulares en la planificación

### Verificación

Después de ejecutar el script, puedes verificar que la columna se creó correctamente con:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workers'
AND column_name = 'weekly_contracted_hours';
```
