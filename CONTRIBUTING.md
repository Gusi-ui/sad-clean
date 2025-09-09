# 🤝 Guía para Contribuidores - SAD gusi

## 📋 Información General

¡Bienvenido/a! Este documento explica cómo contribuir al proyecto **SAD gusi**. Apreciamos tu
interés en mejorar nuestra aplicación de asistencia domiciliaria.

---

## 🚀 Inicio Rápido

### Requisitos del Sistema

#### Software Necesario:

- **Node.js**: v18.0.0 o superior
- **Git**: v2.30.0 o superior
- **npm**: v8.0.0 o superior
- **VS Code**: Recomendado (con extensiones sugeridas)

#### Verificación:

```bash
# Verificar versiones
node --version
npm --version
git --version
```

### Configuración Inicial

#### 1. Fork del Repositorio:

```bash
# Fork en GitHub y clona tu fork
git clone https://github.com/TU-USUARIO/sad-clean.git
cd sad-clean
```

#### 2. Configurar Remotes:

```bash
# Agregar upstream
git remote add upstream https://github.com/Gusi-ui/sad-clean.git

# Verificar remotes
git remote -v
```

#### 3. Instalar Dependencias:

```bash
npm install
```

#### 4. Configurar Variables de Entorno:

```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

#### 5. Verificar Instalación:

```bash
npm run build
npm run dev
```

---

## 🐛 Reporte de Bugs

### Plantilla de Bug Report

#### Título:

```
🐛 [Componente] Descripción breve del problema
```

#### Descripción Detallada:

```markdown
## 🐛 Descripción del Bug

**Resumen**: Descripción clara del problema

## 🔄 Pasos para Reproducir

1. Ir a '...'
2. Hacer clic en '...'
3. Ver error en '...'

## ✅ Comportamiento Esperado

Qué debería suceder

## ❌ Comportamiento Actual

Qué está sucediendo realmente

## 📊 Información del Entorno

- **OS**: [Windows/macOS/Linux]
- **Browser**: [Chrome/Firefox/Safari]
- **Versión**: [v2.0.0]
- **Node.js**: [v18.x.x]

## 📸 Screenshots

Si aplica, agregar capturas de pantalla

## 📋 Contexto Adicional

Cualquier información relevante
```

### Labels para Bugs

#### Prioridad:

- `bug-critical` - Aplicación no funciona
- `bug-high` - Funcionalidad importante afectada
- `bug-medium` - Funcionalidad secundaria
- `bug-low` - Mejora menor

#### Categoría:

- `bug-ui` - Interfaz de usuario
- `bug-api` - Backend/API
- `bug-database` - Base de datos
- `bug-performance` - Rendimiento

---

## ✨ Solicitudes de Features

### Plantilla de Feature Request

#### Título:

```
✨ [Categoría] Descripción breve de la funcionalidad
```

#### Descripción Completa:

```markdown
## 🎯 Resumen

Descripción clara de la funcionalidad propuesta

## 🎨 Detalles de Implementación

- Cómo debería funcionar
- Casos de uso específicos
- Mockups o wireframes (si aplica)

## ✅ Beneficios Esperados

- Beneficios para usuarios
- Mejoras en UX/UI
- Optimizaciones técnicas

## 🔄 Alternativas Consideradas

Otras formas de implementar la funcionalidad

## 📊 Impacto Estimado

- Complejidad de implementación
- Tiempo estimado
- Recursos necesarios

## 📋 Checklist de Aceptación

- [ ] Criterios para considerar la feature completa
- [ ] Tests necesarios
- [ ] Documentación requerida
```

### Tipos de Features

#### Funcionalidades Principales:

- `feature-user-management` - Gestión de usuarios
- `feature-scheduling` - Programación de visitas
- `feature-reporting` - Reportes y analytics
- `feature-mobile` - Funcionalidades móviles

#### Mejoras de UX:

- `enhancement-ui` - Mejoras de interfaz
- `enhancement-accessibility` - Accesibilidad
- `enhancement-performance` - Rendimiento

---

## 🔧 Contribución Técnica

### Proceso de Desarrollo

#### 1. Elegir Issue:

```bash
# Ver issues disponibles
# Buscar etiquetas: good-first-issue, help-wanted
# Asignarte el issue
```

#### 2. Crear Rama:

```bash
# Sincronizar con upstream
git checkout main
git pull upstream main

# Crear rama descriptiva
git checkout -b feature/issue-123-user-profile-improvement
```

#### 3. Desarrollo:

```bash
# Commits frecuentes
git commit -m "feat: Implementar mejora inicial

- Agregar validación básica
- Mejorar estilos
- Actualizar documentación"

# Push regular
git push origin feature/issue-123-user-profile-improvement
```

#### 4. Crear Pull Request:

```bash
# Push final
git push origin feature/issue-123-user-profile-improvement

# Crear PR en GitHub
```

### Estándares de Código

#### TypeScript:

- ✅ **Tipos explícitos** siempre
- ✅ **Interfaces** para objetos complejos
- ✅ **Enums** para valores constantes
- ❌ **Nunca usar `any`**
- ❌ **Nunca usar `// @ts-ignore`**

#### React/Next.js:

- ✅ **Functional components** preferidos
- ✅ **Custom hooks** para lógica reutilizable
- ✅ **Server components** cuando sea posible
- ✅ **App Router** para nuevas páginas

#### Estilos:

- ✅ **Tailwind CSS** para estilos
- ✅ **Responsive design** first
- ✅ **Design system** consistente
- ✅ **Dark mode** support preparado

### Validaciones Automáticas

#### Pre-commit Hooks:

```bash
# Se ejecutan automáticamente
npm run lint        # ESLint - 0 errores, 0 warnings
npm run type-check  # TypeScript - 0 errores
npm run format      # Prettier - formato aplicado
```

#### CI/CD:

- ✅ **Build** exitoso
- ✅ **Tests** pasando (cuando implementados)
- ✅ **Linting** perfecto
- ✅ **Type checking** correcto

---

## 📝 Formato de Commits

### Estructura Obligatoria

```
tipo(alcance): descripción

[cuerpo opcional]

[pie opcional]
```

### Tipos Permitidos

#### Principales:

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `refactor` - Refactorización
- `docs` - Documentación
- `test` - Tests
- `build` - Configuración build
- `ci` - CI/CD
- `chore` - Mantenimiento

#### Ejemplos Correctos:

```bash
feat(auth): Agregar autenticación con Google
fix(ui): Corregir alineación en modal de calendario
refactor(api): Optimizar consultas de base de datos
docs(readme): Actualizar guía de instalación
test(auth): Agregar tests de integración
```

#### Ejemplos Incorrectos:

```bash
update user modal
fix bug
refactor code
add feature
```

### Alcance Específico

#### Componentes:

```bash
feat(components): Agregar componente Button reutilizable
fix(Modal): Corregir problema de z-index
```

#### Funcionalidades:

```bash
feat(auth): Implementar login social
fix(scheduling): Resolver conflicto de horarios
```

---

## 🧪 Testing

### Tipos de Tests

#### Unit Tests:

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

#### Integration Tests:

```typescript
// src/__tests__/auth-flow.test.tsx
describe("Authentication Flow", () => {
  it("allows user to login", async () => {
    // Test completo de login
  });
});
```

#### E2E Tests:

```typescript
// cypress/integration/auth.spec.ts
describe("Authentication", () => {
  it("should login user", () => {
    cy.visit("/login");
    cy.get("[data-cy=email]").type("user@example.com");
    cy.get("[data-cy=password]").type("password");
    cy.get("[data-cy=submit]").click();
    cy.url().should("include", "/dashboard");
  });
});
```

### Cobertura de Tests

#### Requisitos Mínimos:

- **Componentes**: >80% cobertura
- **Utilidades**: >90% cobertura
- **APIs**: Tests de integración completos
- **Flujos críticos**: Tests E2E

---

## 📚 Documentación

### Tipos de Documentación

#### Código:

```typescript
/**
 * Componente Button reutilizable
 *
 * @param children - Contenido del botón
 * @param onClick - Función a ejecutar al hacer clic
 * @param variant - Estilo del botón
 * @param disabled - Si el botón está deshabilitado
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}
```

#### README por Componente:

````markdown
# Button Component

Reusable button component with multiple variants.

## Usage

```tsx
import Button from "@/components/Button";

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>;
```
````

## Props

- `children`: Content to display
- `onClick`: Click handler function
- `variant`: Button style variant
- `disabled`: Whether button is disabled

```

### Actualización de Documentación

#### Cuando Actualizar:
- ✅ **Siempre** después de cambios en API
- ✅ **Siempre** después de nuevas funcionalidades
- ✅ **Siempre** después de cambios en props
- ✅ **Siempre** después de cambios breaking

---

## 🔒 Seguridad

### Buenas Prácticas

#### Autenticación:
- ✅ **Nunca loggear** credenciales
- ✅ **Validar inputs** en cliente y servidor
- ✅ **Usar HTTPS** siempre
- ✅ **Implementar rate limiting**

#### Datos Sensibles:
- ✅ **Nunca commitear** claves API
- ✅ **Usar variables de entorno**
- ✅ **Encriptar datos sensibles**
- ✅ **Implementar CSP headers**

### Reporte de Vulnerabilidades

#### Canal Seguro:
- 📧 **Email**: Para reportes de seguridad
- 🔒 **Issues privados**: Marcar como confidential
- ⚡ **Respuesta rápida**: < 24 horas para vulnerabilidades críticas

---

## 🤝 Código de Conducta

### Principios Generales

#### Respeto:
- ✅ **Trato respetuoso** a todos los contribuidores
- ✅ **Comunicación clara** y constructiva
- ✅ **Feedback útil** y específico
- ✅ **Colaboración** positiva

#### Calidad:
- ✅ **Código limpio** y mantenible
- ✅ **Tests exhaustivos** cuando aplique
- ✅ **Documentación clara**
- ✅ **Revisiones constructivas**

### Resolución de Conflictos

#### Proceso:
1. **Comunicación directa** con el otro contribuidor
2. **Búsqueda de consenso** técnico
3. **Escalación** al maintainer si es necesario
4. **Decisión final** basada en mejores prácticas

---

## 🎯 Niveles de Contribución

### 🟢 Principiante
- Reporte de bugs claros
- Corrección de typos
- Mejoras de documentación
- Tests simples

### 🟡 Intermedio
- Features pequeñas
- Refactorizaciones locales
- Mejoras de performance
- Tests de integración

### 🟠 Avanzado
- Arquitectura de sistema
- Features complejas
- Optimizaciones globales
- Seguridad y auditorías

### 🔴 Experto
- Decisiones de arquitectura
- Mantenimiento del proyecto
- Mentoring de contribuidores
- Roadmap estratégico

---

## 📞 Soporte y Ayuda

### Canales de Comunicación

#### Desarrollo:
- **Issues**: Preguntas técnicas
- **Discussions**: Debates sobre arquitectura
- **Slack/Teams**: Comunicación diaria

#### Comunidad:
- **Discord**: Chat general
- **Forum**: Preguntas detalladas
- **Newsletter**: Actualizaciones del proyecto

### Tipos de Soporte

#### Rápido:
- Issues en GitHub
- Chat en tiempo real
- Stack Overflow (con tag `sad-las`)

#### Detallado:
- Documentación completa
- Guías paso a paso
- Videos tutoriales

---

## 🏆 Reconocimientos

### Contribuidores Destacados
- ⭐ **Top Contributors**: Lista mensual
- 🏅 **Badges**: Por tipos de contribución
- 📊 **Leaderboard**: Métricas de contribución

### Beneficios
- ✅ **Credito público** en README
- ✅ **Acceso temprano** a nuevas features
- ✅ **Invitaciones** a eventos del proyecto
- ✅ **Merchandising** del proyecto

---

## 📋 Checklist Final

### Antes de Contribuir:
- [x] **Leer** esta guía completa
- [x] **Configurar** entorno de desarrollo
- [x] **Revisar** issues existentes
- [x] **Elegir** tarea apropiada a tu nivel

### Antes de PR:
- [x] **Tests** pasando
- [x] **Linting** perfecto
- [x] **Commits** siguiendo formato
- [x] **Documentación** actualizada
- [x] **Descripción clara** del PR

### Después de Contribución:
- [x] **Monitorear** feedback
- [x] **Responder** preguntas
- [x] **Aplicar** mejoras sugeridas
- [x] **Celebrar** contribución exitosa

---

## 🎉 ¡Gracias por Contribuir!

Tu contribución ayuda a mejorar **SAD gusi** para miles de usuarios. Cada mejora, por pequeña que sea, marca una diferencia real en la experiencia de nuestros usuarios.

### 🚀 Próximos Pasos:
1. **Elige un issue** interesante
2. **Configura tu entorno**
3. **¡Empieza a contribuir!**
4. **Únete a nuestra comunidad**

**¡Bienvenido al equipo de contribuidores de SAD gusi!** 🤝✨

---

*Última actualización: $(date)*
*Versión: 1.0.0*
*Equipo: SAD gusi Development Team*
```
