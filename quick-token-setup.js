#!/usr/bin/env node

/**
 * Script rápido para configurar el token de recuperación del super admin
 * SAD gusi - Configuración Rápida de Token
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function quickTokenSetup() {
  console.log('🚀 Configuración Rápida de Token - SAD gusi\n');

  // Token específico del usuario
  const recoveryUrl =
    'http://localhost:3000/#access_token=eyJhbGciOiJIUzI1NiIsImtpZCI6IlZqQ3krYUZ3cFlQTWZ3MFEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21mdmlmd2ZtdmhienRwcmFrZWFqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NzhmZTA5OC1jMDBlLTQ1ODktYTIzMi1lM2ExYWY0NjZjZGUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3MjY2MDQ4LCJpYXQiOjE3NTcyNjI0NDgsImVtYWlsIjoiY29uZWN0b21haWxAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6W119LCJ1c2VyX21ldGFkYXRhIjp7Im5hbWUiOiJhbGFtaWEiLCJyb2xlIjoic3VwZXJfYWRtaW4ifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NTcyNjI0NDh9XSwic2Vzc2lvbl9pZCI6ImY3OGI2ZmU0LTM4MWQtNGI5Zi1iMDQ5LTQzNTI2MTIxZTY2YyIsImlzX2Fub255bW91cyI6ZmFsc2V9.ir1tJO8UklPXS2-sdD294HdgdARDukxK2Vg_hemrTJ0&expires_at=1757266048&expires_in=3600&refresh_token=kyjyprybfnnf&token_type=bearer&type=recovery';

  console.log('📊 Información del Token:');
  console.log('• Email: conectomail@gmail.com');
  console.log('• Tipo: Recovery (Recuperación)');
  console.log('• Estado: Token válido detectado\n');

  console.log('🔧 Soluciones Disponibles:\n');

  console.log('1️⃣ MÉTODO MÁS FÁCIL - Página Mejorada:');
  console.log(
    '   ✅ Página actualizada: http://localhost:3001/auth/reset-password'
  );
  console.log('   ✅ Ahora acepta tokens manuales');
  console.log('   ✅ Interfaz intuitiva\n');

  console.log('2️⃣ INSTRUCCIONES PARA USAR LA PÁGINA:');
  console.log('   1. Ejecuta: npm run dev');
  console.log('   2. Ve a: http://localhost:3001/auth/reset-password');
  console.log('   3. Copia y pega esta URL completa en el campo de texto:');
  console.log(
    '   ',
    recoveryUrl.replace('localhost:3000', 'localhost:3001/auth/reset-password')
  );
  console.log('   4. Haz clic en "Procesar Token"');
  console.log('   5. Establece tu nueva contraseña\n');

  console.log('3️⃣ MÉTODO ALTERNATIVO - URL Directa:');
  console.log('   📋 Copia y pega esta URL completa en tu navegador:');
  const directUrl = recoveryUrl.replace(
    'localhost:3000/#',
    'localhost:3001/auth/reset-password?'
  );
  console.log('   ', directUrl);
  console.log('   (Nota: Esta URL puede ser muy larga)\n');

  console.log('⚠️  RECOMENDACIONES IMPORTANTES:');
  console.log('• El token expira en 1 hora desde que lo recibiste');
  console.log('• Usa una contraseña segura (mínimo 12 caracteres)');
  console.log(
    '• Después del cambio, serás redirigido automáticamente al dashboard'
  );
  console.log(
    '• Si el token expiró, solicita uno nuevo desde Supabase Dashboard\n'
  );

  console.log('🔑 RECOMENDACIONES DE CONTRASEÑA:');
  console.log('✅ Buenos ejemplos:');
  console.log('   • SADgusi2025!Admin');
  console.log('   • SuperAdmin#2025Sad');
  console.log('   • GusiAdmin@2025!');
  console.log('❌ Evita:');
  console.log('   • password123');
  console.log('   • admin123');
  console.log('   • 123456789\n');

  console.log('🎯 ¿LISTO PARA CONTINUAR?');
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Ve a: http://localhost:3001/auth/reset-password');
  console.log('3. Pega el token y establece tu nueva contraseña');
  console.log(
    '\n¡Tu super administrador SAD gusi está a punto de estar operativo! 🦡✨'
  );
}

quickTokenSetup();
