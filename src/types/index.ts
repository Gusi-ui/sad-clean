/**
 * Tipos TypeScript para la aplicación SAD gusi
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
  address: string | null;
  postal_code: string | null;
  city: string | null;
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
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
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
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
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
  monthly_assigned_hours: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  medical_conditions: string[] | null;
}

// Assignment Types (basado en el esquema de Supabase)
export interface Assignment {
  id: string;
  user_id: string;
  worker_id: string;
  assignment_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  weekly_hours: number;
  priority: number;
  schedule: Record<string, unknown>;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  user?: { name: string | null; surname: string | null };
  worker?: { name: string | null; surname: string | null };
}

export interface AssignmentInsert {
  id?: string;
  user_id: string;
  worker_id: string;
  assignment_type: string;
  start_date: string;
  end_date?: string | null;
  status?: string;
  weekly_hours?: number;
  priority?: number;
  schedule?: Record<string, unknown>;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AssignmentUpdate {
  id?: string;
  user_id?: string;
  worker_id?: string;
  assignment_type?: string;
  start_date?: string;
  end_date?: string | null;
  status?: string;
  weekly_hours?: number;
  priority?: number;
  schedule?: Record<string, unknown>;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Assignment Row Types for queries with joined data
export interface AssignmentRow {
  id: string;
  user_id: string;
  worker_id: string;
  assignment_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  weekly_hours: number;
  priority: number;
  schedule: Record<string, unknown>;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  users: {
    name: string | null;
    surname: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
  };
  workers: {
    name: string | null;
    surname: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
  };
}

// Assignment Detail Row for detailed queries
export interface AssignmentDetailRow {
  id: string;
  assignment_type: string;
  schedule: Record<string, unknown>;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  users: UserDetail[];
}

// User Detail for assignment details
export interface UserDetail {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  phone: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  client_code: string;
  medical_conditions: string[] | null;
  emergency_contact: string | null;
  is_active: boolean | null;
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
  monthly_assigned_hours?: number | null;
  is_active?: boolean | null;
  medical_conditions?: string[] | null;
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
  monthly_assigned_hours?: number | null;
  is_active?: boolean | null;
  medical_conditions?: string[] | null;
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

// Notification Types
export type NotificationType =
  | 'new_user' // Nuevo usuario asignado
  | 'user_removed' // Usuario eliminado
  | 'schedule_change' // Cambio de horario
  | 'assignment_change' // Cambio en asignación
  | 'route_update' // Actualización de ruta
  | 'system_message' // Mensaje del sistema
  | 'reminder' // Recordatorio
  | 'urgent' // Notificación urgente
  | 'holiday_update'; // Actualización de festivos

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkerNotification {
  id: string;
  worker_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  read_at?: string | null;
  sent_at: string;
  expires_at?: string | null;
  priority: NotificationPriority;
  created_at: string;
}

export interface WorkerNotificationInsert {
  worker_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  expires_at?: string | null;
  priority?: NotificationPriority;
}

export interface NotificationSettings {
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
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  sound?: string;
  vibrate?: number[];
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// WebSocket Types para notificaciones en tiempo real
export interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong' | 'error';
  data?: unknown;
}

export interface NotificationWebSocketMessage extends WebSocketMessage {
  type: 'notification';
  data: WorkerNotification;
}
