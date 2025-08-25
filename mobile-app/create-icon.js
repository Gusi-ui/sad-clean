const fs = require('fs');
const { createCanvas } = require('canvas');

// Crear un canvas de 1024x1024 (tamaño estándar para iconos)
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Fondo azul
ctx.fillStyle = '#3b82f6';
ctx.fillRect(0, 0, 1024, 1024);

// Círculo blanco en el centro
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(512, 512, 300, 0, 2 * Math.PI);
ctx.fill();

// Texto "SAD" en el centro
ctx.fillStyle = '#3b82f6';
ctx.font = 'bold 120px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('SAD', 512, 512);

// Guardar como PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./assets/icon.png', buffer);

console.log('Icono PNG creado exitosamente en ./assets/icon.png');
