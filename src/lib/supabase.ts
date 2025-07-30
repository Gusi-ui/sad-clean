// ============================================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================================
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// VARIABLES DE ENTORNO
// ============================================================================

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// ============================================================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ============================================================================

if (supabaseUrl === null || supabaseUrl === undefined) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (supabaseAnonKey === null || supabaseAnonKey === undefined) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// ============================================================================
// CLIENTE DE SUPABASE
// ============================================================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'sad-las-app',
    },
  },
});

// ============================================================================
// CLIENTE DE SUPABASE PARA SERVER-SIDE
// ============================================================================

export const createServerSupabaseClient = () => {
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (supabaseServiceKey === null || supabaseServiceKey === undefined) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// ============================================================================
// UTILIDADES DE SUPABASE
// ============================================================================

export const getSupabaseClient = () => supabase;

export const getSupabaseAuth = () => supabase.auth;

export const getSupabaseStorage = () => supabase.storage;

// ============================================================================
// TIPOS DE BASE DE DATOS (GENERADOS AUTOMÁTICAMENTE)
// ============================================================================

// Este archivo se genera automáticamente con:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// Por ahora usamos una interfaz básica
export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'worker';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'worker';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'worker';
          created_at?: string;
          updated_at?: string;
        };
      };
      workers: {
        Row: {
          id: string;
          name: string;
          surname: string;
          email: string;
          phone: string;
          dni: string;
          worker_type: 'cuidadora' | 'auxiliar' | 'enfermera';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          surname: string;
          email: string;
          phone: string;
          dni: string;
          worker_type: 'cuidadora' | 'auxiliar' | 'enfermera';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          surname?: string;
          email?: string;
          phone?: string;
          dni?: string;
          worker_type?: 'cuidadora' | 'auxiliar' | 'enfermera';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          surname: string;
          email?: string;
          phone: string;
          address: string;
          postal_code: string;
          city: string;
          client_code: string;
          medical_conditions: string[];
          emergency_contact: {
            name: string;
            phone: string;
            relationship: string;
          };
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          surname: string;
          email?: string;
          phone: string;
          address: string;
          postal_code: string;
          city: string;
          client_code: string;
          medical_conditions: string[];
          emergency_contact: {
            name: string;
            phone: string;
            relationship: string;
          };
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          surname?: string;
          email?: string;
          phone?: string;
          address?: string;
          postal_code?: string;
          city?: string;
          client_code?: string;
          medical_conditions?: string[];
          emergency_contact?: {
            name: string;
            phone: string;
            relationship: string;
          };
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          worker_id: string;
          user_id: string;
          assignment_type: 'laborables' | 'festivos' | 'flexible';
          start_date: string;
          end_date?: string;
          weekly_hours: number;
          status: 'active' | 'paused' | 'completed' | 'cancelled';
          priority: 1 | 2 | 3;
          schedule: {
            monday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            tuesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            wednesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            thursday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            friday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            saturday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            sunday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            holiday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
          };
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          user_id: string;
          assignment_type: 'laborables' | 'festivos' | 'flexible';
          start_date: string;
          end_date?: string;
          weekly_hours: number;
          status?: 'active' | 'paused' | 'completed' | 'cancelled';
          priority: 1 | 2 | 3;
          schedule: {
            monday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            tuesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            wednesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            thursday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            friday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            saturday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            sunday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            holiday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
          };
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          user_id?: string;
          assignment_type?: 'laborables' | 'festivos' | 'flexible';
          start_date?: string;
          end_date?: string;
          weekly_hours?: number;
          status?: 'active' | 'paused' | 'completed' | 'cancelled';
          priority?: 1 | 2 | 3;
          schedule?: {
            monday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            tuesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            wednesday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            thursday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            friday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            saturday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            sunday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
            holiday: {
              enabled: boolean;
              timeSlots: { start: string; end: string }[];
            };
          };
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      holidays: {
        Row: {
          id: string;
          year: number;
          month: number;
          day: number;
          name: string;
          type: 'national' | 'regional' | 'local';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          month: number;
          day: number;
          name: string;
          type: 'national' | 'regional' | 'local';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          month?: number;
          day?: number;
          name?: string;
          type?: 'national' | 'regional' | 'local';
          created_at?: string;
          updated_at?: string;
        };
      };
      hours_balances: {
        Row: {
          id: string;
          worker_id: string;
          year: number;
          month: number;
          total_hours: number;
          worked_hours: number;
          holiday_hours: number;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          year: number;
          month: number;
          total_hours: number;
          worked_hours: number;
          holiday_hours: number;
          balance: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          year?: number;
          month?: number;
          total_hours?: number;
          worked_hours?: number;
          holiday_hours?: number;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export { supabase as default };
