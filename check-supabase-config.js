#!/usr/bin/env node

/**
 * Script para verificar y configurar las credenciales de Supabase
 * SAD gusi - Verificación de configuración
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Supabase para SAD gusi...\n');

// Verificar si existe .env.local
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env.local encontrado');

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=');

  console.log(`📊 Estado de configuración:`);
  console.log(`   URL de Supabase: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   Clave anónima: ${hasAnonKey ? '✅' : '❌'}`);
  console.log(`   Clave de servicio: ${hasServiceKey ? '✅' : '❌'}`);

  if (hasSupabaseUrl && hasAnonKey && hasServiceKey) {
    console.log('\n🎉 Configuración completa encontrada!');
    console.log('\n📝 Instrucciones para configurar tu super administrador:');
    console.log('1. Ve a tu proyecto Supabase: https://supabase.com/dashboard');
    console.log('2. Ve a Authentication > Users');
    console.log('3. Busca el usuario con email "conectomail@gmail.com"');
    console.log(
      '4. Haz clic en "Reset password" y establece una nueva contraseña segura'
    );
    console.log('5. Reinicia tu aplicación con: npm run dev');
  } else {
    console.log(
      '\n⚠️  Configuración incompleta. Necesitas agregar las variables faltantes.'
    );
  }
} else {
  console.log('❌ Archivo .env.local NO encontrado');

  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Puedes usar env.example como plantilla:');
    console.log('   cp env.example .env.local');
  }
}

console.log('\n🔑 Variables necesarias para Supabase:');
console.log('• NEXT_PUBLIC_SUPABASE_URL - URL de tu proyecto Supabase');
console.log('• NEXT_PUBLIC_SUPABASE_ANON_KEY - Clave anónima (pública)');
console.log('• SUPABASE_SERVICE_ROLE_KEY - Clave de servicio (privada)');

console.log('\n🌐 Para obtener tus claves:');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Settings > API');
console.log('4. Copia las claves correspondientes');

console.log('\n🚀 Una vez configurado, ejecuta: npm run dev');
