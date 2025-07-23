import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { request } from '../core/request';
import { ApiResult, UseApiOptions } from '../types';

/**
 * Hook personalizado que utiliza SWR para realizar peticiones GET
 * Proporciona caché automático, revalidación y manejo de estado
 */
export function useApi<T = unknown>(
  url: string | null,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, unknown> {
  const swrOptions: SWRConfiguration = {
    revalidateOnFocus: options?.revalidateOnFocus ?? true,
    revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
    ...(options?.refreshInterval !== undefined && { refreshInterval: options.refreshInterval }),
    ...(options?.dedupingInterval !== undefined && { dedupingInterval: options.dedupingInterval }),
    ...(options?.errorRetryCount !== undefined && { errorRetryCount: options.errorRetryCount }),
    ...(options?.errorRetryInterval !== undefined && { errorRetryInterval: options.errorRetryInterval }),
    ...(options?.onSuccess && { onSuccess: options.onSuccess }),
    ...(options?.onError && { onError: options.onError }),
  };

  return useSWR<ApiResult<T>>(
    url,
    async (url: string) => {
      return await request<T>(url);
    },
    swrOptions
  );
}

/**
 * Hook para peticiones con parámetros de consulta
 */
export function useApiWithParams<T = unknown>(
  baseUrl: string | null,
  params?: Record<string, unknown>,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, unknown> {
  const url = baseUrl ? buildUrl(baseUrl, params) : null;
  return useApi<T>(url, options);
}

/**
 * Hook para peticiones con dependencias (re-ejecuta cuando cambian las dependencias)
 */
export function useApiWithDeps<T = unknown>(
  url: string | null,
  deps: unknown[],
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, unknown> {
  const swrOptions: SWRConfiguration = {
    ...options,
    revalidateIfStale: true,
    revalidateOnMount: true,
  };

  return useSWR<ApiResult<T>>(
    url ? [url, ...deps] : null,
    async ([url]: [string, ...unknown[]]) => {
      return await request<T>(url);
    },
    swrOptions
  );
}

/**
 * Hook para peticiones con transformación de datos
 */
export function useApiWithTransform<T = unknown, R = unknown>(
  url: string | null,
  transform: (data: T) => R,
  options?: UseApiOptions
): SWRResponse<ApiResult<R>, unknown> {
  return useSWR<ApiResult<R>>(
    url,
    async (url: string) => {
      const result = await request<T>(url);
      
      if (result.error) {
        return result as ApiResult<R>;
      }
      
      return {
        data: transform(result.data),
        error: null,
      };
    },
    options
  );
}

/**
 * Hook para peticiones con validación de datos
 */
export function useApiWithValidation<T = unknown>(
  url: string | null,
  validator: (data: unknown) => data is T,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, unknown> {
  return useSWR<ApiResult<T>>(
    url,
    async (url: string) => {
      const result = await request<unknown>(url);
      
      if (result.error) {
        return result as ApiResult<T>;
      }
      
      if (!validator(result.data)) {
        return {
          data: null,
          error: {
            message: 'Datos inválidos recibidos del servidor',
            code: 'VALIDATION_ERROR',
          },
        };
      }
      
      return {
        data: result.data,
        error: null,
      };
    },
    options
  );
}

/**
 * Función helper para construir URLs con parámetros
 */
function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
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
 * Hook para peticiones con mutación (para futuras implementaciones POST/PUT/DELETE)
 */
export function useApiWithMutation<T = unknown>(
  url: string | null,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, unknown> {
  return useApi<T>(url, options);
} 