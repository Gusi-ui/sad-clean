# SAD LAS Mobile App

Aplicación móvil para trabajadores de SAD LAS (Servicios Asistenciales Domiciliarios).

## 📱 Descripción

Esta aplicación móvil permite a los trabajadores de SAD LAS:

- Ver sus asignaciones diarias
- Gestionar su ruta de trabajo
- Consultar balances de horas
- Crear y gestionar notas
- Acceder a su perfil y configuración

## 🏗️ Arquitectura

### **Proyectos Separados**

```
📦 sad-las-clean/                    # Proyecto Web (Next.js) - API + Dashboard
├── src/app/api/                    # 🔗 API REST compartida
├── src/app/                        # Dashboard web
└── package.json

📦 sad-las-mobile/                   # Proyecto Móvil (Expo) - App Trabajadores
├── src/
│   ├── screens/                    # Pantallas de la app
│   ├── components/                 # Componentes reutilizables
│   ├── lib/                        # Cliente API y utilidades
│   ├── contexts/                   # Contextos de React
│   ├── hooks/                      # Custom hooks
│   └── types/                      # Tipos TypeScript
└── package.json
```

### **Conexión entre Proyectos**

La aplicación móvil se conecta con el proyecto web a través de la API REST:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Ejemplo de uso
const assignments = await getAssignments(workerId);
```

## 🚀 Instalación

### **Prerrequisitos**

1. **Proyecto Web funcionando:**

   ```bash
   cd sad-las-clean
   npm run dev
   # Servidor en http://localhost:3000
   ```

2. **Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

### **Configuración del Proyecto Móvil**

1. **Instalar dependencias:**

   ```bash
   cd sad-las-mobile
   npm install
   ```

2. **Configurar variables de entorno:**

   ```bash
   # Crear archivo .env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Iniciar desarrollo:**
   ```bash
   npx expo start
   ```

## 📱 Funcionalidades

### **Autenticación**

- Login con email y contraseña
- Persistencia de sesión
- Logout seguro

### **Asignaciones**

- Ver asignaciones del día
- Ver asignaciones de la semana
- Actualizar estado de asignaciones

### **Ruta de Trabajo**

- Visualizar ruta optimizada
- Navegación integrada
- Información de usuarios

### **Balances**

- Horas trabajadas
- Horas pendientes
- Resumen mensual

### **Notas**

- Crear notas de trabajo
- Ver historial de notas
- Búsqueda y filtros

## 🔧 Desarrollo

### **Estructura de Carpetas**

```
src/
├── screens/           # Pantallas principales
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── ...
├── components/        # Componentes reutilizables
├── lib/              # Utilidades y API
│   └── api.ts        # Cliente API
├── contexts/         # Contextos de React
│   └── AuthContext.tsx
├── hooks/            # Custom hooks
├── types/            # Tipos TypeScript
│   └── index.ts
└── navigation/       # Navegación
    └── AppNavigator.tsx
```

### **Comandos Útiles**

```bash
# Desarrollo
npx expo start          # Iniciar servidor de desarrollo
npx expo start --web    # Versión web
npx expo start --ios    # Simulador iOS
npx expo start --android # Simulador Android

# Build
npx expo build:android  # Build APK
npx expo build:ios      # Build iOS

# Utilidades
npx expo doctor         # Verificar configuración
npx expo install        # Instalar dependencias compatibles
```

## 🔗 API Endpoints

La aplicación móvil consume los siguientes endpoints del proyecto web:

### **Autenticación**

- `POST /api/workers/auth` - Login de trabajador

### **Asignaciones**

- `GET /api/assignments` - Listar asignaciones
- `GET /api/assignments/:id` - Obtener asignación
- `PATCH /api/assignments/:id/status` - Actualizar estado

### **Trabajadores**

- `GET /api/workers` - Listar trabajadores
- `GET /api/workers/:id` - Obtener trabajador
- `GET /api/workers/:id/balances` - Balances del trabajador
- `GET /api/workers/:id/notes` - Notas del trabajador
- `POST /api/workers/:id/notes` - Crear nota

### **Rutas**

- `GET /api/workers/:id/route` - Ruta del trabajador

### **Festivos**

- `GET /api/holidays` - Listar festivos
- `POST /api/holidays/validate` - Validar festivos

## 🎨 Diseño

### **Paleta de Colores**

```css
--primary: #3b82f6; /* Azul principal */
--secondary: #22c55e; /* Verde éxito */
--accent: #f97316; /* Naranja atención */
--neutral: #64748b; /* Grises */
--success: #22c55e; /* Verde */
--warning: #f59e0b; /* Amarillo */
--error: #ef4444; /* Rojo */
--info: #3b82f6; /* Azul claro */
```

### **Principios de Diseño**

- **Mobile-first**: Diseño optimizado para móviles
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Consistencia**: Misma paleta de colores que el proyecto web
- **Simplicidad**: Interfaz limpia y fácil de usar

## 🔒 Seguridad

### **Autenticación**

- Tokens JWT para autenticación
- Persistencia segura con AsyncStorage
- Logout automático en expiración

### **Datos**

- Validación de entrada en cliente y servidor
- Sanitización de datos
- Manejo seguro de errores

## 📊 Estado del Proyecto

### **✅ Completado**

- [x] Estructura del proyecto
- [x] Configuración de TypeScript
- [x] Cliente API
- [x] Contexto de autenticación
- [x] Navegación básica
- [x] Pantalla de login
- [x] Pantalla principal

### **🚧 En Desarrollo**

- [ ] Pantallas de asignaciones
- [ ] Pantalla de ruta
- [ ] Pantalla de balances
- [ ] Pantalla de notas
- [ ] Pantalla de perfil

### **📋 Pendiente**

- [ ] Notificaciones push
- [ ] Sincronización offline
- [ ] Geolocalización
- [ ] Cámara para fotos
- [ ] Tests unitarios
- [ ] Tests de integración

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: Gusi (Gusi-ui)
- **Email**: gusideveloper@gmail.com
- **Proyecto**: SAD LAS - Servicios Asistenciales Domiciliarios
