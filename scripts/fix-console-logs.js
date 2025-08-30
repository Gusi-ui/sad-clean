#!/usr/bin/env node

/**
 * Script para reemplazar console.log con logger seguro
 * Ejecutar: node scripts/fix-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Archivos a procesar
const filesToProcess = [
  'src/lib/users-query.ts',
  'src/lib/workers-query.ts',
  'src/lib/database.ts',
  'src/lib/admin-query.ts',
  'src/lib/google-maps.ts',
  'src/components/workers/WorkersList.tsx',
];

// Función para procesar un archivo
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Verificar si ya tiene la importación del logger
  const hasLoggerImport = content.includes('securityLogger');

  // Agregar importación si no existe
  if (!hasLoggerImport && content.includes('console.error')) {
    const importMatch = content.match(/import.*from.*['"]@\/types['"];?\s*\n/);
    if (importMatch) {
      const loggerImport =
        "import { securityLogger } from '@/utils/security-config';\n";
      content = content.replace(importMatch[0], importMatch[0] + loggerImport);
      modified = true;
    }
  }

  // Reemplazar console.error con securityLogger.error
  if (content.includes('console.error')) {
    content = content.replace(
      /console\.error\(([^)]+)\)/g,
      'securityLogger.error($1)'
    );
    modified = true;
  }

  // Reemplazar console.log con securityLogger.info
  if (content.includes('console.log')) {
    content = content.replace(
      /console\.log\(([^)]+)\)/g,
      'securityLogger.info($1)'
    );
    modified = true;
  }

  // Reemplazar console.warn con securityLogger.warn
  if (content.includes('console.warn')) {
    content = content.replace(
      /console\.warn\(([^)]+)\)/g,
      'securityLogger.warn($1)'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modificado: ${filePath}`);
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
  }
}

// Procesar todos los archivos
console.log('🔧 Iniciando corrección de console.log...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Proceso completado!');
console.log('💡 Ejecuta "npm run lint" para verificar que no hay errores.');
