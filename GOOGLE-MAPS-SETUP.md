# 🗺️ Configuración de Google Maps para Rutas Optimizadas

## 📋 Descripción

Esta funcionalidad permite a las trabajadoras visualizar sus rutas de servicios optimizadas en
Google Maps, incluyendo:

- 📍 **Ubicación actual** de la trabajadora
- 🏠 **Direcciones de los usuarios** a visitar
- 🛣️ **Ruta optimizada** calculada por Google Maps
- ⏱️ **Tiempos estimados** de viaje entre paradas
- 📱 **Diseño mobile-first** para uso en dispositivos móviles

## 🔧 Configuración Requerida

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Geocoding API**
4. Crea credenciales (API Key)
5. Restringe la API Key a tu dominio por seguridad

### 2. Configurar Variables de Entorno

Agrega tu API Key al archivo `.env.local`:

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 3. Actualizar Base de Datos

Asegúrate de que la tabla `users` tenga la columna `address`:

```sql
-- Agregar columna address si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Ejemplo de datos
UPDATE users SET address = 'Calle Mayor 123, Madrid' WHERE id = 'user_id';
```

## 🚀 Funcionalidades Implementadas

### Componente RouteMap

- **Ubicación GPS**: Obtiene la ubicación actual del dispositivo
- **Geocodificación**: Convierte direcciones en coordenadas
- **Rutas optimizadas**: Calcula la ruta más eficiente
- **Marcadores personalizados**: Muestra cada parada numerada
- **Diseño responsive**: Optimizado para móvil y desktop

### Características Técnicas

- ✅ **TypeScript**: Tipado completo y seguro
- ✅ **React Hooks**: useState, useEffect, useCallback
- ✅ **Google Maps API**: Integración nativa
- ✅ **Geolocalización**: API del navegador
- ✅ **Error Handling**: Manejo robusto de errores
- ✅ **Loading States**: Estados de carga apropiados

## 📱 Uso en la Aplicación

### Página de Rutas (`/worker-dashboard/route`)

1. **Lista de servicios**: Muestra todos los servicios del día
2. **Botón "Mostrar Mapa"**: Activa la visualización del mapa
3. **Ruta optimizada**: Calcula automáticamente la mejor ruta
4. **Información detallada**: Muestra tiempos y direcciones

### Flujo de Usuario

1. La trabajadora accede a "Ruta de Hoy"
2. Ve su lista de servicios programados
3. Hace clic en "Mostrar Mapa"
4. El sistema obtiene su ubicación actual
5. Calcula la ruta optimizada entre todas las paradas
6. Muestra el mapa con la ruta y marcadores

## 🔒 Consideraciones de Seguridad

### API Key de Google Maps

- ✅ **Restricción de dominio**: Limita el uso a tu dominio
- ✅ **Restricción de APIs**: Solo las APIs necesarias
- ✅ **Monitoreo de uso**: Revisa el uso en Google Cloud Console
- ✅ **Rotación periódica**: Cambia la API Key regularmente

### Privacidad

- ✅ **Consentimiento**: Solicita permiso para ubicación
- ✅ **Datos locales**: No almacena ubicaciones permanentemente
- ✅ **Cifrado**: Usa HTTPS para todas las comunicaciones

## 🛠️ Desarrollo

### Estructura de Archivos

```
src/
├── components/
│   └── route/
│       └── RouteMap.tsx          # Componente principal del mapa
├── app/
│   └── worker-dashboard/
│       └── route/
│           └── page.tsx          # Página de rutas
└── types/
    └── supabase.ts              # Tipos de datos
```

### Dependencias

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "@types/google.maps": "^3.54.0"
  }
}
```

## 🐛 Solución de Problemas

### Error: "Google Maps API key not found"

1. Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté configurada
2. Reinicia el servidor de desarrollo
3. Limpia la caché del navegador

### Error: "Geolocation not supported"

1. Verifica que el sitio use HTTPS
2. Solicita permisos de ubicación al usuario
3. Proporciona instrucciones manuales

### Error: "Directions API quota exceeded"

1. Revisa el uso en Google Cloud Console
2. Considera aumentar los límites de cuota
3. Implementa caché de rutas frecuentes

## 📈 Próximas Mejoras

- [ ] **Caché de rutas**: Almacenar rutas calculadas
- [ ] **Modo offline**: Funcionalidad sin conexión
- [ ] **Notificaciones**: Alertas de llegada
- [ ] **Historial**: Guardar rutas anteriores
- [ ] **Estadísticas**: Tiempos de viaje promedio
- [ ] **Integración con tráfico**: Tiempo real

## 📞 Soporte

Para problemas técnicos o preguntas sobre la implementación:

1. Revisa los logs del navegador
2. Verifica la configuración de Google Cloud Console
3. Consulta la documentación de Google Maps API
4. Contacta al equipo de desarrollo

---

**¡Disfruta de tus rutas optimizadas! 🗺️✨**
