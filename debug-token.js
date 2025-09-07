#!/usr/bin/env node

/**
 * Script de debug para analizar tokens de recuperación
 * SAD gusi - Diagnóstico de Tokens
 */

const readline = require('readline');

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

function analyzeToken(token) {
  console.log('\n🔍 ANÁLISIS DEL TOKEN:\n');

  const trimmedToken = token.trim();

  console.log('📝 Token original:');
  console.log(trimmedToken);
  console.log('\n' + '='.repeat(60));

  // Análisis básico
  console.log('\n🔎 CARACTERÍSTICAS BÁSICAS:');
  console.log(`• Longitud: ${trimmedToken.length} caracteres`);
  console.log(`• Contiene '#': ${trimmedToken.includes('#')}`);
  console.log(`• Contiene '?': ${trimmedToken.includes('?')}`);
  console.log(
    `• Contiene 'access_token': ${trimmedToken.includes('access_token')}`
  );
  console.log(
    `• Contiene 'refresh_token': ${trimmedToken.includes('refresh_token')}`
  );
  console.log(`• Contiene 'type': ${trimmedToken.includes('type')}`);

  // Intentar diferentes métodos de parsing
  console.log('\n🔧 INTENTANDO MÉTODOS DE PARSING:');

  let accessToken = null;
  let refreshToken = null;
  let tokenType = null;

  // Método 1: Hash
  if (trimmedToken.includes('#')) {
    console.log('\n📋 MÉTODO 1 - Hash parsing:');
    const hashPart = trimmedToken.split('#')[1];
    if (hashPart) {
      const hashParams = new URLSearchParams(hashPart);
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      tokenType = hashParams.get('type');

      console.log(`• Parte hash: ${hashPart.substring(0, 50)}...`);
      console.log(`• Access token encontrado: ${accessToken ? '✅' : '❌'}`);
      console.log(`• Refresh token encontrado: ${refreshToken ? '✅' : '❌'}`);
      console.log(`• Type encontrado: ${tokenType || 'N/A'}`);
    } else {
      console.log('• No se encontró parte hash');
    }
  }

  // Método 2: Query string
  if (!accessToken || !refreshToken) {
    console.log('\n📋 MÉTODO 2 - Query parsing:');
    try {
      const urlObj = new URL(trimmedToken);
      const queryAccess = urlObj.searchParams.get('access_token');
      const queryRefresh = urlObj.searchParams.get('refresh_token');
      const queryType = urlObj.searchParams.get('type');

      if (queryAccess || queryRefresh) {
        accessToken = queryAccess;
        refreshToken = queryRefresh;
        tokenType = queryType;
        console.log(`• Query access token: ${queryAccess ? '✅' : '❌'}`);
        console.log(`• Query refresh token: ${queryRefresh ? '✅' : '❌'}`);
        console.log(`• Query type: ${queryType || 'N/A'}`);
      } else {
        console.log('• No se encontraron parámetros query');
      }
    } catch {
      console.log('• No es una URL válida para query parsing');
    }
  }

  // Método 3: Direct parsing (access_token/refresh_token)
  if (!accessToken || !refreshToken) {
    console.log('\n📋 MÉTODO 3 - Direct parsing (access_token/refresh_token):');
    const accessMatch = trimmedToken.match(/access_token=([^&]+)/);
    const refreshMatch = trimmedToken.match(/refresh_token=([^&]+)/);
    const typeMatch = trimmedToken.match(/type=([^&]+)/);

    if (accessMatch || refreshMatch) {
      accessToken = accessMatch ? accessMatch[1] : accessToken;
      refreshToken = refreshMatch ? refreshMatch[1] : refreshToken;
      tokenType = typeMatch ? typeMatch[1] : tokenType;

      console.log(`• Direct access token: ${accessMatch ? '✅' : '❌'}`);
      console.log(`• Direct refresh token: ${refreshMatch ? '✅' : '❌'}`);
      console.log(`• Direct type: ${typeMatch ? typeMatch[1] : 'N/A'}`);
    } else {
      console.log('• No se encontraron tokens access_token/refresh_token');
    }
  }

  // Método 4: Supabase verify token (TU FORMATO)
  if (!accessToken && !refreshToken) {
    console.log('\n📋 MÉTODO 4 - Supabase verify token:');
    const tokenMatch = trimmedToken.match(/token=([^&]+)/);
    const typeMatch = trimmedToken.match(/type=([^&]+)/);
    const supabaseUrlMatch = trimmedToken.match(
      /https:\/\/([^.]+)\.supabase\.co/
    );

    if (tokenMatch && typeMatch) {
      const verifyToken = tokenMatch[1];
      const tokenTypeFound = typeMatch[1];
      const projectId = supabaseUrlMatch ? supabaseUrlMatch[1] : 'unknown';

      console.log(
        `• Token de verificación: ✅ ENCONTRADO (${verifyToken.substring(0, 20)}...)`
      );
      console.log(`• Tipo: ${tokenTypeFound}`);
      console.log(`• Proyecto Supabase: ${projectId}`);
      console.log(`• URL completa: ✅ VÁLIDA`);

      console.log('\n🎉 ¡FORMATO DE SUPABASE RECONOCIDO!');
      console.log('Este es un token de verificación estándar de Supabase.');
      console.log('Necesitas usar la URL directa de verificación.');
      console.log('\n📋 INSTRUCCIONES:');
      console.log('1. Usa esta URL directamente en tu navegador:');
      console.log(`   ${trimmedToken}`);
      console.log('2. O configura tu aplicación para redirigir correctamente');
      console.log('3. El token se procesará automáticamente por Supabase');

      return {
        accessToken: null,
        refreshToken: null,
        tokenType: tokenTypeFound,
        supabaseVerifyToken: verifyToken,
        isSupabaseVerifyFormat: true,
      };
    } else {
      console.log('• No es un token de verificación de Supabase');
    }
  }

  // Resultado final
  console.log('\n🎯 RESULTADO FINAL:');
  console.log(
    `• Access Token: ${accessToken ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`
  );
  console.log(
    `• Refresh Token: ${refreshToken ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`
  );
  console.log(`• Token Type: ${tokenType || 'N/A'}`);

  if (accessToken && refreshToken) {
    console.log('\n🎉 ¡TOKENS VÁLIDOS ENCONTRADOS!');
    console.log('Tu token debería funcionar en la página de reset.');

    if (tokenType && tokenType !== 'recovery') {
      console.log('⚠️  Advertencia: El tipo de token no es "recovery"');
    }
  } else {
    console.log('\n❌ TOKENS NO ENCONTRADOS');
    console.log('Verifica que hayas copiado la URL completa del email.');
    console.log('La URL debe contener "access_token=" y "refresh_token="');
  }

  console.log('\n💡 RECOMENDACIONES:');
  console.log('• Copia la URL completa del email');
  console.log('• Asegúrate de no cortar el texto');
  console.log('• Incluye todo desde "http://" hasta el final');
  console.log('• Si usas móvil, asegúrate de que no haya saltos de línea');

  return { accessToken, refreshToken, tokenType };
}

async function main() {
  console.log('🔐 DEBUG DE TOKEN - SAD gusi\n');
  console.log(
    'Este script te ayudará a diagnosticar problemas con tu token de recuperación.\n'
  );

  const token = await askQuestion(
    '📋 Pega aquí tu URL/token completo del email:\n'
  );

  if (!token || !token.trim()) {
    console.log('❌ No se proporcionó ningún token');
    process.exit(1);
  }

  analyzeToken(token);

  rl.close();
}

main();
