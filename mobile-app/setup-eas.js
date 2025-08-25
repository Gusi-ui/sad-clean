const fs = require('fs');
const path = require('path');

// Función para generar un UUID válido
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Leer el app.json actual
const appJsonPath = './app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Generar un UUID real para el proyecto
const projectId = generateUUID();

// Actualizar el projectId en app.json
appJson.expo.extra.eas.projectId = projectId;

// Escribir el app.json actualizado
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('✅ ProjectId actualizado en app.json:', projectId);
console.log('📝 Para configurar EAS completamente:');
console.log('1. Ejecuta: npx eas-cli login');
console.log('2. Ejecuta: npx eas-cli build:configure');
console.log('3. El projectId será:', projectId);
