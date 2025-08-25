# 🔄 Workflow de Desarrollo - SAD LAS

## 📋 **Estructura de Ramas**

```
main (rama principal - producción)
├── develop (desarrollo web)
├── mobile-app (aplicación React Native)
└── feature/* (ramas de características)
```

## 🎯 **Objetivo**

Separar completamente el desarrollo de la aplicación web (PWA) de la aplicación móvil (APK) para
permitir:

- ✅ Desarrollo independiente sin interferencias
- ✅ Builds automáticos de APK para distribución
- ✅ Deploy automático de la web
- ✅ Testing independiente
- ✅ Releases controlados

## 🚀 **Workflow por Plataforma**

### **🌐 Aplicación Web (PWA)**

#### **Rama de Desarrollo: `develop`**

```bash
# Cambiar a rama de desarrollo web
git checkout develop

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Hacer cambios y commits
git add .
git commit -m "feat(web): add new dashboard feature"

# Push a develop
git push origin develop
```

#### **Deploy Automático**

- **Trigger**: Push a `develop` o `main`
- **Acción**: Build y deploy automático a Vercel
- **URL**: https://sad-las.vercel.app

#### **Comandos Web**

```bash
# Desarrollo
npm run dev          # Puerto 3001

# Testing
npm run lint         # ESLint
npm run type-check   # TypeScript
npm run format:check # Prettier

# Build
npm run build        # Build de producción
```

### **📱 Aplicación Móvil (APK)**

#### **Rama de Desarrollo: `mobile-app`**

```bash
# Cambiar a rama móvil
git checkout mobile-app

# Instalar dependencias móviles
cd mobile-app
npm install

# Ejecutar en desarrollo
npm start

# Hacer cambios y commits
git add .
git commit -m "feat(mobile): add offline sync feature"

# Push a mobile-app
git push origin mobile-app
```

#### **Build Automático de APK**

- **Trigger**: Push a `mobile-app`
- **Acción**: Build automático de APK
- **Resultado**: Release en GitHub con APK descargable

#### **Comandos Móvil**

```bash
# Desarrollo
npm start           # Expo dev server
npm run android     # Ejecutar en Android
npm run ios         # Ejecutar en iOS

# Build
npm run build:android        # APK local
eas build --platform android # APK en la nube

# Testing
npm run lint         # ESLint
npm run type-check   # TypeScript
npm test            # Jest tests
```

## 🔄 **Flujo de Trabajo Diario**

### **Para Desarrollo Web**

```bash
# 1. Iniciar día
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollo
npm run dev
# ... hacer cambios ...

# 4. Testing
npm run lint
npm run type-check
npm run format:check

# 5. Commit y push
git add .
git commit -m "feat(web): nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 6. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
```

### **Para Desarrollo Móvil**

```bash
# 1. Iniciar día
git checkout mobile-app
git pull origin mobile-app

# 2. Crear rama de feature
git checkout -b feature/mobile-nueva-funcionalidad

# 3. Desarrollo
cd mobile-app
npm start
# ... hacer cambios ...

# 4. Testing
npm run lint
npm run type-check
npm test

# 5. Commit y push
git add .
git commit -m "feat(mobile): nueva funcionalidad móvil"
git push origin feature/mobile-nueva-funcionalidad

# 6. Merge a mobile-app
git checkout mobile-app
git merge feature/mobile-nueva-funcionalidad
git push origin mobile-app
```

## 📦 **Releases y Distribución**

### **Web - Deploy Automático**

```bash
# Deploy a producción (desde main)
git checkout main
git merge develop
git push origin main
# → Deploy automático a Vercel
```

### **Móvil - APK Automático**

```bash
# Release de APK (desde mobile-app)
git checkout mobile-app
git push origin mobile-app
# → Build automático de APK
# → Release en GitHub con descarga
```

## 🧪 **Testing y Calidad**

### **Web**

- ✅ ESLint (0 errores, 0 warnings)
- ✅ TypeScript (0 errores)
- ✅ Prettier (formato correcto)
- ✅ Build exitoso
- ✅ Tests pasando (cuando se implementen)

### **Móvil**

- ✅ ESLint (0 errores, 0 warnings)
- ✅ TypeScript (0 errores)
- ✅ Jest tests pasando
- ✅ Build de APK exitoso
- ✅ Testing en dispositivo físico

## 🔧 **Configuración de Entorno**

### **Variables de Entorno Web**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave
```

### **Variables de Entorno Móvil**

```env
# mobile-app/.env
EXPO_PUBLIC_SUPABASE_URL=tu_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave
```

## 📱 **Distribución de APK**

### **Opciones de Distribución**

1. **Descarga Directa**: APK desde GitHub Releases
2. **Google Play Store**: AAB subido a Google Play
3. **Testing Interno**: APK para testing interno

### **Comandos de Distribución**

```bash
# APK para descarga directa
eas build --platform android --profile production

# AAB para Google Play
eas build --platform android --profile production --non-interactive

# Subir a Google Play
eas submit --platform android
```

## 🚨 **Troubleshooting**

### **Problemas Comunes Web**

```bash
# Error de build
npm run clean
rm -rf .next
npm install
npm run build

# Error de lint
npm run lint:fix
```

### **Problemas Comunes Móvil**

```bash
# Error de build
cd mobile-app
npm run clean
rm -rf node_modules
npm install

# Error de Metro
npx expo start --clear
```

## 📊 **Monitoreo**

### **Web**

- ✅ Deploy automático a Vercel
- ✅ Build status en GitHub Actions
- ✅ Performance monitoring

### **Móvil**

- ✅ Build status en GitHub Actions
- ✅ APK disponible en Releases
- ✅ Crash reporting (cuando se implemente)

## 🎯 **Próximos Pasos**

1. **Configurar EAS Build** para builds en la nube
2. **Implementar testing automatizado** para ambas plataformas
3. **Configurar monitoreo de errores** (Sentry)
4. **Implementar CI/CD completo** con staging environments
5. **Configurar Google Play Console** para distribución oficial

## 📞 **Soporte**

- **Web**: Issues con etiqueta `web`
- **Móvil**: Issues con etiqueta `mobile-app`
- **General**: Issues sin etiqueta específica

---

**¡Disfruta del desarrollo separado y organizado! 🚀**
