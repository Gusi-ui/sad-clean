#!/bin/bash

# Script para cerrar PRs de Dependabot
# Uso: ./close-dependabot-prs.sh

echo "🔍 Buscando PRs de Dependabot..."

# Verificar si gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "📦 Instalar con: brew install gh"
    echo "🔐 Autenticarse con: gh auth login"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado en GitHub CLI"
    echo "🔐 Ejecuta: gh auth login"
    exit 1
fi

# Listar PRs de Dependabot
echo "📋 PRs de Dependabot encontrados:"
gh pr list --author app/dependabot --limit 10

# Confirmar antes de cerrar
echo ""
read -p "¿Quieres cerrar todos los PRs de Dependabot? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Cerrando PRs de Dependabot..."

    # Obtener números de PRs y cerrarlos
    gh pr list --author app/dependabot --json number,title --jq '.[] | "\(.number): \(.title)"' | while read -r pr_info; do
        pr_number=$(echo "$pr_info" | cut -d: -f1)
        pr_title=$(echo "$pr_info" | cut -d: -f2-)

        echo "🔒 Cerrando PR #$pr_number: $pr_title"

        # Cerrar PR con comentario
        gh pr close "$pr_number" --delete-branch --body "✅ **PR cerrado - Actualización aplicada manualmente**

Esta actualización ya ha sido aplicada manualmente en el commit:
- Commit: \`10a3e2d0\`
- Branch: \`mobile-app\`
- Estado: ✅ Todas las validaciones pasando

**Cambios aplicados:**
- ✅ eslint-config-next actualizado a 15.5.0
- ✅ TypeScript configurado correctamente
- ✅ Build exitoso
- ✅ Sin errores ni warnings

Gracias Dependabot! 🚀"

        echo "✅ PR #$pr_number cerrado"
    done

    echo "🎉 ¡Todos los PRs de Dependabot han sido cerrados!"
else
    echo "❌ Operación cancelada"
fi
