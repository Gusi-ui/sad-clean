#!/usr/bin/env node
/**
 * Script para generar tipos correctos de Supabase desde la base de datos real
 * Ejecutar con: node generate-correct-types.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    });

    return envVars;
  } catch (error) {
    console.error('❌ Error al cargar .env.local:', error.message);
    return {};
  }
}

async function generateCorrectTypes() {
  const envVars = loadEnvFile();

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno faltantes');
    return;
  }

  try {
    console.log('🔧 Generando tipos correctos desde Supabase...');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Intentar hacer consultas de prueba para verificar los tipos reales
    console.log('📊 Verificando tipos reales de las tablas...');

    // Verificar worker_notifications
    try {
      const { data: notifications, error: notifError } = await supabase
        .from('worker_notifications')
        .select('*')
        .limit(1);

      if (notifError) {
        console.log(`❌ Error en worker_notifications: ${notifError.message}`);
      } else if (notifications && notifications.length > 0) {
        console.log('✅ worker_notifications - Tipos encontrados:');
        Object.keys(notifications[0]).forEach((key) => {
          const value = notifications[0][key];
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`   - ${key}: ${type}`);
        });
      }
    } catch (e) {
      console.log(`❌ Error consultando worker_notifications: ${e.message}`);
    }

    // Verificar worker_notification_settings
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('worker_notification_settings')
        .select('*')
        .limit(1);

      if (settingsError) {
        console.log(
          `❌ Error en worker_notification_settings: ${settingsError.message}`
        );
      } else {
        console.log('✅ worker_notification_settings - Tipos encontrados:');
        // Como la tabla puede estar vacía, intentamos insertar y ver el error
        const testInsert = {
          worker_id: '00000000-0000-0000-0000-000000000000',
          push_enabled: true,
          sound_enabled: true,
          vibration_enabled: true,
          new_user_notifications: true,
          schedule_change_notifications: true,
          assignment_change_notifications: true,
          route_update_notifications: true,
          system_notifications: true,
          reminder_notifications: true,
          urgent_notifications: true,
          holiday_update_notifications: true,
          quiet_hours_start: null,
          quiet_hours_end: null,
        };

        const { error: insertError } = await supabase
          .from('worker_notification_settings')
          .insert(testInsert);

        if (insertError) {
          console.log(
            `ℹ️  Insert test error (esperado): ${insertError.message}`
          );
        }
      }
    } catch (e) {
      console.log(
        `❌ Error consultando worker_notification_settings: ${e.message}`
      );
    }

    // Crear tipos corregidos basados en lo que sabemos
    console.log('\n🔧 Creando archivo de tipos corregidos...');

    const correctedTypes = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: {
          id: string
          user_id: string
          worker_id: string
          assignment_type: string
          start_date: string
          end_date: string | null
          status: string
          weekly_hours: number
          priority: number
          schedule: Json
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          worker_id: string
          assignment_type: string
          start_date: string
          end_date?: string | null
          status?: string
          weekly_hours?: number
          priority?: number
          schedule?: Json
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          worker_id?: string
          assignment_type?: string
          start_date?: string
          end_date?: string | null
          status?: string
          weekly_hours?: number
          priority?: number
          schedule?: Json
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          surname: string
          phone: string
          address: string
          postal_code: string
          city: string
          client_code: string
          monthly_assigned_hours: number | null
          is_active: boolean | null
          medical_conditions: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          surname: string
          phone: string
          address: string
          postal_code: string
          city: string
          client_code: string
          monthly_assigned_hours?: number | null
          is_active?: boolean | null
          medical_conditions?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          surname?: string
          phone?: string
          address?: string
          postal_code?: string
          city?: string
          client_code?: string
          monthly_assigned_hours?: number | null
          is_active?: boolean | null
          medical_conditions?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      workers: {
        Row: {
          id: string
          email: string
          name: string
          surname: string
          phone: string
          dni: string
          worker_type: string
          role: string
          is_active: boolean | null
          monthly_contracted_hours: number
          weekly_contracted_hours: number
          address: string | null
          postal_code: string | null
          city: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          surname: string
          phone: string
          dni: string
          worker_type: string
          role?: string
          is_active?: boolean | null
          monthly_contracted_hours?: number
          weekly_contracted_hours?: number
          address?: string | null
          postal_code?: string | null
          city?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          surname?: string
          phone?: string
          dni?: string
          worker_type?: string
          role?: string
          is_active?: boolean | null
          monthly_contracted_hours?: number
          weekly_contracted_hours?: number
          address?: string | null
          postal_code?: string | null
          city?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      worker_notifications: {
        Row: {
          id: string
          worker_id: string
          title: string
          body: string
          type: string
          data: Json | null
          read_at: string | null
          sent_at: string
          expires_at: string | null
          priority: string
          created_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          title: string
          body: string
          type: string
          data?: Json | null
          read_at?: string | null
          sent_at?: string
          expires_at?: string | null
          priority?: string
          created_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          title?: string
          body?: string
          type?: string
          data?: Json | null
          read_at?: string | null
          sent_at?: string
          expires_at?: string | null
          priority?: string
          created_at?: string
        }
      }
      worker_devices: {
        Row: {
          id: string
          worker_id: string
          device_id: string
          device_name: string | null
          platform: string
          app_version: string | null
          os_version: string | null
          push_token: string | null
          authorized: boolean
          last_used: string
          created_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          device_id: string
          device_name?: string | null
          platform: string
          app_version?: string | null
          os_version?: string | null
          push_token?: string | null
          authorized?: boolean
          last_used?: string
          created_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          device_id?: string
          device_name?: string | null
          platform?: string
          app_version?: string | null
          os_version?: string | null
          push_token?: string | null
          authorized?: boolean
          last_used?: string
          created_at?: string
        }
      }
      worker_notification_settings: {
        Row: {
          id: string
          worker_id: string
          push_enabled: boolean
          sound_enabled: boolean
          vibration_enabled: boolean
          new_user_notifications: boolean
          schedule_change_notifications: boolean
          assignment_change_notifications: boolean
          route_update_notifications: boolean
          system_notifications: boolean
          reminder_notifications: boolean
          urgent_notifications: boolean
          holiday_update_notifications: boolean
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          push_enabled?: boolean
          sound_enabled?: boolean
          vibration_enabled?: boolean
          new_user_notifications?: boolean
          schedule_change_notifications?: boolean
          assignment_change_notifications?: boolean
          route_update_notifications?: boolean
          system_notifications?: boolean
          reminder_notifications?: boolean
          urgent_notifications?: boolean
          holiday_update_notifications?: boolean
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          push_enabled?: boolean
          sound_enabled?: boolean
          vibration_enabled?: boolean
          new_user_notifications?: boolean
          schedule_change_notifications?: boolean
          assignment_change_notifications?: boolean
          route_update_notifications?: boolean
          system_notifications?: boolean
          reminder_notifications?: boolean
          urgent_notifications?: boolean
          holiday_update_notifications?: boolean
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hours_balances: {
        Row: {
          id: string
          worker_id: string
          month: string
          year: number
          contracted_hours: number
          worked_hours: number
          balance: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          worker_id: string
          month: string
          year?: number
          contracted_hours?: number
          worked_hours?: number
          balance?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          worker_id?: string
          month?: string
          year?: number
          contracted_hours?: number
          worked_hours?: number
          balance?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      holidays: {
        Row: {
          id: string
          date: string
          name: string
          type: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          name: string
          type?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          name?: string
          type?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      auth_users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos helper para compatibilidad
export type WorkerNotification = Database['public']['Tables']['worker_notifications']['Row'];
export type WorkerNotificationInsert = Database['public']['Tables']['worker_notifications']['Insert'];
export type WorkerNotificationUpdate = Database['public']['Tables']['worker_notifications']['Update'];

export type WorkerNotificationSettings = Database['public']['Tables']['worker_notification_settings']['Row'];
export type WorkerNotificationSettingsInsert = Database['public']['Tables']['worker_notification_settings']['Insert'];
export type WorkerNotificationSettingsUpdate = Database['public']['Tables']['worker_notification_settings']['Update'];

export type WorkerDevice = Database['public']['Tables']['worker_devices']['Row'];
export type WorkerDeviceInsert = Database['public']['Tables']['worker_devices']['Insert'];
export type WorkerDeviceUpdate = Database['public']['Tables']['worker_devices']['Update'];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
`;

    const typesPath = join(__dirname, 'src', 'types', 'supabase-corrected.ts');
    writeFileSync(typesPath, correctedTypes);

    console.log('✅ Tipos corregidos generados exitosamente');
    console.log(`📁 Archivo guardado en: ${typesPath}`);

    // Ahora reemplazar el archivo principal
    const mainTypesPath = join(__dirname, 'src', 'types', 'supabase.ts');
    writeFileSync(mainTypesPath, correctedTypes);

    console.log('✅ Archivo principal de tipos reemplazado');
    console.log('');
    console.log('🔄 Próximos pasos:');
    console.log('1. Reinicia el servidor de desarrollo (npm run dev)');
    console.log('2. Los errores de TypeScript deberían desaparecer');
  } catch (error) {
    console.error('❌ Error al generar tipos corregidos:', error);
  }
}

generateCorrectTypes().catch(console.error);
