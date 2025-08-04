# 🔒 Configuración de Protección de Rama Main

## 📋 Pasos para configurar la protección de rama en GitHub

### **1. Acceder a la configuración**

1. Ve a: `https://github.com/Gusi-ui/sad-clean`
2. Haz clic en **Settings** (pestaña superior)
3. En el menú lateral izquierdo, haz clic en **Branches**

### **2. Configurar protección de `main`**

1. En la sección **Branch protection rules**, haz clic en **Add rule**
2. En **Branch name pattern**, escribe: `main`
3. Marca las siguientes opciones **exactamente como aparecen:**

#### **✅ Configuración específica para tu repositorio:**

```markdown
**Branch name pattern:** main

**✅ Require a pull request before merging** ☑️ Require approvals

- Number of approvals required before merging: 1 ☑️ Dismiss stale pull request approvals when new
  commits are pushed

**✅ Require status checks to pass before merging** ☑️ Require branches to be up to date before
merging

**✅ Require conversation resolution before merging**

**✅ Do not allow bypassing the above settings**
```

#### **❌ NO marcar estas opciones:**

```markdown
❌ Require review from Code Owners (no tienes CODEOWNERS configurado) ❌ Require approval of the
most recent reviewable push (opcional) ❌ Require signed commits (requiere configuración adicional)
❌ Require linear history (puede causar problemas) ❌ Require deployments to succeed before merging
(opcional por ahora) ❌ Lock branch (muy restrictivo) ❌ Allow force pushes (peligroso) ❌ Allow
deletions (peligroso)
```

### **3. Configuración de Status Checks**

**Nota importante:** En la sección "Require status checks to pass before merging":

- Por ahora puede aparecer "No required checks"
- Esto es normal porque los checks se configuran automáticamente cuando se ejecutan
- Los checks aparecerán después del primer Pull Request

**Los siguientes checks se habilitarán automáticamente:**

- ✅ `quality-check` (TypeScript check)
- ✅ `quality-check` (ESLint)
- ✅ `quality-check` (Format check)

### **4. Beneficios de esta configuración**

1. **✅ Calidad de código:** Solo se pueden mergear PRs que pasen todas las validaciones
2. **✅ Revisión obligatoria:** Al menos una persona debe revisar el código
3. **✅ Historial limpio:** Previene commits directos a main
4. **✅ Automatización:** Las validaciones se ejecutan automáticamente
5. **✅ Seguridad:** No se pueden hacer force push ni eliminar la rama

### **5. Flujo de trabajo después de la configuración**

```bash
# Para cambios futuros:
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Luego crear Pull Request en GitHub
# Las validaciones se ejecutarán automáticamente
# Solo se podrá mergear si pasan todas las validaciones
```

### **6. Comandos útiles para el nuevo flujo**

```bash
# Crear nueva rama para feature
git checkout -b feature/nombre-feature

# Crear rama para fix
git checkout -b fix/nombre-fix

# Crear rama para docs
git checkout -b docs/nombre-docs

# Después de mergear, limpiar ramas locales
git checkout main
git pull origin main
git branch -d feature/nombre-feature
```

## 🚀 **¡Configura esto en GitHub y tu proyecto estará completamente protegido!**

### **📞 ¿Necesitas ayuda?**

Si tienes alguna duda sobre alguna opción específica, puedes:

1. **Hacer screenshot** de lo que ves
2. **Describir las opciones** que aparecen
3. **Marcar solo las básicas** y agregar más después
