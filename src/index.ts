/**
 * SDK TypeScript desacoplado para Sierra Madre
 * Funciones básicas de llamado a APIs con tipado fuerte
 */

// Exportaciones principales
export { request } from './core/request';
export { useApi, useApiWithParams, useApiWithDeps, useApiWithTransform, useApiWithValidation, useApiWithMutation } from './hooks/useApi';

// Cliente API
export { 
  initializeApiClient, 
  getApiClient, 
  createApiClient
} from './client/apiClient';

// Middleware de autenticación
export {
  createAuthMiddleware,
  createConditionalAuthMiddleware,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  hasValidAuthToken
} from './middleware/authMiddleware';

// Tipos
export type {
  ApiResult,
  ApiResponse,
  ApiError,
  AuthToken,
  User,
  ApiClientConfig,
  RequestConfig,
  UseApiOptions,
  MiddlewareContext,
  Middleware,
  Product,
  Order,
  PaginatedResponse,
  HttpMethod,
  QueryParams
} from './types';

// Configuración por defecto
export const DEFAULT_CONFIG = {
  baseURL: 'https://api.sierramadre.com',
  timeout: 10000,
  withCredentials: true,
} as const;

// Función de inicialización rápida
export function initializeSierraMadreSDK(config?: Partial<typeof DEFAULT_CONFIG>) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const apiClient = initializeApiClient(finalConfig);
  
  // Añadir middleware de autenticación por defecto
  apiClient.addMiddleware(createAuthMiddleware());
  
  return apiClient;
}

// Función helper para crear un cliente con autenticación
export function createAuthenticatedClient(baseURL: string) {
  const apiClient = createApiClient({ baseURL });
  apiClient.addMiddleware(createAuthMiddleware());
  return apiClient;
}

// Función helper para crear un cliente con autenticación condicional
export function createConditionalAuthenticatedClient(
  baseURL: string,
  requiresAuth: (url: string) => boolean
) {
  const apiClient = createApiClient({ baseURL });
  apiClient.addMiddleware(createConditionalAuthMiddleware(requiresAuth));
  return apiClient;
} 