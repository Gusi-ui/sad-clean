#!/bin/bash

# Script para configurar automáticamente los secrets de GitHub
# para la firma del APK de SAD LAS Worker

set -e

echo "🔑 Configurando secrets de GitHub para firma del APK..."
echo ""

# Verificar que GitHub CLI esté instalado
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) no está instalado."
    echo "📥 Instala GitHub CLI desde: https://cli.github.com/"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "❌ Error: No estás autenticado en GitHub CLI."
    echo "🔐 Ejecuta: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configurado correctamente"
echo ""

# Configurar secrets para firma del APK
echo "📝 Configurando secrets para firma del APK..."

# KEYSTORE_PASSWORD
echo "🔐 Configurando KEYSTORE_PASSWORD..."
gh secret set KEYSTORE_PASSWORD --body "sadlas2024"
echo "✅ KEYSTORE_PASSWORD configurado"

# KEY_ALIAS
echo "🔑 Configurando KEY_ALIAS..."
gh secret set KEY_ALIAS --body "sadlasworker"
echo "✅ KEY_ALIAS configurado"

# KEY_PASSWORD
echo "🔐 Configurando KEY_PASSWORD..."
gh secret set KEY_PASSWORD --body "sadlas2024"
echo "✅ KEY_PASSWORD configurado"

echo ""
echo "🎉 ¡Secrets configurados exitosamente!"
echo ""
echo "📋 Secrets configurados:"
echo "   ✅ KEYSTORE_PASSWORD"
echo "   ✅ KEY_ALIAS"
echo "   ✅ KEY_PASSWORD"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Ejecutar workflow manualmente desde GitHub Actions"
echo "   2. O hacer push a la rama mobile-app para triggear el build"
echo ""
echo "📱 El próximo APK generado estará correctamente firmado y se podrá instalar."
echo ""

# Preguntar si quiere ejecutar el workflow ahora
read -p "¿Quieres ejecutar el workflow de build ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Ejecutando workflow de build..."
    gh workflow run "Build Mobile APK" --ref mobile-app
    echo "✅ Workflow iniciado. Puedes monitorear el progreso en:"
    echo "   https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
else
    echo "ℹ️  Puedes ejecutar el workflow manualmente más tarde desde GitHub Actions."
fi

echo ""
echo "📖 Para más información, consulta: GITHUB-SECRETS-SETUP.md"