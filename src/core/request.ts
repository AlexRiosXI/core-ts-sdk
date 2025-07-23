import { getApiClient } from '../client/apiClient';
import { ApiResult, RequestConfig } from '../types';

/**
 * Función principal para realizar peticiones GET con tipado
 * Retorna un objeto tipado con { data, error }
 * 
 * @param url - URL de la petición
 * @param options - Opciones de configuración
 * @param options.params - Parámetros de consulta (query params)
 * @param options.config - Configuración adicional (timeout, signal, headers, etc.)
 */
export async function request<T = unknown>(
  url: string,
  options?: {
    params?: Record<string, unknown>;
    config?: RequestConfig;
  }
): Promise<ApiResult<T>> {
  try {
    const apiClient = getApiClient();
    
    // Construir URL con parámetros si se proporcionan
    const finalUrl = options?.params ? buildUrl(url, options.params) : url;
    
    // Usar configuración proporcionada o undefined
    const finalConfig = options?.config;
    
    const data = await apiClient.get<T>(finalUrl, finalConfig);
    
    return {
      data,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorCode = (error as { code?: string })?.code;
    const errorStatus = (error as { status?: number })?.status;
    
    return {
      data: null,
      error: {
        message: errorMessage,
        ...(errorCode && { code: errorCode }),
        ...(errorStatus && { status: errorStatus }),
      },
    };
  }
}

/**
 * Función helper para construir URLs con parámetros de consulta
 */
export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
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
export async function requestWithParams<T = unknown>(
  baseUrl: string,
  params?: Record<string, unknown>,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  const url = buildUrl(baseUrl, params);
  return request<T>(url, { ...(config && { config }) });
}

/**
 * Función para realizar peticiones GET con timeout personalizado
 */
export async function requestWithTimeout<T = unknown>(
  url: string,
  timeout: number,
  config?: Omit<RequestConfig, 'timeout'>
): Promise<ApiResult<T>> {
  return request<T>(url, {
    config: {
      ...config,
      timeout,
    },
  });
}

/**
 * Función para realizar peticiones GET con cancelación
 */
export async function requestWithAbort<T = unknown>(
  url: string,
  signal: AbortSignal,
  config?: Omit<RequestConfig, 'signal'>
): Promise<ApiResult<T>> {
  return request<T>(url, {
    config: {
      ...config,
      signal,
    },
  });
} 