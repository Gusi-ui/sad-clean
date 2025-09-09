// Script para probar el endpoint /api/workers directamente
const http = require('http');

console.log('🧪 Probando endpoint /api/workers directamente...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/workers',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('📋 Respuesta del endpoint:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('📋 Respuesta cruda:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error en la petición: ${e.message}`);
});

req.end();
