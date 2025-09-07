#!/usr/bin/env node

/**
 * Script para corregir la configuración de redirección de Supabase
 * SAD gusi - Configuración de Redirect URLs
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixSupabaseRedirect() {
  console.log('🔧 CORRECCIÓN DE REDIRECCIÓN - SAD gusi\n');

  // Leer configuración actual
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Archivo .env.local no encontrado');
    console.log('Ejecuta primero: node check-supabase-config.js\n');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];

  if (!supabaseUrl) {
    console.log('❌ No se encontró URL de Supabase en .env.local');
    process.exit(1);
  }

  console.log('📊 CONFIGURACIÓN ACTUAL:');
  console.log(`• URL de Supabase: ${supabaseUrl}`);
  console.log('• Puerto de desarrollo: 3001\n');

  console.log('🎯 SOLUCIÓN PARA TU TOKEN:\n');

  console.log('📋 PASO 1 - CONFIGURAR SUPABASE DASHBOARD:');
  console.log('1. Ve a: https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto SAD gusi');
  console.log('3. Ve a: Settings → Authentication');
  console.log('4. Busca la sección "Site URL" y "Redirect URLs"');
  console.log('5. Actualiza los valores:\n');

  console.log('   Site URL:');
  console.log('   ✅ http://localhost:3001\n');

  console.log('   Redirect URLs (agrega estos):');
  console.log('   ✅ http://localhost:3001');
  console.log('   ✅ http://localhost:3001/auth/reset-password');
  console.log('   ✅ https://localhost:3001 (opcional)\n');

  console.log('6. Haz clic en "Save"\n');

  console.log('📋 PASO 2 - PROBAR EL TOKEN:');
  console.log('Después de configurar Supabase, tu token debería funcionar.');
  console.log('Puedes probarlo de dos maneras:\n');

  console.log('🔗 MÉTODO A - URL Directa:');
  console.log('Usa tu token original directamente en el navegador:');
  console.log(
    'https://mfvifwfmvhbztprakeaj.supabase.co/auth/v1/verify?token=TU_TOKEN&type=recovery&redirect_to=http://localhost:3001\n'
  );

  console.log('🔗 MÉTODO B - Página de Reset:');
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Ve a: http://localhost:3001/auth/reset-password');
  console.log('3. Pega tu URL completa del email');
  console.log('4. Haz clic en "Procesar Token"\n');

  console.log('⚠️  IMPORTANTE:');
  console.log('• La configuración puede tardar unos minutos en aplicarse');
  console.log(
    '• Si usas Supabase Cloud, los cambios se aplican inmediatamente'
  );
  console.log('• Si usas Supabase local, reinicia el servicio\n');

  console.log('🔍 VERIFICACIÓN:');
  console.log('Para verificar que la configuración funciona:');
  console.log('1. Ve a http://localhost:3001/auth/reset-password');
  console.log('2. Pega cualquier URL de recuperación');
  console.log('3. Debería redirigir correctamente\n');

  console.log('🎉 ¡CONFIGURACIÓN COMPLETADA!');
  console.log(
    'Tu token de recuperación debería funcionar correctamente ahora.'
  );
  console.log('\n¿Necesitas ayuda adicional? Ejecuta: node debug-token.js');
}

fixSupabaseRedirect();
