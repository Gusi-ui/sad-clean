// ============================================================================
// TIPOS PRINCIPALES - SAD LAS
// ============================================================================

// ============================================================================
// TIPOS DE AUTENTICACIÓN
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'worker';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  surname: string;
  role: 'admin' | 'worker';
}

// ============================================================================
// TIPOS DE TRABAJADOR
// ============================================================================

export interface Worker {
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
}

export interface CreateWorkerData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  dni: string;
  worker_type: Worker['worker_type'];
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  is_active?: boolean;
}

// ============================================================================
// TIPOS DE USUARIO/CLIENTE
// ============================================================================

export interface User {
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
}

export interface CreateUserData {
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
}

export interface UpdateUserData extends Partial<CreateUserData> {
  is_active?: boolean;
}

// ============================================================================
// TIPOS DE ASIGNACIÓN
// ============================================================================

export type AssignmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type AssignmentType = 'laborables' | 'festivos' | 'flexible';
export type AssignmentPriority = 1 | 2 | 3; // 1=Alta, 2=Media, 3=Baja

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  holiday: DaySchedule; // Para festivos entre semana
}

export interface Assignment {
  id: string;
  worker_id: string;
  user_id: string;
  assignment_type: AssignmentType;
  start_date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD (opcional para asignaciones indefinidas)
  weekly_hours: number;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  schedule: WeeklySchedule;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relaciones (populadas por Supabase)
  worker?: Worker;
  user?: User;
}

export interface CreateAssignmentData {
  worker_id: string;
  user_id: string;
  assignment_type: AssignmentType;
  start_date: string;
  end_date?: string;
  weekly_hours: number;
  priority: AssignmentPriority;
  schedule: WeeklySchedule;
  notes?: string;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  status?: AssignmentStatus;
}

// ============================================================================
// TIPOS DE FESTIVOS
// ============================================================================

export interface Holiday {
  id: string;
  year: number;
  month: number;
  day: number;
  name: string;
  type: 'national' | 'regional' | 'local';
  created_at: string;
  updated_at: string;
}

export interface CreateHolidayData {
  year: number;
  month: number;
  day: number;
  name: string;
  type: Holiday['type'];
}

// ============================================================================
// TIPOS DE PLANIFICACIÓN
// ============================================================================

export interface PlanningDay {
  date: string; // YYYY-MM-DD
  assignments: Assignment[];
  isHoliday: boolean;
  isWeekend: boolean;
}

export interface PlanningWeek {
  weekStart: string; // YYYY-MM-DD
  days: PlanningDay[];
}

export interface PlanningMonth {
  month: number;
  year: number;
  weeks: PlanningWeek[];
}

// ============================================================================
// TIPOS DE BALANCE DE HORAS
// ============================================================================

export interface HoursBalance {
  id: string;
  worker_id: string;
  year: number;
  month: number;
  total_hours: number;
  worked_hours: number;
  holiday_hours: number;
  balance: number; // worked_hours - total_hours
  created_at: string;
  updated_at: string;

  // Relaciones
  worker?: Worker;
}

// ============================================================================
// TIPOS DE API RESPONSE
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  error: string | null;
}

// ============================================================================
// TIPOS DE FILTROS
// ============================================================================

export interface AssignmentFilters {
  worker_id?: string;
  user_id?: string;
  status?: AssignmentStatus;
  assignment_type?: AssignmentType;
  date_from?: string;
  date_to?: string;
}

export interface WorkerFilters {
  worker_type?: Worker['worker_type'];
  is_active?: boolean;
  search?: string;
}

export interface UserFilters {
  is_active?: boolean;
  search?: string;
  city?: string;
}

// ============================================================================
// TIPOS DE ESTADÍSTICAS
// ============================================================================

export interface DashboardStats {
  total_workers: number;
  active_workers: number;
  total_users: number;
  active_users: number;
  total_assignments: number;
  active_assignments: number;
  paused_assignments: number;
  completed_assignments: number;
  total_hours_this_month: number;
  total_hours_last_month: number;
}

export interface WorkerStats {
  total_assignments: number;
  active_assignments: number;
  total_hours: number;
  worked_hours: number;
  balance: number;
}

// ============================================================================
// TIPOS DE FORMULARIOS
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitText: string;
  cancelText?: string;
}

// ============================================================================
// TIPOS DE NOTIFICACIONES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}
