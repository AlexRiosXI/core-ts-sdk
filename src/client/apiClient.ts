import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiClientConfig, RequestConfig } from '../types';

/**
 * Cliente API centralizado para Sierra Madre
 * Configuración base de Axios con interceptores y manejo de errores
 */
class ApiClient {
  private client: AxiosInstance;
  private middlewares: Array<(config: AxiosRequestConfig) => AxiosRequestConfig> = [];

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials || false,
    });

    this.setupInterceptors();
  }

  /**
   * Configura los interceptores de Axios para manejo automático de errores
   */
  private setupInterceptors(): void {
    // Interceptor de solicitud
    this.client.interceptors.request.use(
      (config) => {
        // Aplicar middlewares de solicitud
        this.middlewares.forEach((middleware) => {
          config = middleware(config);
        });
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de respuesta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Manejo centralizado de errores
        const errorResponse = {
          message: error.response?.data?.message || error.message || 'Error de red',
          status: error.response?.status || 0,
          code: error.code,
          data: error.response?.data,
        };

        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * Añade un middleware al cliente
   */
  public addMiddleware(middleware: (config: AxiosRequestConfig) => AxiosRequestConfig): void {
    this.middlewares.push(middleware);
  }

  /**
   * Realiza una petición GET
   */
  public async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, {
        headers: config?.headers,
        timeout: config?.timeout,
        signal: config?.signal,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la instancia de Axios subyacente
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Actualiza la configuración base del cliente
   */
  public updateConfig(config: Partial<ApiClientConfig>): void {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
    if (config.headers) {
      this.client.defaults.headers = {
        ...this.client.defaults.headers,
        ...config.headers,
      };
    }
  }
}

// Instancia por defecto del cliente API
let defaultApiClient: ApiClient | null = null;

/**
 * Inicializa el cliente API por defecto
 */
export function initializeApiClient(config: ApiClientConfig): ApiClient {
  defaultApiClient = new ApiClient(config);
  return defaultApiClient;
}

/**
 * Obtiene la instancia por defecto del cliente API
 */
export function getApiClient(): ApiClient {
  if (!defaultApiClient) {
    throw new Error('ApiClient no ha sido inicializado. Llama a initializeApiClient() primero.');
  }
  return defaultApiClient;
}

/**
 * Crea una nueva instancia del cliente API
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

export default ApiClient; 