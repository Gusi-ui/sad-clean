# 📱 Configuración de la Aplicación Móvil - SAD LAS

## 🔧 **Configuración Inicial**

### **1. Variables de Entorno**

Crear archivo `.env` en la carpeta `mobile-app/`:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### **2. Configuración de GitHub Secrets**

Para que los builds automáticos funcionen, configurar en GitHub:

1. Ir a **Settings** > **Secrets and variables** > **Actions**
2. Agregar los siguientes secrets:

#### **EXPO_TOKEN** (Opcional para builds en la nube)

```bash
# Obtener token de Expo
npx expo login
npx expo whoami
# Copiar el token mostrado
```

#### **SUPABASE_URL** y **SUPABASE_ANON_KEY**

```bash
# Obtener desde tu proyecto de Supabase
# Dashboard > Settings > API
```

## 🚀 **Desarrollo Local**

### **Instalación**

```bash
# Cambiar a rama móvil
git checkout mobile-app

# Instalar dependencias
cd mobile-app
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### **Ejecutar en Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## 📱 **Build de APK**

### **Build Local**

```bash
# Build de desarrollo
npm run build:android

# Build de producción
npm run build:android-bundle
```

### **Build en la Nube (Recomendado)**

```bash
# Configurar EAS
npx eas login

# Build automático
npx eas build --platform android --profile production
```

## 🔄 **Workflow de Desarrollo**

### **Estructura de Ramas**

```
main (producción)
├── develop (desarrollo web)
└── mobile-app (desarrollo móvil)
```

### **Commits**

```bash
# Formato de commits para móvil
git commit -m "feat(mobile): agregar nueva funcionalidad"
git commit -m "fix(mobile): corregir error en pantalla"
git commit -m "style(mobile): mejorar diseño de interfaz"
```

### **Push y Build Automático**

```bash
# Hacer push a rama móvil
git push origin mobile-app

# El build se ejecuta automáticamente
# APK disponible en GitHub Releases
```

## 🛠️ **Solución de Problemas**

### **Error de TypeScript**

```bash
# Verificar tipos
npm run type-check

# Corregir errores automáticamente
npm run lint:fix
```

### **Error de Dependencias**

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### **Error de Build**

```bash
# Limpiar build
npm run clean

# Rebuild
npm run build:android
```

### **Error de Metro**

```bash
# Limpiar cache de Metro
npx expo start --clear
```

## 📋 **Checklist de Configuración**

- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] TypeScript sin errores
- [ ] Linting sin errores
- [ ] Build local funcionando
- [ ] GitHub secrets configurados
- [ ] Workflow de CI/CD funcionando

## 📞 **Soporte**

Para problemas específicos de la aplicación móvil:

1. Crear issue en GitHub con etiqueta `mobile-app`
2. Incluir logs de error
3. Especificar versión de Expo y React Native

## 📄 **Licencia**

Este proyecto es parte de SAD LAS y está bajo la misma licencia.
