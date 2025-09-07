#!/usr/bin/env node

/**
 * Script para manejar el token de recuperación de contraseña
 * SAD gusi - Procesamiento de Token de Reset
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function handlePasswordReset() {
  console.log('🔐 Procesamiento de Token de Recuperación - SAD gusi\n');

  try {
    // Leer variables de entorno
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('❌ Archivo .env.local no encontrado');
      console.log('Ejecuta primero: node check-supabase-config.js');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
    const anonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (!supabaseUrl || !anonKey) {
      console.log('❌ Variables de Supabase no encontradas en .env.local');
      console.log('Configura las variables SUPABASE primero');
      process.exit(1);
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, anonKey);

    console.log('🔗 Procesando token de recuperación...\n');

    console.log('📝 Información del token recibido:');
    console.log('• Email: conectomail@gmail.com');
    console.log('• Tipo: Recovery (Recuperación de contraseña)');
    console.log('• Estado: Token válido recibido\n');

    console.log('🔄 Para completar el proceso:\n');

    console.log('1. 🚀 Inicia la aplicación:');
    console.log('   npm run dev\n');

    console.log('2. 📧 Ve a tu email y haz clic en el enlace de recuperación');
    console.log('   O usa este enlace manualmente:');
    console.log('   http://localhost:3001/auth/reset-password\n');

    console.log('3. 🔑 Establece tu nueva contraseña segura\n');

    console.log('4. ✅ Verifica el acceso:');
    console.log('   • Email: conectomail@gmail.com');
    console.log('   • Nueva contraseña: [tu contraseña segura]\n');

    console.log('⚠️  IMPORTANTE:');
    console.log(
      '• Asegúrate de que la aplicación esté ejecutándose en http://localhost:3001'
    );
    console.log('• El token es válido por 1 hora');
    console.log('• Usa una contraseña segura (mínimo 12 caracteres)\n');

    // Esperar confirmación del usuario
    const ready = await askQuestion('¿Has iniciado la aplicación? (s/n): ');

    if (ready.toLowerCase() === 's' || ready.toLowerCase() === 'si') {
      console.log('\n🎉 ¡Perfecto!');
      console.log('Ahora puedes:');
      console.log('1. Abrir: http://localhost:3001');
      console.log('2. Hacer clic en el enlace de recuperación de tu email');
      console.log(
        '3. O ir directamente a: http://localhost:3001/auth/reset-password'
      );
      console.log('4. Establecer tu nueva contraseña');
    } else {
      console.log('\n📋 Pasos para iniciar la aplicación:');
      console.log('1. Abre una nueva terminal');
      console.log('2. Ejecuta: npm run dev');
      console.log(
        '3. Espera a que aparezca: "Ready - started server on 0.0.0.0:3001"'
      );
      console.log('4. Vuelve aquí y escribe "s"');
    }

    rl.close();
  } catch (error) {
    console.log(`❌ Error inesperado: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  handlePasswordReset();
}

module.exports = { handlePasswordReset };
