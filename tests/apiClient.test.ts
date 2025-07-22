import { initializeApiClient, getApiClient, createApiClient } from '../src/client/apiClient';
import { createAuthMiddleware, getAuthToken, setAuthToken } from '../src/middleware/authMiddleware';
import { request } from '../src/core/request';

// Mock de axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    defaults: {
      baseURL: '',
      timeout: 10000,
      headers: {},
    },
  })),
}));

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeApiClient', () => {
    it('debería crear una nueva instancia del cliente API', () => {
      const config = {
        baseURL: 'https://api.test.com',
        timeout: 5000,
      };

      const client = initializeApiClient(config);

      expect(client).toBeDefined();
      expect(typeof client.get).toBe('function');
    });

    it('debería usar la configuración por defecto cuando no se proporciona', () => {
      const config = {
        baseURL: 'https://api.test.com',
      };

      const client = initializeApiClient(config);

      expect(client).toBeDefined();
    });
  });

  describe('getApiClient', () => {
    it('debería lanzar error si el cliente no está inicializado', () => {
      expect(() => getApiClient()).toThrow(
        'ApiClient no ha sido inicializado. Llama a initializeApiClient() primero.'
      );
    });

    it('debería retornar el cliente inicializado', () => {
      const config = { baseURL: 'https://api.test.com' };
      initializeApiClient(config);

      const client = getApiClient();
      expect(client).toBeDefined();
    });
  });

  describe('createApiClient', () => {
    it('debería crear una nueva instancia independiente', () => {
      const config = { baseURL: 'https://api.test.com' };
      const client1 = createApiClient(config);
      const client2 = createApiClient(config);

      expect(client1).not.toBe(client2);
    });
  });
});

describe('AuthMiddleware', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAuthToken', () => {
    it('debería retornar null si no hay token', () => {
      const token = getAuthToken();
      expect(token).toBeNull();
    });

    it('debería retornar el token guardado', () => {
      const testToken = 'test-token-123';
      setAuthToken(testToken);

      const token = getAuthToken();
      expect(token).toBe(testToken);
    });
  });

  describe('setAuthToken', () => {
    it('debería guardar el token en localStorage', () => {
      const testToken = 'test-token-123';
      setAuthToken(testToken);

      expect(localStorage.getItem('sierra_madre_auth_token')).toBe(testToken);
    });
  });

  describe('createAuthMiddleware', () => {
    it('debería crear un middleware que añade el token de autorización', () => {
      const testToken = 'test-token-123';
      setAuthToken(testToken);

      const middleware = createAuthMiddleware();
      const config = {
        url: '/api/test',
        headers: {},
      };

      const result = middleware(config);
      expect(result.headers?.Authorization).toBe(`Bearer ${testToken}`);
    });

    it('debería mantener headers existentes', () => {
      const testToken = 'test-token-123';
      setAuthToken(testToken);

      const middleware = createAuthMiddleware();
      const config = {
        url: '/api/test',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const result = middleware(config);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      expect(result.headers?.Authorization).toBe(`Bearer ${testToken}`);
    });
  });
});

describe('request function', () => {
  beforeEach(() => {
    // Inicializar cliente para tests
    initializeApiClient({
      baseURL: 'https://api.test.com',
    });
  });

  it('debería retornar un objeto con data y error', async () => {
    // Mock de la respuesta exitosa
    const mockData = { id: 1, name: 'Test' };
    const apiClient = getApiClient();
    jest.spyOn(apiClient, 'get').mockResolvedValue(mockData);

    const result = await request('/test');

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('debería manejar errores correctamente', async () => {
    // Mock de error
    const mockError = {
      message: 'Error de red',
      status: 500,
      code: 'NETWORK_ERROR',
    };

    const apiClient = getApiClient();
    jest.spyOn(apiClient, 'get').mockRejectedValue(mockError);

    const result = await request('/test');

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      message: mockError.message,
      code: mockError.code,
      status: mockError.status,
    });
  });
}); 