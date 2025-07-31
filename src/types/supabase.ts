export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.12 (cd3cf9e)';
  };
  public: {
    Tables: {
      assignments: {
        Row: {
          assignment_type: string;
          created_at: string | null;
          end_date: string | null;
          id: string;
          notes: string | null;
          priority: number;
          schedule: Json;
          start_date: string;
          status: string;
          updated_at: string | null;
          user_id: string;
          weekly_hours: number;
          worker_id: string;
        };
        Insert: {
          assignment_type: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          priority?: number;
          schedule?: Json;
          start_date: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
          weekly_hours: number;
          worker_id: string;
        };
        Update: {
          assignment_type?: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          priority?: number;
          schedule?: Json;
          start_date?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
          weekly_hours?: number;
          worker_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assignments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assignments_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          },
        ];
      };
      auth_users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      holidays: {
        Row: {
          created_at: string | null;
          day: number;
          id: string;
          month: number;
          name: string;
          type: string;
          updated_at: string | null;
          year: number;
        };
        Insert: {
          created_at?: string | null;
          day: number;
          id?: string;
          month: number;
          name: string;
          type: string;
          updated_at?: string | null;
          year: number;
        };
        Update: {
          created_at?: string | null;
          day?: number;
          id?: string;
          month?: number;
          name?: string;
          type?: string;
          updated_at?: string | null;
          year?: number;
        };
        Relationships: [];
      };
      hours_balances: {
        Row: {
          balance: number | null;
          created_at: string | null;
          holiday_hours: number;
          id: string;
          month: number;
          total_hours: number;
          updated_at: string | null;
          worked_hours: number;
          worker_id: string;
          year: number;
        };
        Insert: {
          balance?: number | null;
          created_at?: string | null;
          holiday_hours?: number;
          id?: string;
          month: number;
          total_hours?: number;
          updated_at?: string | null;
          worked_hours?: number;
          worker_id: string;
          year: number;
        };
        Update: {
          balance?: number | null;
          created_at?: string | null;
          holiday_hours?: number;
          id?: string;
          month?: number;
          total_hours?: number;
          updated_at?: string | null;
          worked_hours?: number;
          worker_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'hours_balances_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          address: string;
          city: string;
          client_code: string;
          created_at: string | null;
          email: string | null;
          emergency_contact: Json;
          id: string;
          is_active: boolean | null;
          medical_conditions: string[] | null;
          name: string;
          phone: string;
          postal_code: string;
          surname: string;
          updated_at: string | null;
        };
        Insert: {
          address: string;
          city: string;
          client_code: string;
          created_at?: string | null;
          email?: string | null;
          emergency_contact?: Json;
          id?: string;
          is_active?: boolean | null;
          medical_conditions?: string[] | null;
          name: string;
          phone: string;
          postal_code: string;
          surname: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string;
          city?: string;
          client_code?: string;
          created_at?: string | null;
          email?: string | null;
          emergency_contact?: Json;
          id?: string;
          is_active?: boolean | null;
          medical_conditions?: string[] | null;
          name?: string;
          phone?: string;
          postal_code?: string;
          surname?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      workers: {
        Row: {
          created_at: string | null;
          dni: string;
          email: string;
          id: string;
          is_active: boolean | null;
          name: string;
          phone: string;
          surname: string;
          updated_at: string | null;
          worker_type: string;
        };
        Insert: {
          created_at?: string | null;
          dni: string;
          email: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          phone: string;
          surname: string;
          updated_at?: string | null;
          worker_type: string;
        };
        Update: {
          created_at?: string | null;
          dni?: string;
          email?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          phone?: string;
          surname?: string;
          updated_at?: string | null;
          worker_type?: string;
        };
        Relationships: [];
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
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
