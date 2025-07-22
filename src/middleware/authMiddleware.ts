import { AxiosRequestConfig } from 'axios';

/**
 * Middleware de autenticación para añadir JWT desde localStorage
 * Se ejecuta automáticamente en cada petición
 */
export function createAuthMiddleware(): (config: AxiosRequestConfig) => AxiosRequestConfig {
  return (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Obtener el token desde localStorage
    const token = getAuthToken();
    
    if (token) {
      // Añadir el token al header Authorization
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    return config;
  };
}

/**
 * Obtiene el token de autenticación desde localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem('sierra_madre_auth_token');
  } catch (error) {
    console.warn('Error al obtener token de localStorage:', error);
    return null;
  }
}

/**
 * Guarda el token de autenticación en localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('sierra_madre_auth_token', token);
  } catch (error) {
    console.warn('Error al guardar token en localStorage:', error);
  }
}

/**
 * Elimina el token de autenticación de localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('sierra_madre_auth_token');
  } catch (error) {
    console.warn('Error al eliminar token de localStorage:', error);
  }
}

/**
 * Verifica si existe un token de autenticación válido
 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();
  return token !== null && token.length > 0;
}

/**
 * Middleware que verifica si la petición requiere autenticación
 * y añade el token si es necesario
 */
export function createConditionalAuthMiddleware(
  requiresAuth: (url: string) => boolean = () => true
): (config: AxiosRequestConfig) => AxiosRequestConfig {
  return (config: AxiosRequestConfig): AxiosRequestConfig => {
    const url = config.url || '';
    
    if (requiresAuth(url)) {
      const token = getAuthToken();
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } else {
        console.warn(`Petición a ${url} requiere autenticación pero no hay token disponible`);
      }
    }
    
    return config;
  };
} 