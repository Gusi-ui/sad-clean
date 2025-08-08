#!/bin/bash

echo "🔍 Verificando que el servidor de desarrollo esté ejecutándose..."

# Verificar si el puerto 3000 está en uso
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Servidor de desarrollo ejecutándose en puerto 3000"
    echo "🌐 Abriendo navegador en http://localhost:3000"

    # Abrir navegador
    if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
    else
        echo "⚠️  No se pudo abrir el navegador automáticamente"
        echo "   Por favor, abre manualmente: http://localhost:3000"
    fi

    echo ""
    echo "📋 Checklist de verificación en navegador:"
    echo "   ✅ Página cargada correctamente (sin errores en consola)"
    echo "   ✅ Componentes renderizados (verificación visual)"
    echo "   ✅ Funcionalidad probada (botones, formularios, navegación)"
    echo "   ✅ Responsive design (mobile, tablet, desktop)"
    echo "   ✅ Accesibilidad básica (navegación por teclado, contraste)"
    echo "   ✅ Performance aceptable (sin lag visible)"
    echo ""
    echo "🎯 Si todo está correcto, puedes proceder con el commit"
else
    echo "❌ Servidor de desarrollo no está ejecutándose"
    echo "   Ejecuta: npm run dev"
    exit 1
fi
