#!/bin/bash

# 🔍 Script para verificar el estado del release automático

echo "🚀 Verificando estado del release automático..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs importantes
REPO_URL="https://github.com/Gusi-ui/sad-clean"
ACTIONS_URL="$REPO_URL/actions"
RELEASES_URL="$REPO_URL/releases"

echo -e "${BLUE}📋 Enlaces importantes:${NC}"
echo "   🔧 GitHub Actions: $ACTIONS_URL"
echo "   📦 Releases: $RELEASES_URL"
echo ""

# Verificar si estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}🌿 Rama actual:${NC} $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "mobile-app" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No estás en la rama 'mobile-app'${NC}"
    echo "   Para activar el workflow automático, debes estar en la rama 'mobile-app'"
else
    echo -e "${GREEN}✅ Estás en la rama correcta${NC}"
fi
echo ""

# Verificar último commit
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)")
echo -e "${BLUE}📝 Último commit:${NC}"
echo "   $LAST_COMMIT"
echo ""

# Verificar si hay cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Hay cambios sin commit:${NC}"
    git status --short
    echo "   Haz commit y push para activar el workflow"
else
    echo -e "${GREEN}✅ No hay cambios pendientes${NC}"
fi
echo ""

# Verificar archivos del workflow
WORKFLOW_FILE=".github/workflows/mobile-build.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo -e "${GREEN}✅ Workflow file existe: $WORKFLOW_FILE${NC}"
else
    echo -e "${RED}❌ Workflow file no encontrado: $WORKFLOW_FILE${NC}"
fi
echo ""

# Verificar configuración de EAS
cd mobile-app 2>/dev/null
if [ $? -eq 0 ]; then
    if [ -f "eas.json" ]; then
        echo -e "${GREEN}✅ Configuración EAS encontrada${NC}"
    else
        echo -e "${RED}❌ eas.json no encontrado${NC}"
    fi
    
    if [ -f "app.json" ]; then
        echo -e "${GREEN}✅ Configuración Expo encontrada${NC}"
    else
        echo -e "${RED}❌ app.json no encontrado${NC}"
    fi
    cd ..
else
    echo -e "${RED}❌ Directorio mobile-app no encontrado${NC}"
fi
echo ""

# Instrucciones
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "   1. 🔍 Verificar workflow en: $ACTIONS_URL"
echo "   2. ⏱️  Esperar ~10-15 minutos para que complete el build"
echo "   3. 📦 Verificar release en: $RELEASES_URL"
echo "   4. 📱 Descargar APK desde el release más reciente"
echo ""

echo -e "${BLUE}🔧 Si hay problemas:${NC}"
echo "   • Revisar logs del workflow en GitHub Actions"
echo "   • Verificar que EXPO_TOKEN esté configurado en GitHub Secrets"
echo "   • Probar build local: cd mobile-app && npm run build:android"
echo ""

echo -e "${GREEN}🎉 ¡El sistema de releases automáticos está configurado!${NC}"
echo "   Cada push a 'mobile-app' generará automáticamente un nuevo release con APK"
echo ""

echo "================================================"
echo "🚀 Verificación completada"