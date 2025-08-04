# 🔒 Configuración de Protección de Rama Main

## 📋 Pasos para configurar la protección de rama en GitHub

### **1. Acceder a la configuración**

1. Ve a: `https://github.com/Gusi-ui/sad-clean`
2. Haz clic en **Settings** (pestaña superior)
3. En el menú lateral izquierdo, haz clic en **Branches**

### **2. Configurar protección de `main`**

1. En la sección **Branch protection rules**, haz clic en **Add rule**
2. En **Branch name pattern**, escribe: `main`
3. Marca las siguientes opciones:

#### **✅ Configuración obligatoria:**

```markdown
**Branch protection rules:**

☑️ Require a pull request before merging

- Required approving reviews: 1
- Dismiss stale PR approvals when new commits are pushed

☑️ Require status checks to pass before merging

- ✅ quality-check (npm run type-check)
- ✅ quality-check (npm run lint)
- ✅ quality-check (npm run format:check)

☑️ Require branches to be up to date before merging

☑️ Require conversation resolution before merging

☑️ Require signed commits

☑️ Require linear history

☑️ Require deployments to succeed before merging

**Restrict pushes that create files that are larger than:**

- 100 MB

**Restrict pushes that create files with the following extensions:**

- .exe
- .dll
- .so
- .dylib
```

### **3. Configuración de Status Checks**

Los siguientes checks deben estar habilitados:

- ✅ `quality-check` (TypeScript check)
- ✅ `quality-check` (ESLint)
- ✅ `quality-check` (Format check)

### **4. Beneficios de esta configuración**

1. **✅ Calidad de código:** Solo se pueden mergear PRs que pasen todas las validaciones
2. **✅ Revisión obligatoria:** Al menos una persona debe revisar el código
3. **✅ Historial limpio:** Previene commits directos a main
4. **✅ Seguridad:** Requiere commits firmados
5. **✅ Automatización:** Las validaciones se ejecutan automáticamente

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
