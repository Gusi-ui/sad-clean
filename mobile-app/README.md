# 📱 SAD LAS Worker - Aplicación Móvil

Aplicación móvil React Native para trabajadoras de servicios asistenciales domiciliarios (SAD).

## 🚀 Características

- ✅ Autenticación con Supabase
- ✅ Sincronización offline
- ✅ Notificaciones push
- ✅ Gestión de rutas y horarios
- ✅ Cálculo de balances
- ✅ Modo offline completo

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI
- Android Studio (para desarrollo local)
- Cuenta de Expo

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Instalar Expo CLI globalmente
npm install -g @expo/cli
```

## 🏃‍♀️ Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## 📱 Build para APK

### Build Local (Recomendado para desarrollo)

```bash
# Build de desarrollo
npm run build:android

# Build de producción
eas build --platform android --profile production
```

### Build en la Nube (Recomendado para releases)

```bash
# Configurar EAS
eas login

# Build de preview
eas build --platform android --profile preview

# Build de producción
eas build --platform android --profile production
```

## 🏗️ Perfiles de Build

- **development**: Para desarrollo y testing
- **preview**: Para testing interno
- **production**: Para distribución final

## 📦 Distribución

### APK para Descarga Directa

```bash
# Generar APK para distribución
eas build --platform android --profile production --local

# El APK se generará en: android/app/build/outputs/apk/release/
```

### Google Play Store

```bash
# Generar AAB para Google Play
eas build --platform android --profile production --non-interactive

# Subir a Google Play
eas submit --platform android
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Configuración de Notificaciones

```bash
# Configurar push notifications
expo push:android:upload --api-key tu_api_key_de_firebase
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
mobile-app/
├── src/
│   ├── contexts/          # Contextos de React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y configuraciones
│   ├── screens/          # Pantallas de la aplicación
│   └── services/         # Servicios externos
├── assets/               # Imágenes y recursos
├── app.json             # Configuración de Expo
├── eas.json             # Configuración de EAS Build
└── package.json         # Dependencias
```

## 🔄 Workflow de Desarrollo

1. **Desarrollo**: Trabajar en la rama `mobile-app`
2. **Testing**: Probar en dispositivo físico
3. **Build**: Generar APK de preview
4. **Testing**: Probar APK en diferentes dispositivos
5. **Release**: Generar APK de producción
6. **Distribución**: Compartir APK o subir a Google Play

## 🚨 Troubleshooting

### Error de Build

```bash
# Limpiar cache
npm run clean

# Reinstalar dependencias
rm -rf node_modules && npm install
```

### Error de Metro

```bash
# Limpiar cache de Metro
npx expo start --clear
```

### Error de Permisos

```bash
# Verificar permisos en app.json
# Asegurar que los permisos necesarios estén incluidos
```

## 📞 Soporte

Para problemas específicos de la aplicación móvil, crear un issue en el repositorio con la etiqueta
`mobile-app`.

## 📄 Licencia

Este proyecto es parte de SAD LAS y está bajo la misma licencia.
