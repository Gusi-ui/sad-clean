# Debug Guide - Balance de Horas Móvil

## Problema Reportado

El balance de horas en la aplicación móvil no muestra los cambios implementados.

## Verificaciones Implementadas

### 1. Console Logs Agregados

- `🔍 Cargando balance detallado para trabajadora: [workerId]`
- `✅ Balance por usuario calculado: X usuarios`
- `📊 Balance general calculado: [objeto con totales]`

### 2. Funciones Implementadas

- ✅ `computeUserMonthlyBalance` importada y usada
- ✅ `loadDetailedBalances` implementada
- ✅ Cálculo real por usuario con horas teóricas vs asignadas
- ✅ Balance general consolidado

### 3. Estructura de Datos

```typescript
interface DetailedUserBalance {
  userId: string;
  userName: string;
  userSurname: string;
  assignedMonthlyHours: number; // Del perfil del usuario
  theoreticalMonthlyHours: number; // Calculadas según asignaciones
  laborablesMonthlyHours: number; // Horas laborables
  holidaysMonthlyHours: number; // Horas festivos
  difference: number; // theoretical - assigned
}
```

## Pasos para Verificar

### 1. Revisar Console Logs

1. Abrir DevTools en Expo
2. Navegar a Balance de Horas
3. Verificar logs:
   - ¿Aparece "🔍 Cargando balance detallado"?
   - ¿Aparece "✅ Balance por usuario calculado"?
   - ¿Aparece "📊 Balance general calculado"?

### 2. Verificar Datos de Response

Los logs deben mostrar:

```javascript
📊 Balance general calculado: {
  assignedHours: [número],
  laborablesHours: [número],
  holidaysHours: [número],
  totalTheoreticalHours: [número],
  difference: [diferencia real]
}
```

### 3. Verificar UI

- ¿Se muestra el botón "Ver detalle por usuario"?
- ¿Los valores coinciden con los logs?
- ¿El balance final muestra la diferencia correcta?

## Posibles Problemas

1. **Cache de Metro/Expo**: Ejecutar `npm start -- --clear`
2. **Estado no actualizado**: Verificar que `setDetailedBalance` se llame
3. **UI no actualizada**: Verificar que el componente use `detailedBalance`
4. **Datos vacíos**: Verificar que haya usuarios asignados a la trabajadora

## Soluciones de Emergencia

Si el problema persiste:

### Opción 1: Force Refresh Component

```typescript
const [forceUpdate, setForceUpdate] = useState(0);
// En useEffect
setForceUpdate((prev) => prev + 1);
```

### Opción 2: Clear AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear();
```

### Opción 3: Rebuild App

```bash
cd apps/worker-mobile
rm -rf node_modules
npm install
npm start -- --clear
```
