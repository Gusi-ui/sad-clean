'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

interface EnsureWorkerAuthInput {
  email: string;
  name: string;
  password: string;
}

export interface EnsureWorkerAuthResult {
  success: boolean;
  message: string;
}

/**
 * Crea o actualiza una cuenta de Supabase Auth para una trabajadora con rol 'worker'.
 * - Si no existe, la crea confirmada y asigna contraseña fija.
 * - Si existe, actualiza su contraseña y user_metadata.
 * - Garantiza registro en tabla `auth_users` con role 'worker'.
 */
export const ensureWorkerAuthAccount = async (
  input: EnsureWorkerAuthInput
): Promise<EnsureWorkerAuthResult> => {
  const email = input.email.trim();
  const password = input.password;
  const name = input.name.trim();

  if (email === '' || password.length < 6) {
    return {
      success: false,
      message: 'Email o contraseña inválidos (mín. 6 caracteres).',
    };
  }

  // 1) Intentar crear usuario
  const { data: created, error: createErr } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'worker', name },
    });

  let authUserId: string | null = created?.user?.id ?? null;

  // 2) Si ya existe, localizar y actualizar
  if (createErr?.message?.includes('already registered') === true) {
    // Buscar por email en lista de usuarios (paginado simple 1ª página)
    const { data: listData, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers();
    if (listErr !== null) {
      return {
        success: false,
        message: `Error listando usuarios: ${listErr.message}`,
      };
    }
    const found = listData.users.find(
      (u) => (u.email?.toLowerCase() ?? '') === email.toLowerCase()
    );
    if (found === undefined) {
      return {
        success: false,
        message: 'No se pudo localizar el usuario existente.',
      };
    }
    authUserId = found.id;
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      {
        password,
        user_metadata: { ...found.user_metadata, role: 'worker', name },
      }
    );
    if (updErr !== null) {
      return {
        success: false,
        message: `Error actualizando usuario: ${updErr.message}`,
      };
    }
  } else if (createErr !== null) {
    return {
      success: false,
      message: `Error creando usuario: ${createErr.message}`,
    };
  }

  if (authUserId === null) {
    return {
      success: false,
      message: 'No se pudo determinar el ID del usuario.',
    };
  }

  // 3) Asegurar registro en auth_users (upsert simple por id)
  const { error: upsertErr } = await supabaseAdmin
    .from('auth_users')
    .upsert({ id: authUserId, email, role: 'worker' }, { onConflict: 'id' });

  if (upsertErr !== null) {
    return {
      success: false,
      message: `Error registrando en auth_users: ${upsertErr.message}`,
    };
  }

  return {
    success: true,
    message: 'Acceso de trabajadora configurado correctamente.',
  };
};

export const resetWorkerPasswordByEmail = async (
  email: string,
  newPassword: string
): Promise<EnsureWorkerAuthResult> => {
  const mail = email.trim();
  if (mail === '' || newPassword.length < 6) {
    return {
      success: false,
      message: 'Email o contraseña inválidos (mín. 6 caracteres).',
    };
  }
  const { data: listData, error: listErr } =
    await supabaseAdmin.auth.admin.listUsers();
  if (listErr !== null) {
    return {
      success: false,
      message: `Error listando usuarios: ${listErr.message}`,
    };
  }
  const found = listData.users.find(
    (u) => (u.email?.toLowerCase() ?? '') === mail.toLowerCase()
  );
  if (found === undefined) {
    return { success: false, message: 'Usuario no encontrado por email.' };
  }
  const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
    found.id,
    {
      password: newPassword,
    }
  );
  if (updErr !== null) {
    return {
      success: false,
      message: `Error actualizando contraseña: ${updErr.message}`,
    };
  }
  return { success: true, message: 'Contraseña actualizada.' };
};
