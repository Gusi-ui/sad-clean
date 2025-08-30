#!/usr/bin/env node

/**
 * Script para agregar importaciones del logger
 * Ejecutar: node scripts/add-logger-imports.js
 */

const fs = require('fs');

// Archivos a procesar
const filesToProcess = [
  'src/lib/workers-query.ts',
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

  // Agregar importación del logger si no existe
  if (
    !content.includes('securityLogger') &&
    content.includes('securityLogger.error')
  ) {
    // Buscar la línea después de las importaciones de tipos
    const lines = content.split('\n');
    let insertIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import') && lines[i].includes('@/types')) {
        insertIndex = i + 1;
        break;
      }
    }

    if (insertIndex === -1) {
      // Si no encuentra import de tipos, buscar después de la primera importación
      for (let i = 0; i < lines.length; i++) {
        if (
          lines[i].includes('import') &&
          !lines[i].includes('securityLogger')
        ) {
          insertIndex = i + 1;
          break;
        }
      }
    }

    if (insertIndex !== -1) {
      lines.splice(
        insertIndex,
        0,
        "import { securityLogger } from '@/utils/security-config';"
      );
      content = lines.join('\n');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modificado: ${filePath}`);
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
  }
}

// Procesar todos los archivos
console.log('🔧 Agregando importaciones del logger...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Proceso completado!');
console.log('💡 Ejecuta "npm run lint" para verificar que no hay errores.');
