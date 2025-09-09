# 📏 Reglas del Proyecto SAD LAS

## 🎯 **OBJETIVO PRINCIPAL**

Mantener un proyecto **100% libre de errores y warnings** desde el inicio, con código limpio,
mantenible y profesional.

---

## 📁 **1. ESTRUCTURA Y ORGANIZACIÓN**

### **Estructura de Carpetas**

```
src/
├── app/                    # Next.js App Router
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── forms/            # Formularios
│   ├── dashboard/        # Componentes del dashboard
│   └── common/           # Componentes comunes
├── lib/                  # Utilidades y configuraciones
├── hooks/                # Custom hooks
├── types/                # Tipos TypeScript
└── styles/               # Estilos adicionales
```

### **Reglas de Organización**

- ✅ **Un componente por archivo**
- ✅ **Componentes puros y reutilizables**
- ✅ **Separación clara de responsabilidades**
- ❌ **No mezclar lógica de negocio en componentes UI**

---

## 🔧 **2. ESTILO Y CALIDAD DE CÓDIGO**

### **TypeScript**

- ✅ **TypeScript estricto obligatorio**
- ✅ **Tipos explícitos para todo**
- ❌ **No usar `any` bajo ninguna circunstancia**
- ✅ **Interfaces y tipos bien definidos**

### **Nomenclatura**

- ✅ **Nombres descriptivos y claros**
- ✅ **Variables: camelCase**
- ✅ **Componentes: PascalCase**
- ✅ **Constantes: UPPER_SNAKE_CASE**
- ✅ **Archivos: kebab-case**

### **Imports**

```typescript
// Orden correcto de imports
// 1. Librerías externas
import React from "react";
import { useEffect, useState } from "react";

// 2. Módulos internos
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
// 3. Tipos
import type { User } from "@/types";

// 4. Estilos
import "./styles.css";
```

### **Logging**

- ❌ **No usar `console.log` en producción**
- ✅ **Usar sistema de logging apropiado**
- ✅ **Logs informativos para debugging**

---

## 🎨 **3. DISEÑO Y UX**

### **Paleta de Colores**

```css
/* Colores Principales */
--primary: #3b82f6; /* Azul profesional */
--secondary: #22c55e; /* Verde éxito */
--accent: #f97316; /* Naranja atención */
--neutral: #64748b; /* Grises */

/* Estados */
--success: #22c55e; /* Verde */
--warning: #f59e0b; /* Amarillo */
--error: #ef4444; /* Rojo */
--info: #3b82f6; /* Azul claro */
```

### **Responsividad**

- ✅ **Mobile-first design**
- ✅ **Breakpoints consistentes**
- ✅ **Componentes responsive por defecto**

### **Accesibilidad**

- ✅ **Roles ARIA apropiados**
- ✅ **Labels para formularios**
- ✅ **Contraste de colores adecuado**
- ✅ **Navegación por teclado**

---

## 📝 **4. COMMITS Y CONTROL DE VERSIONES**

### **Formato de Commits**

```bash
# Formato: tipo(alcance): descripción
git commit -m "feat(auth): add login functionality"
git commit -m "fix(workers): resolve form validation issue"
git commit -m "docs(readme): update installation instructions"
```

### **Tipos de Commit Permitidos**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `perf`: Mejoras de rendimiento
- `test`: Tests
- `build`: Cambios en build
- `ci`: Cambios en CI/CD
- `chore`: Tareas de mantenimiento

---

## ✅ **5. CHECKLIST PRE-COMMIT**

### **Validaciones Obligatorias**

- [ ] `npm run lint` - 0 errores, 0 warnings
- [ ] `npm run type-check` - 0 errores
- [ ] `npm run format:check` - Código formateado
- [ ] Tests pasan (cuando se implementen)
- [ ] Funcionalidad probada manualmente

### **Revisión de Código**

- [ ] Props tipadas
- [ ] Sin console.log
- [ ] Sin imports no utilizados
- [ ] Sin variables no utilizadas
- [ ] Dependencias de hooks correctas
- [ ] Componentes accesibles
- [ ] Diseño responsive

---

## 🚨 **6. MANEJO DE ERRORES**

### **Principios**

- ✅ **Manejo de errores claro y amigable**
- ❌ **No exponer información sensible**
- ✅ **Mensajes de error descriptivos**
- ✅ **Fallbacks apropiados**

### **Estructura de Error Handling**

```typescript
try {
  // Operación que puede fallar
} catch (error) {
  // Log del error para debugging
  console.error("Error en operación:", error);

  // Mostrar mensaje amigable al usuario
  setError("Ha ocurrido un error. Inténtalo de nuevo.");
}
```

---

## 🔍 **7. SOLUCIÓN DE PROBLEMAS**

### **Errores Comunes**

#### **"Cannot find module"**

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
```

#### **"TypeScript compilation failed"**

```bash
# Verificar tipos
npm run type-check
# Corregir errores de tipos
```

#### **"ESLint found problems"**

```bash
# Corregir automáticamente
npm run lint:fix
# Verificar manualmente
npm run lint
```

#### **"Prettier found problems"**

```bash
# Formatear código
npm run format
# Verificar formato
npm run format:check
```

---

## 📚 **8. COMANDOS ÚTILES**

### **Desarrollo**

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Servidor de producción
```

### **Calidad de Código**

```bash
npm run lint             # Verificar linting
npm run lint:fix         # Corregir errores de linting
npm run type-check       # Verificar tipos TypeScript
npm run format           # Formatear código
npm run format:check     # Verificar formato
```

### **Base de Datos**

```bash
npm run db:generate      # Generar tipos de Supabase
npm run db:migrate       # Ejecutar migraciones
npm run db:reset         # Resetear base de datos
```

---

## 🎯 **9. PRINCIPIOS FUNDAMENTALES**

### **Código Limpio**

- ✅ **Legibilidad sobre brevedad**
- ✅ **Funciones pequeñas y enfocadas**
- ✅ **Nombres descriptivos**
- ✅ **Comentarios cuando sea necesario**

### **Mantenibilidad**

- ✅ **Código modular**
- ✅ **Separación de responsabilidades**
- ✅ **Reutilización de componentes**
- ✅ **Documentación clara**

### **Escalabilidad**

- ✅ **Arquitectura flexible**
- ✅ **Componentes reutilizables**
- ✅ **Configuración centralizada**
- ✅ **Patrones consistentes**

---

## 🚀 **10. OBJETIVO FINAL**

Este proyecto debe ser:

- ✅ **Limpio**: Sin errores ni warnings
- ✅ **Mantenible**: Código bien estructurado
- ✅ **Escalable**: Arquitectura modular
- ✅ **Profesional**: Mejores prácticas aplicadas
- ✅ **Productivo**: Listo para desarrollo real

---

## 📞 **SOPORTE**

Si encuentras problemas:

1. **Verificar configuración**: Revisar archivos de configuración
2. **Limpiar cache**: `rm -rf .next node_modules && npm install`
3. **Verificar versiones**: Node.js 18+, npm actualizado
4. **Revisar logs**: Verificar errores en consola

---

**¡Disfruta desarrollando tu aplicación SAD LAS! 🚀**
