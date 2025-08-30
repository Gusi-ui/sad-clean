#!/usr/bin/env node

/**
 * Script seguro para reemplazar console.log con logger seguro
 * Ejecutar: node scripts/fix-console-logs-safe.js
 */

const fs = require('fs');

// Archivos a procesar
const filesToProcess = [
  'src/lib/users-query.ts',
  'src/lib/workers-query.ts',
  'src/lib/database.ts',
  'src/lib/admin-query.ts',
  'src/lib/google-maps.ts',
  'src/components/workers/WorkersList.tsx',
];

// Función para procesar un archivo de forma segura
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`Archivo no encontrado: ${filePath}`);
    return;
  }

  try {
    // Leer el archivo
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Verificar si ya tiene la importación del logger
    const hasLoggerImport = content.includes('securityLogger');

    // Agregar importación si no existe
    if (!hasLoggerImport && content.includes('console.error')) {
      const importMatch = content.match(
        /import.*from.*['"]@\/types['"];?\s*\n/
      );
      if (importMatch) {
        const loggerImport =
          "import { securityLogger } from '@/utils/security-config';\n";
        newContent = content.replace(
          importMatch[0],
          importMatch[0] + loggerImport
        );
        modified = true;
      }
    }

    // Reemplazar console.error con securityLogger.error
    if (newContent.includes('console.error')) {
      newContent = newContent.replace(
        /console\.error\(([^)]+)\)/g,
        'securityLogger.error($1)'
      );
      modified = true;
    }

    // Reemplazar console.log con securityLogger.info
    if (newContent.includes('console.log')) {
      newContent = newContent.replace(
        /console\.log\(([^)]+)\)/g,
        'securityLogger.info($1)'
      );
      modified = true;
    }

    // Reemplazar console.warn con securityLogger.warn
    if (newContent.includes('console.warn')) {
      newContent = newContent.replace(
        /console\.warn\(([^)]+)\)/g,
        'securityLogger.warn($1)'
      );
      modified = true;
    }

    // Solo escribir si hay cambios y el contenido es diferente
    if (modified && newContent !== content) {
      // Verificar que el archivo no haya cambiado desde que lo leímos
      const currentContent = fs.readFileSync(filePath, 'utf8');
      if (currentContent === content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Modificado: ${filePath}`);
      } else {
        console.log(
          `⚠️  Archivo cambiado durante el procesamiento: ${filePath}`
        );
      }
    } else {
      console.log(`⏭️  Sin cambios: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Procesar todos los archivos
console.log('🔧 Iniciando corrección segura de console.log...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Proceso completado!');
console.log('💡 Ejecuta "npm run lint" para verificar que no hay errores.');
