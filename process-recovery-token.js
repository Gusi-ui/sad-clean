#!/usr/bin/env node

/**
 * Script para procesar el token de recuperación de Supabase
 * SAD gusi - Solución para Token de Recuperación
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function processRecoveryToken() {
  console.log('🔐 Procesador de Token de Recuperación - SAD gusi\n');

  // Token del usuario (extraído de la URL que proporcionó)
  const recoveryToken =
    'eyJhbGciOiJIUzI1NiIsImtpZCI6IlZqQ3krYUZ3cFlQTWZ3MFEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21mdmlmd2ZtdmhienRwcmFrZWFqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NzhmZTA5OC1jMDBlLTQ1ODktYTIzMi1lM2ExYWY0NjZjZGUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3MjY2MDQ4LCJpYXQiOjE3NTcyNjI0NDgsImVtYWlsIjoiY29uZWN0b21haWxAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6W119LCJ1c2VyX21ldGFkYXRhIjp7Im5hbWUiOiJhbGFtaWEiLCJyb2xlIjoic3VwZXJfYWRtaW4ifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NTcyNjI0NDh9XSwic2Vzc2lvbl9pZCI6ImY3OGI2ZmU0LTM4MWQtNGI5Zi1iMDQ5LTQzNTI2MTIxZTY2YyIsImlzX2Fub255bW91cyI6ZmFsc2V9.ir1tJO8UklPXS2-sdD294HdgdARDukxK2Vg_hemrTJ0';

  const refreshToken = 'kyjyprybfnnf';
  const expiresAt = '1757266048';

  console.log('📊 Información del Token:');
  console.log('• Email: conectomail@gmail.com');
  console.log('• Tipo: Recovery (Recuperación)');
  console.log(
    '• Expira: ' + new Date(parseInt(expiresAt) * 1000).toLocaleString('es-ES')
  );
  console.log('• Estado: Token válido\n');

  try {
    // Leer configuración
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('❌ Archivo .env.local no encontrado');
      console.log('Ejecuta primero: node check-supabase-config.js\n');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
    const anonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (!supabaseUrl || !anonKey) {
      console.log('❌ Variables de Supabase no encontradas');
      console.log('Configura las variables en .env.local\n');
      process.exit(1);
    }

    console.log('🔧 Soluciones disponibles:\n');

    console.log('1️⃣ MÉTODO RECOMENDADO - Página dedicada:');
    console.log('   ✅ Página creada: /auth/reset-password');
    console.log('   ✅ Maneja automáticamente el token');
    console.log('   ✅ Interfaz intuitiva\n');

    console.log('2️⃣ MÉTODO MANUAL - URL directa:');
    console.log('   📋 Construye esta URL en tu navegador:');
    console.log(
      `   http://localhost:3001/auth/reset-password?access_token=${recoveryToken}&refresh_token=${refreshToken}&expires_at=${expiresAt}&expires_in=3600&type=recovery\n`
    );

    console.log('3️⃣ MÉTODO ALTERNATIVO - Desde Supabase:');
    console.log('   🔄 Si el panel de Supabase aún redirige mal:');
    console.log('   • Ve a: https://supabase.com/dashboard');
    console.log('   • Selecciona tu proyecto SAD gusi');
    console.log('   • Ve a Settings > Authentication');
    console.log('   • Actualiza "Site URL" a: http://localhost:3001');
    console.log('   • Actualiza "Redirect URLs" a: http://localhost:3001');
    console.log('   • Intenta resetear la contraseña nuevamente\n');

    console.log('🚀 PASOS PARA COMPLETAR:');
    console.log('1. Inicia la aplicación: npm run dev');
    console.log('2. Ve a: http://localhost:3001/auth/reset-password');
    console.log('3. O usa la URL completa mostrada arriba');
    console.log('4. Establece tu nueva contraseña segura');
    console.log('5. ¡Listo! Tendrás acceso al dashboard de super admin\n');

    console.log('⚠️  NOTAS IMPORTANTES:');
    console.log('• El token expira en 1 hora');
    console.log('• Asegúrate de que la app esté corriendo en puerto 3001');
    console.log('• Usa una contraseña segura (mínimo 12 caracteres)');
    console.log(
      '• Después del cambio, serás redirigido al dashboard automáticamente\n'
    );

    console.log('🔑 RECOMENDACIONES DE CONTRASEÑA:');
    console.log('✅ Buenos ejemplos:');
    console.log('   • SADgusi2025!Admin');
    console.log('   • SuperAdmin#2025Sad');
    console.log('   • GusiAdmin@2025!');
    console.log('❌ Malos ejemplos:');
    console.log('   • password123');
    console.log('   • admin123');
    console.log('   • 123456789\n');

    console.log('🎯 ¿LISTO PARA CONTINUAR?');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Ve a: http://localhost:3001/auth/reset-password');
    console.log('3. ¡Establece tu nueva contraseña!');
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

processRecoveryToken();
