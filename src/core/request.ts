import { getApiClient } from '../client/apiClient';
import { ApiResult, RequestConfig } from '../types';

/**
 * Función principal para realizar peticiones GET con tipado
 * Retorna un objeto tipado con { data, error }
 */
export async function request<T = any>(
  url: string,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  try {
    const apiClient = getApiClient();
    const data = await apiClient.get<T>(url, config);
    
    return {
      data,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Error desconocido',
        code: error.code,
        status: error.status,
      },
    };
  }
}

/**
 * Función helper para construir URLs con parámetros de consulta
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Función para realizar peticiones GET con parámetros de consulta
 */
export async function requestWithParams<T = any>(
  baseUrl: string,
  params?: Record<string, any>,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  const url = buildUrl(baseUrl, params);
  return request<T>(url, config);
}

/**
 * Función para realizar peticiones GET con timeout personalizado
 */
export async function requestWithTimeout<T = any>(
  url: string,
  timeout: number,
  config?: Omit<RequestConfig, 'timeout'>
): Promise<ApiResult<T>> {
  return request<T>(url, {
    ...config,
    timeout,
  });
}

/**
 * Función para realizar peticiones GET con cancelación
 */
export async function requestWithAbort<T = any>(
  url: string,
  signal: AbortSignal,
  config?: Omit<RequestConfig, 'signal'>
): Promise<ApiResult<T>> {
  return request<T>(url, {
    ...config,
    signal,
  });
} 