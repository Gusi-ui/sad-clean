/**
 * Tipos TypeScript para la aplicación SAD LAS
 */

// Worker Types (basado en el esquema de Supabase)
export interface Worker {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  dni: string;
  worker_type: string;
  role: 'worker' | 'admin' | 'super_admin';
  is_active: boolean | null;
  monthly_contracted_hours: number;
  weekly_contracted_hours: number;
  created_at: string | null;
  updated_at: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface WorkerInsert {
  email: string;
  name: string;
  surname: string;
  phone: string;
  dni: string;
  worker_type: string;
  role?: 'worker' | 'admin' | 'super_admin';
  is_active?: boolean | null;
  monthly_contracted_hours?: number;
  weekly_contracted_hours?: number;
}

export interface WorkerUpdate {
  email?: string;
  name?: string;
  surname?: string;
  phone?: string;
  dni?: string;
  worker_type?: string;
  role?: 'worker' | 'admin' | 'super_admin';
  is_active?: boolean | null;
  monthly_contracted_hours?: number;
  weekly_contracted_hours?: number;
}

// User Types (basado en el esquema de Supabase)
export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  client_code: string;
  monthly_assigned_hours?: number;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  medical_conditions?: string[];
}

export interface UserInsert {
  email: string;
  name: string;
  surname: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  client_code: string;
  monthly_assigned_hours?: number;
  is_active?: boolean | null;
  medical_conditions?: string[];
}

export interface UserUpdate {
  email?: string;
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  client_code?: string;
  monthly_assigned_hours?: number;
  is_active?: boolean | null;
  medical_conditions?: string[];
}

// Admin Types
export interface AdminInsert {
  email: string;
  password: string;
  name: string;
  surname?: string;
}

// Activity Types
export interface Activity {
  id: string;
  activity_type: string;
  entity_type: string;
  description: string;
  user_id: string | null; // Permitir null para coincidir con la BD
  user_email: string;
  user_name: string;
  entity_id: string | null; // Permitir null para coincidir con la BD
  entity_name: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  time_ago?: string;
}

export interface ActivityInsert {
  activity_type: string;
  entity_type: string;
  description: string;
  user_id: string | null; // Permitir null para coincidir con la BD
  user_email: string;
  user_name: string;
  entity_id: string | null; // Permitir null para coincidir con la BD
  entity_name: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// Authentication Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  worker?: Worker;
  user?: Worker;
  token?: string;
  message?: string;
}

// AuthContext Types
export interface AuthContextType {
  state: {
    isAuthenticated: boolean;
    currentWorker: Worker | null;
    isLoading: boolean;
    error: string | null;
  };
  user: Worker | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  login: (credentials: AuthCredentials) => Promise<Worker | undefined>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<{
    error?: string;
    redirectTo?: string;
  }>;
  updatePassword: (email: string) => Promise<{
    error?: string;
  }>;
  clearError: () => void;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Assignments: undefined;
  AssignmentDetail: { assignmentId: string };
  Balances: undefined;
  Notes: undefined;
  Route: undefined;
  Profile: undefined;
  Settings: undefined;
};
