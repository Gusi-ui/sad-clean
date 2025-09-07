#!/usr/bin/env node
/**
 * Script para generar tipos de TypeScript desde Supabase
 * Ejecutar con: node generate-supabase-types.js
 */
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
    console.log(
      '⚠️  Asegúrate de que el archivo .env.local existe con las variables SUPABASE_URL y SUPABASE_ANON_KEY'
    );
    return {};
  }
}

async function generateTypes() {
  const envVars = loadEnvFile();

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno faltantes:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('');
    console.log('💡 Solución: Crea el archivo .env.local con estas variables');
    return;
  }

  try {
    console.log(
      '🔧 Generando tipos de TypeScript con tabla worker_notification_settings...'
    );

    // Generar tipos básicos con la tabla worker_notification_settings
    const typesContent = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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

    // Escribir el archivo
    const typesPath = join(__dirname, 'src', 'types', 'supabase-updated.ts');
    writeFileSync(typesPath, typesContent);

    console.log('✅ Tipos de TypeScript generados exitosamente');
    console.log(`📁 Archivo guardado en: ${typesPath}`);
    console.log('');
    console.log('🔄 Próximos pasos:');
    console.log(
      '1. Reemplaza el contenido de src/types/supabase.ts con el contenido de supabase-updated.ts'
    );
    console.log('2. Reinicia el servidor de desarrollo (npm run dev)');
    console.log('3. Los errores de TypeScript deberían desaparecer');
  } catch (error) {
    console.error('❌ Error al generar tipos:', error);
  }
}

generateTypes().catch(console.error);
