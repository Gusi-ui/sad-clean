# 🚀 Sistema de Releases Automáticos - APK Móvil

## 📋 **Cómo Funciona**

### **Trigger Automático**

Cada vez que haces `push` a la rama `mobile-app`, se ejecuta automáticamente:

1. **Build del APK** con EAS (Expo Application Services)
2. **Descarga del APK** generado
3. **Creación de Release** en GitHub con el APK disponible para descarga

### **Proceso Completo**

```bash
# 1. Hacer cambios en la aplicación móvil
git checkout mobile-app
cd mobile-app
# ... hacer cambios ...

# 2. Commit y push
git add .
git commit -m "feat(mobile): nueva funcionalidad"
git push origin mobile-app

# 3. GitHub Actions automáticamente:
# ✅ Ejecuta linting y type-check
# ✅ Construye el APK con EAS
# ✅ Descarga el APK generado
# ✅ Crea un nuevo release en GitHub
# ✅ Sube el APK como asset del release
```

## 📦 **Acceder a las Descargas**

### **Ubicación de los Releases**

1. **Ir a**: https://github.com/Gusi-ui/sad-clean/releases
2. **Buscar**: El release más reciente con tag `v[version]-mobile-[timestamp]`
3. **Descargar**: El archivo `sad-las-worker.apk`

### **Formato de los Releases**

- **Tag**: `v1.0.0-mobile-202412281430` (versión + timestamp)
- **Nombre**: `SAD LAS Worker v1.0.0 (Build 202412281430)`
- **Archivo**: `sad-las-worker.apk` (listo para instalar)

## 🔧 **Instalación del APK**

### **En Dispositivo Android**

1. **Descargar** el archivo `sad-las-worker.apk` desde GitHub Releases
2. **Configurar dispositivo**:
   - Ir a **Configuración > Seguridad**
   - Habilitar **"Fuentes desconocidas"** o **"Instalar aplicaciones desconocidas"**
3. **Instalar**:
   - Abrir el archivo APK descargado
   - Seguir las instrucciones de instalación
   - Permitir los permisos necesarios

### **Verificar Instalación**

- La aplicación aparecerá como **"SAD LAS Worker"** en el menú de aplicaciones
- Al abrir, debería mostrar la pantalla de login/inicio

## 📊 **Monitoreo del Proceso**

### **GitHub Actions**

1. **Ver progreso**: https://github.com/Gusi-ui/sad-clean/actions
2. **Buscar workflow**: "Build Mobile APK"
3. **Verificar estado**: ✅ Verde = Éxito, ❌ Rojo = Error

### **Logs del Build**

- **Click** en el workflow ejecutado
- **Expandir** cada paso para ver logs detallados
- **Buscar errores** si el build falla

## ⚠️ **Solución de Problemas**

### **Build Falla**

```bash
# Verificar localmente antes de push
cd mobile-app
npm run lint
npm run type-check
npx expo doctor
```

### **APK No Se Descarga**

- **Verificar** que el build de EAS se completó exitosamente
- **Revisar logs** del workflow para errores de descarga
- **Esperar** unos minutos más si el build está en progreso

### **Release No Se Crea**

- **Verificar** que el push fue a la rama `mobile-app`
- **Revisar** que el workflow se ejecutó completamente
- **Comprobar** permisos de GitHub Actions

## 🎯 **Beneficios del Sistema**

### **Para Desarrolladores**

- ✅ **Builds automáticos** sin intervención manual
- ✅ **Versionado automático** con timestamps
- ✅ **Distribución inmediata** via GitHub Releases
- ✅ **Historial completo** de todas las versiones

### **Para Usuarios/Testers**

- ✅ **Acceso fácil** a la última versión
- ✅ **Descarga directa** desde GitHub
- ✅ **Información detallada** de cada release
- ✅ **Instalación simple** en Android

## 📝 **Información de Releases**

Cada release incluye:

- **📦 APK**: Archivo listo para instalar
- **📋 Información**: Versión, build, commit, fecha
- **🔧 Instrucciones**: Pasos de instalación
- **📝 Cambios**: Descripción de las modificaciones
- **⚠️ Notas**: Advertencias y recomendaciones

## 🚀 **Próximos Pasos**

### **Mejoras Planificadas**

1. **Notificaciones automáticas** cuando hay nuevo release
2. **Testing automático** antes del release
3. **Distribución via Google Play** (AAB)
4. **Releases de diferentes entornos** (dev, staging, prod)

### **Configuración Adicional**

Para habilitar más funcionalidades:

- **Google Play Console**: Para distribución oficial
- **Firebase App Distribution**: Para testing interno
- **Crashlytics**: Para monitoreo de errores

---

## 🎉 **¡Sistema Completamente Automatizado!**

**Solo haz push a `mobile-app` y en unos minutos tendrás:**

- ✅ APK construido automáticamente
- ✅ Release creado en GitHub
- ✅ Descarga disponible para todos
- ✅ Documentación incluida

**¡Desarrollo móvil sin complicaciones! 📱🚀**
