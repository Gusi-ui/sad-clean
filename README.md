# 🚀 SAD LAS - Sistema de Gestión de Horas y Asignaciones

## 📋 **DESCRIPCIÓN**

Sistema de gestión de horas y asignaciones para trabajadores de servicios asistenciales
domiciliarios (SAD). Este proyecto está configurado con las mejores prácticas para garantizar código
limpio y mantenible desde el primer commit.

## 🎯 **OBJETIVO**

Crear un proyecto **100% libre de errores y warnings** desde el inicio, con una estructura sólida y
configuraciones estrictas que prevengan la acumulación de problemas técnicos.

## 🏗️ **ESTRUCTURA DEL PROYECTO**

```
sad-las-clean/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Rutas de autenticación
│   │   ├── dashboard/         # Rutas del dashboard
│   │   ├── workers/           # Gestión de trabajadores
│   │   ├── users/             # Gestión de usuarios
│   │   ├── assignments/       # Gestión de asignaciones
│   │   ├── balances/          # Gestión de balances de horas
│   │   ├── planning/          # Planificación
│   │   ├── settings/          # Configuraciones
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base
│   │   ├── auth/             # Componentes de autenticación
│   │   └── layout/           # Componentes de layout
│   ├── contexts/             # Contextos de React
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y configuraciones
│   ├── types/                # Tipos TypeScript
│   └── utils/                # Utilidades adicionales
├── public/                   # Archivos estáticos
├── .env.local               # Variables de entorno
├── tailwind.config.ts       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
├── eslint.config.mjs        # Configuración ESLint
├── prettier.config.js       # Configuración Prettier
└── package.json             # Dependencias y scripts
```

## 🚀 **INICIO RÁPIDO**

### **1. Configurar variables de entorno**

```bash
cp env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### **2. Instalar dependencias**

```bash
npm install
```

### **3. Configurar base de datos**

Ejecutar el script SQL para crear las tablas:

```bash
# Ejecutar en Supabase SQL Editor
supabase-setup.sql
```

### **4. Iniciar desarrollo**

```bash
npm run dev
```

## 🔧 **COMANDOS ÚTILES**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Servidor de producción

# Calidad de código
npm run lint             # Verificar linting
npm run type-check       # Verificar tipos TypeScript
npm run format           # Formatear código
npm run format:check     # Verificar formato
```

## ✅ **VERIFICACIÓN DE CALIDAD**

### **Checklist Pre-Commit**

- [ ] `npm run lint` - 0 errores, 0 warnings
- [ ] `npm run type-check` - 0 errores
- [ ] `npm run format:check` - Código formateado
- [ ] Funcionalidad probada manualmente

## 🎨 **PALETA DE COLORES**

### **Colores Principales**

- **Primary**: Azul profesional (#3b82f6)
- **Secondary**: Verde éxito (#22c55e)
- **Accent**: Naranja atención (#f97316)
- **Neutral**: Grises (#64748b)

### **Estados**

- **Success**: Verde (#22c55e)
- **Warning**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)
- **Info**: Azul claro (#3b82f6)

## 🎯 **PRINCIPIOS DE CÓDIGO**

1. **TypeScript estricto**: No usar `any`, tipos explícitos
2. **Componentes puros**: Un componente por archivo
3. **Imports organizados**: Orden alfabético, separados por tipo
4. **Nombres descriptivos**: Variables y funciones con nombres claros
5. **Sin console.log**: Usar sistema de logging apropiado
6. **Responsive first**: Diseño mobile-first
7. **Accesibilidad**: Componentes accesibles por defecto

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Cannot find module"**

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
```

### **Error: "TypeScript compilation failed"**

```bash
# Verificar tipos
npm run type-check
# Corregir errores de tipos
```

### **Error: "ESLint found problems"**

```bash
# Corregir automáticamente
npm run lint:fix
# Verificar manualmente
npm run lint
```

## 🎯 **OBJETIVO FINAL**

Este proyecto está diseñado para ser:

- ✅ **Limpio**: Sin errores ni warnings
- ✅ **Mantenible**: Código bien estructurado
- ✅ **Escalable**: Arquitectura modular
- ✅ **Profesional**: Mejores prácticas aplicadas
- ✅ **Productivo**: Listo para desarrollo real

**¡Disfruta desarrollando tu aplicación SAD LAS! 🚀**
