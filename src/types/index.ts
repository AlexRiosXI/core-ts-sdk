/**
 * Tipos principales del SDK de Sierra Madre
 */

// Tipos de respuesta estándar
export interface ApiResponse<T = any> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    status?: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Tipos para autenticación
export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Tipos para configuración del cliente
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// Tipos para hooks
export interface UseApiOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Tipos para middleware
export interface MiddlewareContext {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    data?: any;
  };
  response?: {
    data: any;
    status: number;
    headers: Record<string, string>;
  };
  error?: any;
}

export type Middleware = (context: MiddlewareContext) => Promise<MiddlewareContext>;

// Tipos para contratos compartidos (ejemplos)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  products: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Tipos de utilidad
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
} 