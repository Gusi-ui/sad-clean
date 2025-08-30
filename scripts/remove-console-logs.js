#!/usr/bin/env node

/**
 * Script para eliminar console.log problemáticos
 * Ejecutar: node scripts/remove-console-logs.js
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

// Función para procesar un archivo
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Eliminar líneas con console.error
  const lines = content.split('\n');
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (
      trimmed.includes('console.error(') ||
      trimmed.includes('console.log(') ||
      trimmed.includes('console.warn(')
    ) {
      modified = true;
      return false; // Eliminar la línea
    }
    return true; // Mantener la línea
  });

  if (modified) {
    content = filteredLines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modificado: ${filePath}`);
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
  }
}

// Procesar todos los archivos
console.log('🔧 Eliminando console.log problemáticos...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Proceso completado!');
console.log('💡 Ejecuta "npm run lint" para verificar que no hay errores.');
