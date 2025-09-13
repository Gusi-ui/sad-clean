#!/usr/bin/env node

/**
 * Script para resetear la contraseña del super administrador
 * SAD gusi - Gestión de Super Administrador
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

async function resetSuperAdminPassword() {
  console.log('🔐 Reset de Contraseña - Super Administrador SAD gusi\n');

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
    const serviceRoleKey = envContent.match(
      /SUPABASE_SERVICE_ROLE_KEY=(.+)/
    )?.[1];

    if (!supabaseUrl || !serviceRoleKey) {
      console.log('❌ Variables de Supabase no encontradas en .env.local');
      console.log('Configura las variables SUPABASE primero');
      process.exit(1);
    }

    // Crear cliente de Supabase
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🔍 Buscando super administrador...');

    // Buscar el usuario super admin
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.log(`❌ Error al listar usuarios: ${listError.message}`);
      process.exit(1);
    }

    const superAdmin = users.users.find(
      (user) =>
        user.email === 'conectomail@gmail.com' ||
        (user.user_metadata && user.user_metadata.role === 'super_admin')
    );

    if (!superAdmin) {
      console.log('❌ Super administrador no encontrado');
      console.log('Usuarios encontrados:');
      users.users.forEach((user) => {
        console.log(
          `  - ${user.email} (${user.user_metadata?.role || 'sin rol'})`
        );
      });
      process.exit(1);
    }

    console.log(`✅ Super administrador encontrado: ${superAdmin.email}`);
    console.log(
      `📅 Creado: ${new Date(superAdmin.created_at).toLocaleDateString('es-ES')}`
    );

    // Pedir nueva contraseña
    const newPassword = await askQuestion(
      '🔑 Ingresa la nueva contraseña para el super administrador: '
    );

    if (!newPassword || newPassword.length < 6) {
      console.log('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    const confirmPassword = await askQuestion(
      '🔄 Confirma la nueva contraseña: '
    );

    if (newPassword !== confirmPassword) {
      console.log('❌ Las contraseñas no coinciden');
      process.exit(1);
    }

    rl.close();

    console.log('\n⏳ Actualizando contraseña...');

    // Actualizar contraseña
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(superAdmin.id, {
        password: newPassword,
      });

    if (updateError) {
      console.log(`❌ Error al actualizar contraseña: ${updateError.message}`);
      process.exit(1);
    }

    console.log('\n🎉 ¡Contraseña actualizada exitosamente!');
    console.log('📧 Email del super administrador: conectomail@gmail.com');
    console.log('🔐 Nueva contraseña configurada');

    console.log('\n🚀 Ahora puedes:');
    console.log('1. Reiniciar la aplicación: npm run dev');
    console.log('2. Acceder al dashboard de super admin');
    console.log('3. Cambiar la contraseña desde la interfaz si es necesario');
  } catch (error) {
    console.log(`❌ Error inesperado: ${error.message}`);
    process.exit(1);
  }
}

resetSuperAdminPassword();
