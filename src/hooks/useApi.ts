import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { request } from '../core/request';
import { ApiResult, UseApiOptions } from '../types';

/**
 * Hook personalizado que utiliza SWR para realizar peticiones GET
 * Proporciona caché automático, revalidación y manejo de estado
 */
export function useApi<T = any>(
  url: string | null,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, any> {
  const swrOptions: SWRConfiguration = {
    revalidateOnFocus: options?.revalidateOnFocus ?? true,
    revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
    refreshInterval: options?.refreshInterval,
    dedupingInterval: options?.dedupingInterval,
    errorRetryCount: options?.errorRetryCount,
    errorRetryInterval: options?.errorRetryInterval,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
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
export function useApiWithParams<T = any>(
  baseUrl: string | null,
  params?: Record<string, any>,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, any> {
  const url = baseUrl ? buildUrl(baseUrl, params) : null;
  return useApi<T>(url, options);
}

/**
 * Hook para peticiones con dependencias (re-ejecuta cuando cambian las dependencias)
 */
export function useApiWithDeps<T = any>(
  url: string | null,
  deps: any[],
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, any> {
  const swrOptions: SWRConfiguration = {
    ...options,
    revalidateIfStale: true,
    revalidateOnMount: true,
  };

  return useSWR<ApiResult<T>>(
    url ? [url, ...deps] : null,
    async ([url]: [string, ...any[]]) => {
      return await request<T>(url);
    },
    swrOptions
  );
}

/**
 * Hook para peticiones con transformación de datos
 */
export function useApiWithTransform<T = any, R = any>(
  url: string | null,
  transform: (data: T) => R,
  options?: UseApiOptions
): SWRResponse<ApiResult<R>, any> {
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
export function useApiWithValidation<T = any>(
  url: string | null,
  validator: (data: any) => data is T,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, any> {
  return useSWR<ApiResult<T>>(
    url,
    async (url: string) => {
      const result = await request<any>(url);
      
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
function buildUrl(baseUrl: string, params?: Record<string, any>): string {
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
export function useApiWithMutation<T = any>(
  url: string | null,
  options?: UseApiOptions
): SWRResponse<ApiResult<T>, any> & {
  mutate: (data?: T, options?: { revalidate?: boolean }) => Promise<void>;
} {
  const swrResponse = useApi<T>(url, options);
  
  return {
    ...swrResponse,
    mutate: async (data?: T, mutateOptions?: { revalidate?: boolean }) => {
      if (data) {
        await swrResponse.mutate(
          {
            data,
            error: null,
          },
          { revalidate: mutateOptions?.revalidate ?? false }
        );
      } else {
        await swrResponse.mutate();
      }
    },
  };
} 