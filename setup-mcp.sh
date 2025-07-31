#!/bin/bash

echo "🚀 Configurando MCP de Supabase para Cursor..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Instalar MCP Supabase server
echo "📦 Instalando MCP Supabase server..."
npm install --save-dev @modelcontextprotocol/server-supabase

# Verificar que las variables de entorno estén configuradas
echo "🔍 Verificando variables de entorno..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Advertencia: No se encontró .env.local"
    echo "📝 Crea el archivo .env.local con las siguientes variables:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key"
    echo "   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key"
fi

# Crear directorio .cursor si no existe
if [ ! -d ".cursor" ]; then
    mkdir .cursor
    echo "📁 Creado directorio .cursor"
fi

# Crear configuración de Cursor para MCP
echo "⚙️  Configurando Cursor para MCP..."

cat > .cursor/settings.json << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "\${env:NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "\${env:NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        "SUPABASE_SERVICE_ROLE_KEY": "\${env:SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
EOF

echo "✅ Configuración MCP completada!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Asegúrate de que tu .env.local tenga las variables de Supabase"
echo "2. Reinicia Cursor para cargar la nueva configuración"
echo "3. Verifica la conexión ejecutando: npx @modelcontextprotocol/server-supabase --help"
echo ""
echo "🔧 Para usar MCP de Supabase en Cursor:"
echo "- Cursor podrá acceder a tu base de datos Supabase"
echo "- Podrá generar queries SQL automáticamente"
echo "- Podrá crear tipos TypeScript basados en tu esquema"
echo "- Podrá sugerir mejoras en tu estructura de datos"
echo ""
echo "🚀 ¡MCP de Supabase está listo para usar!"
