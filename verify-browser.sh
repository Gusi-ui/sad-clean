#!/bin/bash

echo "🌐 Verificando funcionalidad en navegador..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar que el servidor de desarrollo esté ejecutándose
echo "🔍 Verificando servidor de desarrollo..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Advertencia: Servidor de desarrollo no está ejecutándose"
    echo "💡 Ejecuta: npm run dev"
    echo ""
    echo "📋 Pasos para verificar funcionalidad:"
    echo "1. Ejecutar: npm run dev"
    echo "2. Abrir navegador: http://localhost:3000"
    echo "3. Verificar que la página carga correctamente"
    echo "4. Probar funcionalidades (botones, formularios, navegación)"
    echo "5. Verificar responsive design (mobile, tablet, desktop)"
    echo "6. Verificar accesibilidad (navegación por teclado)"
    echo "7. Verificar que no hay errores en consola del navegador"
else
    echo "✅ Servidor de desarrollo ejecutándose en http://localhost:3000"
    echo ""
    echo "📋 Checklist de verificación en navegador:"
    echo "✅ [ ] Página carga correctamente"
    echo "✅ [ ] Sin errores en consola del navegador"
    echo "✅ [ ] Componentes renderizados visualmente"
    echo "✅ [ ] Funcionalidad probada (botones, formularios)"
    echo "✅ [ ] Navegación funciona correctamente"
    echo "✅ [ ] Responsive design (mobile, tablet, desktop)"
    echo "✅ [ ] Accesibilidad básica (navegación por teclado)"
    echo "✅ [ ] Performance aceptable (sin lag visible)"
fi

echo ""
echo "🎯 Comandos útiles:"
echo "npm run dev              # Iniciar servidor de desarrollo"
echo "npm run build            # Construir para producción"
echo "npm run lint             # Verificar linting"
echo "npm run type-check       # Verificar tipos"
echo ""
echo "🌐 URLs importantes:"
echo "http://localhost:3000    # Página principal"
echo "http://localhost:3000/workers    # Gestión de workers"
echo "http://localhost:3000/assignments # Gestión de asignaciones"
echo ""
echo "📱 Herramientas de desarrollo:"
echo "- DevTools del navegador (F12)"
echo "- Pestaña Console para errores"
echo "- Pestaña Network para performance"
echo "- Responsive design mode"
echo ""
echo "🚀 ¡Recuerda probar siempre en navegador antes de hacer commit!"
