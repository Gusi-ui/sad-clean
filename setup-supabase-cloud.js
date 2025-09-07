#!/usr/bin/env node

/**
 * Script para configurar Supabase Cloud correctamente
 * SAD gusi - Configuración de Credenciales Cloud
 */

const fs = require('fs');
const path = require('path');

async function setupSupabaseCloud() {
  console.log('🚀 CONFIGURACIÓN DE SUPABASE CLOUD - SAD gusi\n');

  console.log('📊 DIAGNÓSTICO DEL PROBLEMA:');
  console.log('• ❌ Estabas usando configuración local (127.0.0.1:54321)');
  console.log('• ❌ Pero accedes a Supabase desde el dashboard web');
  console.log('• ❌ Las claves no coincidían con tu proyecto Cloud\n');

  console.log('✅ SOLUCIÓN IMPLEMENTADA:');
  console.log('• ✅ Archivo .env.local actualizado con URL de Cloud');
  console.log('• ✅ Proyecto identificado: mfvivfwfmvhbztprakeaj');
  console.log('• ✅ Solo necesitas agregar tus claves reales\n');

  console.log('🔑 PASOS PARA OBTENER TUS CLAVES:\n');

  console.log('📍 PASO 1 - ACCEDER AL DASHBOARD:');
  console.log('1. Ve a: https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto "SAD gusi"');
  console.log('3. Ve a: Settings → API');
  console.log('4. Copia las siguientes claves:\n');

  console.log('📍 PASO 2 - CLAVES A COPIAR:');
  console.log('🔵 Project URL:');
  console.log('   https://mfvifwfmvhbztprakeaj.supabase.co\n');

  console.log('🔵 anon/public key:');
  console.log('   • Busca "anon public"');
  console.log('   • Copia toda la clave (empieza con "eyJ...")\n');

  console.log('🔴 service_role key:');
  console.log('   • Busca "service_role"');
  console.log('   • Copia toda la clave (empieza con "eyJ...")\n');

  console.log('📍 PASO 3 - ACTUALIZAR .ENV.LOCAL:');
  console.log('1. Abre el archivo: .env.local');
  console.log('2. Reemplaza estas líneas:\n');

  console.log('   ANTES:');
  console.log(
    '   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_cloud'
  );
  console.log(
    '   SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio_de_supabase_cloud\n'
  );

  console.log('   DESPUÉS:');
  console.log(
    '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  );
  console.log(
    '   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n'
  );

  console.log('📍 PASO 4 - CONFIGURAR REDIRECCIONES:');
  console.log('1. En Supabase Dashboard, ve a: Settings → Authentication');
  console.log('2. Actualiza "Site URL":');
  console.log('   ✅ http://localhost:3001');
  console.log('3. Actualiza "Redirect URLs" (agrega si no están):');
  console.log('   ✅ http://localhost:3001');
  console.log('   ✅ http://localhost:3001/auth/reset-password');
  console.log('4. Haz clic en "Save"\n');

  console.log('📍 PASO 5 - PROBAR LA CONEXIÓN:');
  console.log('```bash');
  console.log('npm run dev');
  console.log('```');
  console.log('1. La aplicación debería cargar sin errores de conexión');
  console.log('2. El enlace de reset debería funcionar correctamente\n');

  console.log('🔍 VERIFICACIÓN:');
  console.log('Para verificar que todo funciona:');
  console.log('1. Ve a http://localhost:3001');
  console.log('2. No deberías ver errores de conexión');
  console.log('3. El enlace de reset debería redirigir correctamente\n');

  console.log('⚠️  RECORDATORIO:');
  console.log('• Las claves son sensibles - no las compartas');
  console.log('• La clave "anon" es pública (se puede compartir)');
  console.log('• La clave "service_role" es privada (solo servidor)\n');

  console.log('🎉 ¡CONFIGURACIÓN COMPLETA!');
  console.log(
    'Después de seguir estos pasos, tu aplicación funcionará correctamente con Supabase Cloud.'
  );

  console.log('\n💡 ¿Necesitas ayuda? Ejecuta: node debug-token.js');
}

setupSupabaseCloud();
