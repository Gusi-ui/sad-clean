export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: {
          id: string;
          user_id: string;
          worker_id: string;
          assignment_type: string;
          start_date: string;
          end_date: string | null;
          status: string;
          weekly_hours: number;
          priority: number;
          schedule: Json;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          worker_id: string;
          assignment_type: string;
          start_date: string;
          end_date?: string | null;
          status?: string;
          weekly_hours?: number;
          priority?: number;
          schedule?: Json;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          worker_id?: string;
          assignment_type?: string;
          start_date?: string;
          end_date?: string | null;
          status?: string;
          weekly_hours?: number;
          priority?: number;
          schedule?: Json;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          surname: string;
          phone: string;
          address: string;
          postal_code: string;
          city: string;
          client_code: string;
          monthly_assigned_hours: number | null;
          is_active: boolean | null;
          medical_conditions: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          surname: string;
          phone: string;
          address: string;
          postal_code: string;
          city: string;
          client_code: string;
          monthly_assigned_hours?: number | null;
          is_active?: boolean | null;
          medical_conditions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          surname?: string;
          phone?: string;
          address?: string;
          postal_code?: string;
          city?: string;
          client_code?: string;
          monthly_assigned_hours?: number | null;
          is_active?: boolean | null;
          medical_conditions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      workers: {
        Row: {
          id: string;
          email: string;
          name: string;
          surname: string;
          phone: string;
          dni: string;
          worker_type: string;
          role: string;
          is_active: boolean | null;
          monthly_contracted_hours: number;
          weekly_contracted_hours: number;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          surname: string;
          phone: string;
          dni: string;
          worker_type: string;
          role?: string;
          is_active?: boolean | null;
          monthly_contracted_hours?: number;
          weekly_contracted_hours?: number;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          surname?: string;
          phone?: string;
          dni?: string;
          worker_type?: string;
          role?: string;
          is_active?: boolean | null;
          monthly_contracted_hours?: number;
          weekly_contracted_hours?: number;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      worker_notifications: {
        Row: {
          id: string;
          worker_id: string;
          title: string;
          body: string;
          type: string;
          data: Json | null;
          read_at: string | null;
          sent_at: string;
          expires_at: string | null;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          title: string;
          body: string;
          type: string;
          data?: Json | null;
          read_at?: string | null;
          sent_at?: string;
          expires_at?: string | null;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          title?: string;
          body?: string;
          type?: string;
          data?: Json | null;
          read_at?: string | null;
          sent_at?: string;
          expires_at?: string | null;
          priority?: string;
          created_at?: string;
        };
      };
      worker_devices: {
        Row: {
          id: string;
          worker_id: string;
          device_id: string;
          device_name: string | null;
          platform: string;
          app_version: string | null;
          os_version: string | null;
          push_token: string | null;
          authorized: boolean;
          last_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          device_id: string;
          device_name?: string | null;
          platform: string;
          app_version?: string | null;
          os_version?: string | null;
          push_token?: string | null;
          authorized?: boolean;
          last_used?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          device_id?: string;
          device_name?: string | null;
          platform?: string;
          app_version?: string | null;
          os_version?: string | null;
          push_token?: string | null;
          authorized?: boolean;
          last_used?: string;
          created_at?: string;
        };
      };
      worker_notification_settings: {
        Row: {
          id: string;
          worker_id: string;
          push_enabled: boolean;
          sound_enabled: boolean;
          vibration_enabled: boolean;
          new_user_notifications: boolean;
          schedule_change_notifications: boolean;
          assignment_change_notifications: boolean;
          route_update_notifications: boolean;
          reminder_notifications: boolean;
          urgent_notifications: boolean;
          holiday_update_notifications: boolean;
          system_notifications: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          push_enabled?: boolean;
          sound_enabled?: boolean;
          vibration_enabled?: boolean;
          new_user_notifications?: boolean;
          schedule_change_notifications?: boolean;
          assignment_change_notifications?: boolean;
          route_update_notifications?: boolean;
          reminder_notifications?: boolean;
          urgent_notifications?: boolean;
          holiday_update_notifications?: boolean;
          system_notifications?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          push_enabled?: boolean;
          sound_enabled?: boolean;
          vibration_enabled?: boolean;
          new_user_notifications?: boolean;
          schedule_change_notifications?: boolean;
          assignment_change_notifications?: boolean;
          route_update_notifications?: boolean;
          reminder_notifications?: boolean;
          urgent_notifications?: boolean;
          holiday_update_notifications?: boolean;
          system_notifications?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hours_balances: {
        Row: {
          id: string;
          worker_id: string;
          month: string;
          year: number;
          contracted_hours: number;
          worked_hours: number;
          balance: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          worker_id: string;
          month: string;
          year?: number;
          contracted_hours?: number;
          worked_hours?: number;
          balance?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          worker_id?: string;
          month?: string;
          year?: number;
          contracted_hours?: number;
          worked_hours?: number;
          balance?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          type: string;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          type?: string;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          name?: string;
          type?: string;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      auth_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos helper para compatibilidad
export type WorkerNotification =
  Database["public"]["Tables"]["worker_notifications"]["Row"];
export type WorkerNotificationInsert =
  Database["public"]["Tables"]["worker_notifications"]["Insert"];
export type WorkerNotificationUpdate =
  Database["public"]["Tables"]["worker_notifications"]["Update"];

export type WorkerNotificationSettings =
  Database["public"]["Tables"]["worker_notification_settings"]["Row"];
export type WorkerNotificationSettingsInsert =
  Database["public"]["Tables"]["worker_notification_settings"]["Insert"];
export type WorkerNotificationSettingsUpdate =
  Database["public"]["Tables"]["worker_notification_settings"]["Update"];

export type WorkerDevice =
  Database["public"]["Tables"]["worker_devices"]["Row"];
export type WorkerDeviceInsert =
  Database["public"]["Tables"]["worker_devices"]["Insert"];
export type WorkerDeviceUpdate =
  Database["public"]["Tables"]["worker_devices"]["Update"];

// Tipos adicionales para compatibilidad
export type Worker = Database["public"]["Tables"]["workers"]["Row"];
export type WorkerInsert = Database["public"]["Tables"]["workers"]["Insert"];
export type WorkerUpdate = Database["public"]["Tables"]["workers"]["Update"];

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type AssignmentInsert =
  Database["public"]["Tables"]["assignments"]["Insert"];
export type AssignmentUpdate =
  Database["public"]["Tables"]["assignments"]["Update"];

export type HoursBalance =
  Database["public"]["Tables"]["hours_balances"]["Row"];
export type HoursBalanceInsert =
  Database["public"]["Tables"]["hours_balances"]["Insert"];
export type HoursBalanceUpdate =
  Database["public"]["Tables"]["hours_balances"]["Update"];

export type Holiday = Database["public"]["Tables"]["holidays"]["Row"];
export type HolidayInsert = Database["public"]["Tables"]["holidays"]["Insert"];
export type HolidayUpdate = Database["public"]["Tables"]["holidays"]["Update"];
