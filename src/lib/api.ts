/**
 * API Client para conectar con el proyecto web SAD LAS
 */
import { securityConfig, securityLogger } from '@/utils/security-config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          ...securityConfig.secureHeaders,
          ...options.headers,
        },
        ...securityConfig.corsConfig,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as T;
      return { data };
    } catch (error) {
      securityLogger.error('API request failed', error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Workers API
  async getWorkers(): Promise<ApiResponse<unknown>> {
    const result = await this.request<unknown>('/api/workers');
    return result;
  }

  async authenticateWorker(
    email: string,
    password: string
  ): Promise<ApiResponse<unknown>> {
    const result = await this.request<unknown>('/api/workers/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return result;
  }

  // Assignments API
  async getAssignments(workerId?: string): Promise<ApiResponse<unknown>> {
    const endpoint =
      workerId !== undefined && workerId !== ''
        ? `/api/assignments?workerId=${workerId}`
        : '/api/assignments';
    const result = await this.request<unknown>(endpoint);
    return result;
  }
}

export const apiClient = new ApiClient();

// Exportar métodos como funciones independientes
export const getWorkers = (): Promise<ApiResponse<unknown>> =>
  apiClient.getWorkers();
export const authenticateWorker = (
  email: string,
  password: string
): Promise<ApiResponse<unknown>> =>
  apiClient.authenticateWorker(email, password);
export const getAssignments = (
  workerId?: string
): Promise<ApiResponse<unknown>> => apiClient.getAssignments(workerId);
