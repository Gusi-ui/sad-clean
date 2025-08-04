# SAD LAS - Sistema de Gestión de Horas y Asignaciones

Sistema de gestión de horas y asignaciones para trabajadores de servicios asistenciales
domiciliarios (SAD).

## 🚀 Características

- ✅ Gestión completa de trabajadores
- ✅ Sistema de autenticación seguro
- ✅ Dashboard personalizado por roles
- ✅ Interfaz responsive y accesible
- ✅ Validaciones automáticas de calidad
- ✅ Protección de rama main configurada

## 🛠️ Tecnologías

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS
- **Base de datos:** Supabase
- **Autenticación:** Supabase Auth
- **Deployment:** Vercel

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Gusi-ui/sad-clean.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatear código
```

## 📋 Flujo de trabajo

1. **Crear rama de feature:** `git checkout -b feature/nombre`
2. **Hacer cambios y commit:** `git commit -m "feat: descripción"`
3. **Push y crear PR:** `git push origin feature/nombre`
4. **Validaciones automáticas:** GitHub ejecuta tests
5. **Review y merge:** Aprobar PR y hacer merge

## 🎯 Objetivo

Mantener un proyecto **100% libre de errores y warnings** desde el inicio, con código limpio,
mantenible y profesional.

## 📄 Licencia

MIT
