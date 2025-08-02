// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

// src/lib/supabase-admin.ts

// ¡ATENCIÓN! Este cliente utiliza la service_role key y DEBE usarse solo en el servidor.
// Tiene permisos para saltarse las políticas de RLS.
// Asegúrate de que las variables de entorno estén configuradas en tu Vercel/servidor.

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (supabaseUrl === undefined || supabaseUrl === null || supabaseUrl === '') {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (
  supabaseServiceRoleKey === undefined ||
  supabaseServiceRoleKey === null ||
  supabaseServiceRoleKey === ''
) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
