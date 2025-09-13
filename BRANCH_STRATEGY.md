# 🌿 Estrategia de Ramas - SAD gusi

## 📋 Información General

Esta estrategia define cómo manejamos las **ramas de desarrollo** en el proyecto SAD gusi para
mantener un flujo de trabajo profesional, organizado y seguro.

---

## 🏗️ Estructura de Ramas

### Ramas Principales

```
main (producción)
├── feature/nueva-funcionalidad
├── hotfix/correccion-critica
├── refactor/optimizacion-codigo
├── docs/mejora-documentacion
└── test/mejora-testing
```

### Ramas Especiales

#### Ramas Históricas (Preservadas):

- `origin/feature/ui-contrast-improvements` - **PUNTO HISTÓRICO ACTUAL**
- `origin/feature/merge-web-development-branches` - Desarrollo web anterior
- `origin/feature/complete-notification-system` - Sistema de notificaciones

#### Ramas Temporales:

- `emergency-recovery` - Recuperación de emergencia
- `backup-*` - Backups puntuales

---

## 📝 Nomenclatura de Ramas

### Prefijos Permitidos

#### Principales:

- `feature/` - Nuevas funcionalidades
- `hotfix/` - Correcciones críticas
- `refactor/` - Optimizaciones de código
- `docs/` - Mejoras en documentación
- `test/` - Mejoras en testing

#### Especiales:

- `emergency/` - Recuperaciones de emergencia
- `backup/` - Copias de seguridad puntuales

### Convenciones de Nombres

#### ✅ Correcto:

```bash
feature/user-authentication-improvements
hotfix/login-validation-bug
refactor/database-query-optimization
docs/api-documentation-update
test/integration-tests-expansion
emergency/recovery-from-v2.0.0
```

#### ❌ Incorrecto:

```bash
new-feature
fix-bug
update-docs
feature1
hotfix-urgent
```

### Longitud y Claridad

#### Reglas:

- **Máximo 50 caracteres** recomendado
- **Palabras completas**, no abreviaturas
- **Separación por guiones** (-)
- **Descripción clara** del propósito

#### Ejemplos:

```bash
# ✅ Bueno
feature/user-profile-customization
hotfix/payment-processing-error
refactor/user-data-validation

# ❌ Malo
feature/user-profile
hotfix/payment-bug
refactor/validation
```

---

## 🔄 Ciclo de Vida de Ramas

### 1. Creación de Rama

#### Proceso Estándar:

```bash
# Asegurar que main esté actualizado
git checkout main
git pull origin main

# Crear rama descriptiva
git checkout -b feature/nueva-funcionalidad

# Verificar creación
git branch
```

#### Verificación Pre-creación:

- [x] Main actualizado (`git pull origin main`)
- [x] No hay cambios sin commit (`git status`)
- [x] Nombre descriptivo y siguiendo convención
- [x] No existe rama con mismo nombre

### 2. Desarrollo Activo

#### Commits Frecuentes:

```bash
# Commits diarios mínimo
git add archivo-modificado
git commit -m "feat: Implementar validación básica

- Agregar validación de email
- Mejorar mensajes de error
- Actualizar tests"

# Push regular
git push origin feature/nueva-funcionalidad
```

#### Frecuencia Recomendada:

- **Commits diarios** durante desarrollo activo
- **Commits por funcionalidad** completada
- **Commits descriptivos** siguiendo formato establecido

### 3. Sincronización con Main

#### Proceso de Merge:

```bash
# Actualizar main
git checkout main
git pull origin main

# Volver a rama de desarrollo
git checkout feature/nueva-funcionalidad

# Merge de main (estrategia preferida)
git merge main

# Resolver conflictos si existen
# Hacer commit de resolución
git commit -m "fix: Resolver conflictos de fusión"
```

#### Alternativa Rebase:

```bash
# Para historial limpio
git checkout feature/nueva-funcionalidad
git rebase main

# Resolver conflictos si existen
git add archivos-resueltos
git rebase --continue
```

### 4. Preparación para PR

#### Checklist Pre-PR:

- [x] **Funcionalidad completa** implementada
- [x] **Tests pasando** (si aplican)
- [x] **Validaciones locales** superadas
- [x] **Documentación actualizada**
- [x] **Commits limpios** y descriptivos
- [x] **Merge conflicts** resueltos

#### Push Final:

```bash
# Push de todos los cambios
git push origin feature/nueva-funcionalidad

# Si hay rebase, forzar push
git push origin feature/nueva-funcionalidad --force-with-lease
```

### 5. Fusión Exitosa

#### Después de Aprobar PR:

```bash
# Eliminar rama local
git branch -d feature/nueva-funcionalidad

# Eliminar rama remota (opcional, mantener historial)
git push origin --delete feature/nueva-funcionalidad
```

---

## 🌿 Tipos de Ramas Detalladas

### Feature Branches

#### Propósito:

Desarrollar nuevas funcionalidades sin afectar main.

#### Características:

- **Vida útil**: 1-4 semanas
- **Alcance**: Una funcionalidad específica
- **Frecuencia de merge**: Regular con main
- **Requisitos**: Tests y documentación

#### Ejemplo de Flujo:

```bash
# Creación
git checkout -b feature/user-profile-customization

# Desarrollo con commits frecuentes
git commit -m "feat: Agregar campos personalizables al perfil"
git commit -m "feat: Implementar validación de datos"
git commit -m "feat: Agregar preview de cambios"

# Push y PR
git push origin feature/user-profile-customization
# Crear PR en GitHub
```

### Hotfix Branches

#### Propósito:

Corregir bugs críticos en producción.

#### Características:

- **Prioridad**: Alta
- **Alcance**: Bug específico
- **Tiempo**: 1-2 días máximo
- **Revisión**: Rápida, sin burocracia

#### Flujo de Hotfix:

```bash
# Creación urgente
git checkout main
git pull origin main
git checkout -b hotfix/critical-login-bug

# Fix rápido
git add fix-aplicado
git commit -m "fix(auth): Resolver bug crítico de login

🐛 Problema: Usuarios no pueden iniciar sesión
✅ Solución: Corregir validación de token
🧪 Verificación: Testeado en staging"

# Push inmediato
git push origin hotfix/critical-login-bug

# PR con alta prioridad
# Fusión urgente
```

### Refactor Branches

#### Propósito:

Mejorar código sin cambiar funcionalidad.

#### Características:

- **Riesgo**: Bajo (no cambia comportamiento)
- **Alcance**: Módulo o componente específico
- **Testing**: Verificar que no rompe funcionalidad
- **Aprobación**: Revisión normal

#### Ejemplo:

```bash
git checkout -b refactor/user-validation-optimization

# Commits de refactorización
git commit -m "refactor(auth): Optimizar validación de usuarios
- Mejorar performance de queries
- Simplificar lógica de validación
- Eliminar código duplicado"
```

### Documentation Branches

#### Propósito:

Actualizar documentación del proyecto.

#### Características:

- **Frecuencia**: Continua
- **Alcance**: Archivos de documentación
- **Revisión**: Ligera
- **Merge**: Directo a main

#### Ejemplo:

```bash
git checkout -b docs/api-endpoints-update

git commit -m "docs(api): Actualizar documentación de endpoints
- Agregar nuevos endpoints de notificaciones
- Corregir ejemplos de código
- Actualizar parámetros de respuesta"
```

---

## 🛡️ Estrategias de Backup y Recuperación

### Puntos de Restauración

#### Tags Principales:

- `v2.0.0-ui-improvements` - **PUNTO SEGURO ACTUAL** ⭐
- `v1.0.0` - Versión inicial estable
- `v0.1.0` - Infraestructura básica

#### Ramas Históricas:

- `origin/feature/ui-contrast-improvements` - Últimas mejoras
- `origin/feature/merge-web-development-branches` - Desarrollo anterior
- `origin/feature/complete-notification-system` - Sistema de notificaciones

### Recuperación de Emergencia

#### Método 1: Desde Tag (Recomendado):

```bash
# Crear rama desde tag seguro
git checkout -b emergency-recovery v2.0.0-ui-improvements

# Verificar funcionalidad
npm install && npm run build && npm run dev

# Si funciona, merge con main
git checkout main
git merge emergency-recovery
```

#### Método 2: Desde Rama Histórica:

```bash
# Para versiones específicas
git checkout -b recovery-from-historical origin/feature/merge-web-development-branches

# Verificar y merge
git checkout main
git merge recovery-from-historical
```

#### Método 3: Backup Puntual:

```bash
# Para backup de estado actual
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git push origin backup-$(date +%Y%m%d-%H%M%S)
```

### Recuperación de Archivos

#### Archivo Específico:

```bash
# Recuperar desde tag
git checkout v2.0.0-ui-improvements -- src/components/Modal.tsx

# Recuperar directorio
git checkout v2.0.0-ui-improvements -- src/components/
```

#### Estado Completo:

```bash
# Restaurar estado completo
git reset --hard v2.0.0-ui-improvements
```

---

## 🔧 Mantenimiento de Ramas

### Limpieza Programada

#### Semanal:

```bash
# Revisar ramas locales
git branch -a

# Eliminar ramas fusionadas
git branch -d feature/rama-fusionada

# Limpiar referencias remotas
git remote prune origin
```

#### Mensual:

```bash
# Revisar ramas históricas
git branch -r | grep "feature/"

# Evaluar qué mantener
# Mantener ramas importantes como backup
# Eliminar ramas obsoletas
```

### Monitoreo de Ramas

#### Ramas Activas:

```bash
# Ver ramas con commits recientes
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

# Ver ramas sin actividad
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)' | tail -10
```

#### Ramas Remotas:

```bash
# Ver todas las ramas remotas
git branch -r

# Ver ramas sin actividad reciente
git for-each-ref --sort=-committerdate refs/remotes/ --format='%(committerdate:short) %(refname:short)'
```

---

## 📊 Métricas y KPIs

### Calidad de Ramas

#### Métricas de Seguimiento:

- **Tiempo de vida**: < 4 semanas para feature branches
- **Commits por rama**: 5-20 commits por funcionalidad
- **Tasa de conflictos**: < 10% en merges
- **Tiempo de revisión**: < 2 días para PRs

### Productividad

#### KPIs de Desarrollo:

- **Lead Time**: Tiempo desde creación hasta merge
- **Deploy Frequency**: Frecuencia de releases
- **Change Failure Rate**: Porcentaje de rollbacks
- **MTTR**: Tiempo de resolución de incidentes

### Monitoreo Continuo

#### Dashboard de Ramas:

```bash
# Script para monitoreo
#!/bin/bash
echo "=== ESTADO DE RAMAS ==="
echo "Ramas locales activas:"
git branch | grep -v main
echo ""
echo "Ramas remotas:"
git branch -r | wc -l
echo ""
echo "Últimos commits por rama:"
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)' | head -5
```

---

## 🚨 Situaciones Especiales

### Ramas de Emergencia

#### Creación:

```bash
# Para situaciones críticas
git checkout -b emergency/hotfix-$(date +%Y%m%d)

# Commit inmediato
git add .
git commit -m "fix(emergency): Corrección crítica inmediata

🚨 EMERGENCIA: Aplicación no funcional
✅ FIX: Implementado parche temporal
📞 CONTACTO: Notificar equipo inmediatamente"

# Push urgente
git push origin emergency/hotfix-$(date +%Y%m%d)
```

#### Protocolo:

1. **Notificar** equipo inmediatamente
2. **Documentar** causa y solución
3. **Testear** exhaustivamente
4. **Merge** urgente a main
5. **Tag** como hotfix si aplica

### Ramas Experimentales

#### Para Prototipos:

```bash
# Crear rama experimental
git checkout -b experimental/prototype-feature

# Desarrollar libremente
# Sin presión de tiempo
# Posibilidad de descartar

# Si funciona, convertir a feature
git checkout -b feature/prototype-feature
git push origin feature/prototype-feature
```

### Ramas de Investigación

#### Para Tecnologías Nuevas:

```bash
git checkout -b research/new-framework-evaluation

# Investigar y documentar
# Crear proof of concepts
# Evaluar viabilidad

# Resultado: Decisión documentada
```

---

## 📞 Contacto y Escalación

### Canales de Comunicación

#### Desarrollo Normal:

- **Issues**: Para problemas técnicos
- **Discussions**: Para preguntas sobre estrategia
- **PRs**: Para revisiones de código

#### Situaciones de Emergencia:

- **Email**: Para problemas críticos
- **Slack/Teams**: Para comunicación inmediata
- **Teléfono**: Solo para situaciones críticas

### Escalación de Problemas

#### Nivel 1: Desarrollador

- Problemas de implementación
- Dudas técnicas
- Revisiones de código

#### Nivel 2: Tech Lead

- Problemas de arquitectura
- Conflictos de estrategia
- Decisiones técnicas importantes

#### Nivel 3: Dirección

- Impacto en negocio
- Problemas de recursos
- Cambios estratégicos

---

## 🎯 Conclusión

Esta estrategia de ramas asegura:

- ✅ **Desarrollo organizado** y estructurado
- ✅ **Calidad consistente** del código
- ✅ **Recuperación rápida** en emergencias
- ✅ **Colaboración eficiente** del equipo
- ✅ **Historial traceable** del proyecto

### 📚 Documentos Relacionados:

- `DEVELOPMENT.md` - Guía completa de desarrollo
- `HISTORY.md` - Historial de versiones
- `CONTRIBUTING.md` - Guía para contribuidores

### 🔗 Recursos Útiles:

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

---

_Última actualización: $(date)_ _Versión: 1.0.0_ _Autor: Equipo de Desarrollo SAD gusi_
