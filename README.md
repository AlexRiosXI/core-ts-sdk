# Sierra Madre Core TypeScript SDK

SDK TypeScript desacoplado para Sierra Madre que proporciona funciones básicas de llamado a APIs con tipado fuerte y soporte para React hooks.

## 🚀 Características

- ✅ Peticiones GET con `request<T>(url: string)`
- ✅ Hook `useApi<T>(url: string)` usando SWR
- ✅ Cliente Axios centralizado con interceptores
- ✅ Middleware de autenticación JWT automático
- ✅ Tipado fuerte con contratos compartidos
- ✅ Retorno tipado con `{ data, error }`
- ✅ Código limpio, modular y testeable
- ✅ Listo para usar en cualquier frontend React

## 📦 Instalación

```bash
npm install @sierra-madre/core-ts-sdk
```

## 🔧 Configuración

### Inicialización básica

```typescript
import { initializeSierraMadreSDK } from '@sierra-madre/core-ts-sdk';

// Inicializar con configuración por defecto
const apiClient = initializeSierraMadreSDK({
  baseURL: 'https://api.sierramadre.com',
  timeout: 10000,
});
```

### Inicialización manual

```typescript
import { initializeApiClient, createAuthMiddleware } from '@sierra-madre/core-ts-sdk';

const apiClient = initializeApiClient({
  baseURL: 'https://api.sierramadre.com',
  timeout: 10000,
  withCredentials: true,
});

// Añadir middleware de autenticación
apiClient.addMiddleware(createAuthMiddleware());
```

## 📡 Uso básico

### Peticiones GET simples

```typescript
import { request } from '@sierra-madre/core-ts-sdk';

// Petición básica
const result = await request<User>('/api/users/1');

if (result.error) {
  console.error('Error:', result.error.message);
} else {
  console.log('Usuario:', result.data);
}
```

### Peticiones con parámetros

```typescript
import { requestWithParams } from '@sierra-madre/core-ts-sdk';

// Petición con parámetros de consulta
const result = await requestWithParams<Product[]>(
  '/api/products',
  { 
    category: 'electronics',
    limit: 10,
    page: 1 
  }
);
```

### Peticiones con timeout

```typescript
import { requestWithTimeout } from '@sierra-madre/core-ts-sdk';

// Petición con timeout personalizado
const result = await requestWithTimeout<Order>(
  '/api/orders/123',
  5000 // 5 segundos
);
```

## 🎣 Hooks de React

### Hook básico

```typescript
import { useApi } from '@sierra-madre/core-ts-sdk';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useApi<User>(`/api/users/${userId}`);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No hay datos</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### Hook con parámetros

```typescript
import { useApiWithParams } from '@sierra-madre/core-ts-sdk';

function ProductList({ category }: { category: string }) {
  const { data, error, isLoading } = useApiWithParams<Product[]>(
    '/api/products',
    { category, limit: 20 }
  );

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Hook con dependencias

```typescript
import { useApiWithDeps } from '@sierra-madre/core-ts-sdk';

function OrderDetails({ orderId, includeItems }: { orderId: string; includeItems: boolean }) {
  const { data, error, isLoading } = useApiWithDeps<Order>(
    '/api/orders',
    [orderId, includeItems], // Re-ejecuta cuando cambian estas dependencias
    { includeItems }
  );

  // ... resto del componente
}
```

### Hook con transformación

```typescript
import { useApiWithTransform } from '@sierra-madre/core-ts-sdk';

function ProductStats({ category }: { category: string }) {
  const { data, error, isLoading } = useApiWithTransform<Product[], number>(
    `/api/products?category=${category}`,
    (products) => products.length // Transforma array de productos a número
  );

  return (
    <div>
      {isLoading ? 'Calculando...' : `Total productos: ${data}`}
    </div>
  );
}
```

## 🔐 Autenticación

### Configuración automática

El SDK incluye middleware de autenticación que automáticamente añade el token JWT desde `localStorage`:

```typescript
import { setAuthToken, removeAuthToken } from '@sierra-madre/core-ts-sdk';

// Guardar token después del login
setAuthToken('tu-jwt-token');

// Eliminar token en logout
removeAuthToken();
```

### Middleware personalizado

```typescript
import { createConditionalAuthMiddleware } from '@sierra-madre/core-ts-sdk';

// Middleware que solo añade token para ciertas URLs
const conditionalAuth = createConditionalAuthMiddleware((url) => {
  return url.startsWith('/api/protected');
});

apiClient.addMiddleware(conditionalAuth);
```

## 📝 Tipos y contratos

### Tipos básicos

```typescript
import type { 
  ApiResult, 
  ApiResponse, 
  ApiError,
  User, 
  Product, 
  Order 
} from '@sierra-madre/core-ts-sdk';

// Uso con tipos
const result: ApiResult<User> = await request<User>('/api/users/1');
```

### Contratos compartidos

```typescript
// Los tipos están diseñados para trabajar con @sierra-madre/contracts
import type { Product, Order } from '@sierra-madre/core-ts-sdk';

interface ProductWithInventory extends Product {
  stock: number;
  warehouse: string;
}

const result = await request<ProductWithInventory>('/api/products/123');
```

## 🧪 Testing

### Ejecutar tests

```bash
npm test
npm run test:watch
```

### Ejemplo de test

```typescript
import { request, initializeApiClient } from '@sierra-madre/core-ts-sdk';

describe('API Client', () => {
  beforeEach(() => {
    initializeApiClient({
      baseURL: 'https://api.test.com'
    });
  });

  it('should make successful requests', async () => {
    const result = await request('/test');
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });
});
```

## 🏗️ Estructura del proyecto

```
src/
├── client/          # Cliente Axios centralizado
├── core/            # Funciones principales (request)
├── hooks/           # Hooks de React con SWR
├── middleware/      # Middleware de autenticación
├── types/           # Tipos y contratos
└── index.ts         # Exportaciones principales

tests/
├── setup.ts         # Configuración de tests
└── apiClient.test.ts # Tests básicos
```

## 🔄 Flujo de datos

1. **Inicialización**: Configurar cliente API con baseURL
2. **Middleware**: Añadir middleware de autenticación
3. **Peticiones**: Usar `request()` o hooks de React
4. **Respuestas**: Manejar `{ data, error }` tipado
5. **Caché**: SWR maneja caché automáticamente

## 🚫 Limitaciones actuales

- ❌ Solo peticiones GET (POST/PUT/DELETE en futuras versiones)
- ❌ Sin validación runtime (Zod en futuras versiones)
- ❌ Sin soporte SSR/Next.js
- ❌ Sin backoff/retry automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de Sierra Madre o abre un issue en el repositorio. 