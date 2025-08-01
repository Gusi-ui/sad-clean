'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { AdminInsert, User as AdminUser } from '@/types';

/**
 * Crea un nuevo usuario administrador en Supabase.
 * Esta función debe ser llamada desde un entorno seguro o por un usuario con permisos de super_admin.
 *
 * @param adminData - Datos del nuevo administrador (email, password, nombre).
 * @returns El nuevo usuario creado.
 */
export const createAdmin = async (
  adminData: AdminInsert
): Promise<AdminUser> => {
  // Paso 1: Crear usuario confirmado usando el cliente de administrador
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: adminData['email'] ?? '',
      password: adminData.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name: adminData.name,
        role: 'admin',
      },
    });

  if (authError) {
    throw new Error(
      `Error al crear el usuario en Supabase Auth: ${authError.message}`
    );
  }

  if (authData.user === null || authData.user === undefined) {
    throw new Error('No se pudo obtener el usuario después del registro.');
  }

  const newUserId = authData.user.id;

  // Paso 2: Insertar en `auth_users` usando el cliente de administrador para bypassear RLS.
  const adminEmail = adminData['email'];
  if (adminEmail === undefined || adminEmail === null || adminEmail === '') {
    throw new Error('Email es requerido para crear un administrador');
  }

  const { error: userError } = await supabaseAdmin.from('auth_users').insert({
    id: newUserId,
    email: adminEmail,
    role: 'admin',
  });

  if (userError) {
    // Si la inserción en `auth_users` falla, eliminar el usuario de `auth.users`
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw new Error(
      `Error al insertar en la tabla de usuarios: ${userError.message}`
    );
  }

  // Devolver un objeto compatible con el tipo AdminUser
  return {
    id: newUserId,
    email: adminData['email'] ?? '',
    name: adminData['name'] || '',
    surname: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    client_code: '',
    medical_conditions: [],
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Obtiene la lista de todos los usuarios administradores.
 * Utiliza el cliente de administrador para obtener acceso completo.
 *
 * @returns Una lista de usuarios administradores.
 */
export const getAdmins = async (): Promise<AdminUser[]> => {
  // Usar el cliente de administrador para listar todos los usuarios del proyecto
  const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`Error al obtener los administradores: ${error.message}`);
  }

  // Filtrar y mapear los usuarios que tienen el rol 'admin' en sus metadatos
  const admins = usersData.users
    .filter((user) => user.user_metadata?.['role'] === 'admin')
    .map((user) => ({
      id: user.id,
      email: user.email ?? '',
      name:
        (user.user_metadata?.['name'] as string | undefined) ??
        'Nombre no disponible',
      surname: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      client_code: '',
      medical_conditions: [],
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
      is_active: true,
      created_at: user.created_at,
      updated_at: user.updated_at ?? new Date().toISOString(),
    }));

  return admins;
};

/**
 * Resetea la contraseña de un administrador usando el cliente de administrador.
 * Utiliza privilegios de administrador para cambiar la contraseña directamente.
 *
 * @param userId - ID del usuario administrador
 * @param newPassword - Nueva contraseña
 * @returns Confirmación de éxito
 */
export const resetAdminPassword = async (
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw new Error(`Error al resetear contraseña: ${error.message}`);
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Elimina un administrador del sistema de forma segura.
 * Borra tanto de Supabase Auth como de la tabla auth_users.
 * Incluye validaciones para prevenir borrados accidentales.
 *
 * @param userId - ID del usuario administrador a eliminar
 * @param userEmail - Email del usuario para validación adicional
 * @returns Confirmación de éxito o error
 */
export const deleteAdmin = async (
  userId: string,
  userEmail: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validación de seguridad: No permitir borrar al super admin
    if (userEmail === 'conectomail@gmail.com') {
      return {
        success: false,
        message: 'No se puede eliminar al Super Administrador del sistema',
      };
    }

    // Validar que el usuario existe y es administrador
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (
      userError !== null ||
      userData.user === null ||
      userData.user === undefined
    ) {
      return {
        success: false,
        message: 'Usuario no encontrado en el sistema',
      };
    }

    // Verificar que es administrador
    const userRole = userData.user.user_metadata?.['role'] as
      | string
      | undefined;
    if (userRole !== 'admin') {
      return {
        success: false,
        message: 'Solo se pueden eliminar usuarios con rol de administrador',
      };
    }

    // Paso 1: Eliminar de la tabla auth_users
    const { error: dbError } = await supabaseAdmin
      .from('auth_users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      throw new Error(
        `Error al eliminar de la tabla auth_users: ${dbError.message}`
      );
    }

    // Paso 2: Eliminar de Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      // Si falla el borrado en Auth, intentar restaurar en auth_users
      // (Este es un caso edge, pero es buena práctica)
      await supabaseAdmin.from('auth_users').insert({
        id: userId,
        email: userEmail,
        role: 'admin',
      });

      throw new Error(
        `Error al eliminar de Supabase Auth: ${authError.message}`
      );
    }

    return {
      success: true,
      message: `Administrador ${userEmail} eliminado exitosamente`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Error desconocido al eliminar administrador',
    };
  }
};
