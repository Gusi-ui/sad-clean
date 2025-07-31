# 🌐 Verificación en Navegador - Reglas de Cursor

## 🎯 **OBJETIVO**

Asegurar que toda funcionalidad desarrollada sea probada en el navegador antes de hacer commit,
garantizando calidad y funcionamiento correcto.

## ✅ **CHECKLIST OBLIGATORIO**

### **Antes de cada Commit**

#### **1. Servidor de Desarrollo**

- [ ] **Ejecutar**: `npm run dev`
- [ ] **Verificar**: Servidor iniciado en `http://localhost:3000`
- [ ] **Confirmar**: Sin errores en terminal

#### **2. Verificación Básica**

- [ ] **Abrir navegador**: `http://localhost:3000`
- [ ] **Carga de página**: Sin errores visibles
- [ ] **Consola del navegador**: Sin errores (F12 → Console)
- [ ] **Network**: Sin errores 404/500

#### **3. Funcionalidad**

- [ ] **Navegación**: Menús y enlaces funcionan
- [ ] **Formularios**: Campos, validaciones, envío
- [ ] **Botones**: Clicks, estados, feedback
- [ ] **Interacciones**: Hover, focus, estados activos

#### **4. Responsive Design**

- [ ] **Mobile** (320px - 768px): Layout adaptado
- [ ] **Tablet** (768px - 1024px): Elementos reorganizados
- [ ] **Desktop** (1024px+): Layout completo
- [ ] **Orientación**: Portrait y landscape

#### **5. Accesibilidad**

- [ ] **Navegación por teclado**: Tab, Enter, Escape
- [ ] **Contraste de colores**: Texto legible
- [ ] **Labels**: Formularios con etiquetas
- [ ] **Alt text**: Imágenes con texto alternativo

#### **6. Performance**

- [ ] **Carga inicial**: < 3 segundos
- [ ] **Interacciones**: Sin lag visible
- [ ] **Animaciones**: Suaves y fluidas
- [ ] **Memoria**: Sin memory leaks

## 🔧 **COMANDOS ÚTILES**

### **Verificación Automática**

```bash
# Verificar servidor y checklist
./verify-browser.sh

# Iniciar servidor de desarrollo
npm run dev

# Verificar tipos
npm run type-check

# Verificar linting
npm run lint

# Verificar formato
npm run format:check
```

### **Herramientas de Desarrollo**

```bash
# Abrir DevTools (F12)
# Pestañas importantes:
# - Console: Errores y logs
# - Network: Requests y performance
# - Elements: HTML y CSS
# - Application: Storage y cache
```

## 📱 **TESTING RESPONSIVE**

### **Breakpoints a Verificar**

```css
/* Mobile First */
@media (min-width: 320px) {
  /* Mobile pequeño */
}
@media (min-width: 768px) {
  /* Tablet */
}
@media (min-width: 1024px) {
  /* Desktop pequeño */
}
@media (min-width: 1440px) {
  /* Desktop grande */
}
```

### **Dispositivos de Prueba**

- **Mobile**: iPhone SE, Samsung Galaxy
- **Tablet**: iPad, Samsung Tab
- **Desktop**: 1920x1080, 2560x1440

## 🎨 **VERIFICACIÓN VISUAL**

### **Elementos a Revisar**

- [ ] **Tipografía**: Tamaños, pesos, espaciado
- [ ] **Colores**: Paleta definida, contraste
- [ ] **Espaciado**: Margins, padding consistentes
- [ ] **Alineación**: Elementos alineados
- [ ] **Iconos**: Tamaños apropiados
- [ ] **Imágenes**: Optimizadas, responsive

### **Estados de Componentes**

- [ ] **Normal**: Estado por defecto
- [ ] **Hover**: Efectos al pasar mouse
- [ ] **Focus**: Navegación por teclado
- [ ] **Active**: Al hacer click
- [ ] **Disabled**: Elementos deshabilitados
- [ ] **Loading**: Estados de carga
- [ ] **Error**: Estados de error

## 🚨 **ERRORES COMUNES**

### **Errores en Consola**

```javascript
// Errores típicos a evitar:
-'Cannot read property of undefined' -
  'TypeError: ... is not a function' -
  'Failed to load resource' -
  'Uncaught (in promise)';
```

### **Problemas de Performance**

```javascript
// Indicadores de problemas:
- Tiempo de carga > 3 segundos
- Memory leaks (crecimiento continuo)
- Re-renders innecesarios
- Bundle size muy grande
```

### **Problemas de Responsive**

```css
/* Problemas comunes:
- Elementos que se salen del viewport
- Texto que se corta
- Botones muy pequeños en mobile
- Scroll horizontal no deseado
*/
```

## 📋 **CHECKLIST RÁPIDO**

### **Para cada nueva funcionalidad:**

1. **Desarrollo**: Escribir código
2. **Servidor**: `npm run dev`
3. **Navegador**: Abrir `http://localhost:3000`
4. **Funcionalidad**: Probar nueva feature
5. **Responsive**: Probar en mobile/tablet
6. **Accesibilidad**: Navegación por teclado
7. **Performance**: Verificar velocidad
8. **Commit**: Solo si todo funciona

### **Para cada commit:**

1. **Linting**: `npm run lint`
2. **Tipos**: `npm run type-check`
3. **Formato**: `npm run format:check`
4. **Navegador**: Probar funcionalidad
5. **Commit**: `git commit -m "tipo(alcance): descripción"`

## 🎯 **INTEGRACIÓN CON CURSOR**

### **Reglas Automáticas**

- ✅ **Cursor sugiere** probar en navegador antes de commit
- ✅ **Verificación automática** del servidor de desarrollo
- ✅ **Checklist integrado** en pre-commit hooks
- ✅ **Scripts de verificación** automáticos

### **Comandos en Cursor**

```bash
# Verificar todo antes de commit
./verify-browser.sh

# Verificar solo servidor
curl -s http://localhost:3000

# Verificar tipos y linting
npm run type-check && npm run lint
```

## 🚀 **BENEFICIOS**

### **Calidad del Código**

- ✅ **Menos bugs** en producción
- ✅ **Mejor UX** desde el inicio
- ✅ **Responsive design** garantizado
- ✅ **Accesibilidad** integrada

### **Productividad**

- ✅ **Detección temprana** de problemas
- ✅ **Menos tiempo** en debugging
- ✅ **Confianza** en el código
- ✅ **Deployments** más seguros

---

**¡Recuerda: Siempre prueba en navegador antes de hacer commit! 🌐**
