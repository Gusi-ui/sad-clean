/**
 * Configuración de seguridad para el proyecto SAD LAS
 * Centraliza configuraciones sensibles y manejo de logs
 */

// Configuración de entorno
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger seguro que no expone información sensible en producción
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private readonly isDev = isDevelopment;

  private constructor() {
    // Constructor privado para singleton pattern
  }

  static getInstance(): SecurityLogger {
    SecurityLogger.instance ??= new SecurityLogger();
    return SecurityLogger.instance;
  }

  /**
   * Log seguro para errores
   */
  error(message: string, error?: unknown): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.error(`[SECURITY] ${message}`, error);
    } else {
      // En producción, solo logear mensajes genéricos
      // eslint-disable-next-line no-console
      console.error(`[SECURITY] ${message}`);
    }
  }

  /**
   * Log seguro para información
   */
  info(message: string, data?: unknown): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, data);
    }
    // En producción, no logear información sensible
  }

  /**
   * Log seguro para warnings
   */
  warn(message: string, data?: unknown): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[WARNING] ${message}`, data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[WARNING] ${message}`);
    }
  }

  /**
   * Log seguro para debug (solo en desarrollo)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data);
    }
    // En producción, nunca logear debug
  }
}

// Instancia singleton del logger
export const securityLogger = SecurityLogger.getInstance();

/**
 * Configuración de seguridad para APIs
 */
export const securityConfig = {
  // Headers de seguridad para fetch requests
  secureHeaders: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Agregar más headers de seguridad según sea necesario
  },

  // Configuración de CORS
  corsConfig: {
    credentials: 'include' as const,
    mode: 'cors' as const,
  },

  // Timeouts para requests
  timeouts: {
    default: 10000, // 10 segundos
    auth: 15000, // 15 segundos para autenticación
    upload: 30000, // 30 segundos para uploads
  },

  // Configuración de reintentos
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
  },
};

/**
 * Validación de entrada segura
 */
export class InputValidator {
  /**
   * Sanitiza strings para prevenir XSS
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }

  /**
   * Valida email de forma segura
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Valida contraseña de forma segura
   */
  static isValidPassword(password: string): boolean {
    return password.length >= 8 && password.length <= 128;
  }

  /**
   * Valida URL de forma segura
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}

/**
 * Configuración de Google Maps API
 */
export const googleMapsConfig = {
  // API Key debe estar en variables de entorno
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',

  // Configuración de seguridad para Google Maps
  securityOptions: {
    // Restringir dominio en Google Cloud Console
    allowedDomains: ['localhost', 'sad-las.com'], // Agregar tu dominio
  },
};

/**
 * Verifica que las configuraciones de seguridad estén correctas
 */
export const validateSecurityConfig = (): void => {
  const errors: string[] = [];

  // Verificar API key de Google Maps
  if (
    (googleMapsConfig.apiKey === null || googleMapsConfig.apiKey === '') &&
    isProduction
  ) {
    errors.push('Google Maps API key no configurada en producción');
  }

  // Verificar variables de entorno críticas
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL === null ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === undefined ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === ''
  ) {
    errors.push('Supabase URL no configurada');
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === null ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === ''
  ) {
    errors.push('Supabase Anon Key no configurada');
  }

  if (errors.length > 0) {
    securityLogger.error('Configuración de seguridad incompleta:', errors);
    throw new Error(
      `Configuración de seguridad incompleta: ${errors.join(', ')}`
    );
  }
};
