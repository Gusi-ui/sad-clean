const fs = require('fs');
const path = require('path');

// Crear directorio assets si no existe
const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  // eslint-disable-next-line no-console
  console.log('Directorio assets creado');
}

// Crear un icono SVG simple
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo azul -->
  <rect width="1024" height="1024" fill="#3b82f6"/>
  
  <!-- Círculo blanco en el centro -->
  <circle cx="512" cy="512" r="300" fill="#ffffff"/>
  
  <!-- Texto SAD en el centro -->
  <text x="512" y="550" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
        text-anchor="middle" fill="#3b82f6">SAD</text>
</svg>`;

// Guardar como SVG (que puede ser usado como icono)
const iconPath = path.join(assetsDir, 'icon.png');
fs.writeFileSync(iconPath, svgContent);

// eslint-disable-next-line no-console
console.log('Icono SVG creado exitosamente en ./assets/icon.png');
