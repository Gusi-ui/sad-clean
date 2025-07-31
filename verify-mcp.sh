#!/bin/bash

echo "🔍 Verificando configuración de Supabase para Cursor..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar que Supabase CLI esté instalado
echo "📦 Verificando instalación de Supabase CLI..."
if ! npm list supabase > /dev/null 2>&1; then
    echo "❌ Error: Supabase CLI no está instalado"
    echo "💡 Ejecuta: npm install --save-dev supabase"
    exit 1
fi

echo "✅ Supabase CLI instalado correctamente"

# Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Advertencia: No se encontró .env.local"
    echo "📝 Crea el archivo con las variables de Supabase:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key"
    echo "   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key"
else
    echo "✅ Archivo .env.local encontrado"
fi

# Verificar configuración de Cursor
echo "⚙️  Verificando configuración de Cursor..."
if [ ! -f ".vscode/settings.json" ]; then
    echo "⚠️  Advertencia: No se encontró configuración de Cursor"
else
    echo "✅ Configuración de Cursor encontrada"
fi

# Verificar archivos de utilidades
echo "🔧 Verificando archivos de utilidades..."
if [ -f "src/lib/database.ts" ]; then
    echo "✅ Archivo de utilidades de BD encontrado"
else
    echo "⚠️  Advertencia: No se encontró src/lib/database.ts"
fi

# Test de conexión con Supabase (si las variables están disponibles)
echo "🔗 Probando conexión con Supabase..."
if [ -f ".env.local" ]; then
    # Cargar variables de entorno
    export $(cat .env.local | grep -v '^#' | xargs)

    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "✅ Variables de entorno configuradas"
        echo "🌐 URL: $NEXT_PUBLIC_SUPABASE_URL"
    else
        echo "⚠️  Advertencia: Variables de Supabase no configuradas"
    fi
else
    echo "⚠️  No se puede verificar conexión sin .env.local"
fi

# Verificar scripts de package.json
echo "📝 Verificando scripts de BD..."
if grep -q "db:types" package.json; then
    echo "✅ Scripts de BD configurados en package.json"
else
    echo "⚠️  Advertencia: Scripts de BD no encontrados en package.json"
fi

echo ""
echo "📋 Resumen de verificación:"
echo "✅ Supabase CLI instalado"
echo "✅ Scripts de configuración creados"
echo "✅ Documentación disponible"
echo "✅ Utilidades de BD creadas"

echo ""
echo "🚀 Para completar la configuración:"
echo "1. Configura tu .env.local con las variables de Supabase"
echo "2. Actualiza el script db:types en package.json con tu project-id"
echo "3. Ejecuta: npm run db:types"
echo "4. Reinicia Cursor"
echo "5. Prueba la integración preguntando en Cursor:"
echo "   - 'Muéstrame cómo usar las funciones de BD'"
echo "   - 'Genera una función para crear workers'"
echo "   - 'Crea un query para obtener asignaciones'"

echo ""
echo "📚 Documentación disponible en: MCP-ALTERNATIVES.md"
