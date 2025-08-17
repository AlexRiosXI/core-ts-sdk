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
import { initializeSierraMadreSDK } from "@sierra-madre/core-ts-sdk";

// Inicializar con configuración por defecto
const apiClient = initializeSierraMadreSDK({
  baseURL: "https://api.sierramadre.com",
  timeout: 10000,
});
```

### Inicialización manual

```typescript
import {
  initializeApiClient,
  createAuthMiddleware,
} from "@sierra-madre/core-ts-sdk";

const apiClient = initializeApiClient({
  baseURL: "https://api.sierramadre.com",
  timeout: 10000,
  withCredentials: true,
});

// Añadir middleware de autenticación
apiClient.addMiddleware(createAuthMiddleware());
```

## 📡 Uso básico

### Función request unificada

La función `request` es la función principal del SDK y acepta parámetros opcionales para configurar peticiones GET:

```typescript
import { request } from '@sierra-madre/core-ts-sdk';

// Sintaxis básica
request<T>(url: string, options?: {
  params?: Record<string, any>;    // Parámetros de consulta
  config?: RequestConfig;          // Configuración adicional
})
```

### Peticiones GET simples

```typescript
import { request } from "@sierra-madre/core-ts-sdk";

// Petición básica
const result = await request<User>("/api/users/1");

if (result.error) {
  console.error("Error:", result.error.message);
} else {
}
```

### Peticiones con parámetros de consulta

```typescript
import { request } from "@sierra-madre/core-ts-sdk";

// Petición con parámetros de consulta
const result = await request<Product[]>("/api/products", {
  params: {
    category: "electronics",
    limit: 10,
    page: 1,
  },
});
```

### Peticiones con timeout

```typescript
import { request } from "@sierra-madre/core-ts-sdk";

// Petición con timeout personalizado
const result = await request<Order>("/api/orders/123", {
  config: {
    timeout: 5000, // 5 segundos
  },
});
```

### Peticiones con cancelación

```typescript
import { request } from "@sierra-madre/core-ts-sdk";

// Petición con AbortController para cancelación
const controller = new AbortController();
const result = await request<User>("/api/users/1", {
  config: {
    signal: controller.signal,
  },
});

// Para cancelar la petición
controller.abort();
```

### Peticiones con parámetros y configuración combinada

```typescript
import { request } from "@sierra-madre/core-ts-sdk";

// Petición con parámetros y timeout
const result = await request<Product[]>("/api/products", {
  params: {
    category: "electronics",
    limit: 10,
  },
  config: {
    timeout: 8000,
    headers: {
      "X-Custom-Header": "value",
    },
  },
});
```

## 🎣 Hooks de React

### Hook useRequest (Recomendado)

El hook `useRequest` proporciona un manejo completo del estado de las peticiones:

```typescript
import { useRequest } from '@sierra-madre/core-ts-sdk';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, status, refetch, cancel } = useRequest<User>(
    `/api/users/${userId}`,
    {
      config: { timeout: 5000 }
    }
  );

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error} (Status: {status})</div>;
  if (!data) return <div>No hay datos</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={refetch}>Actualizar</button>
      <button onClick={cancel}>Cancelar</button>
    </div>
  );
}
```

### Hook básico (useApi)

### Hook con parámetros

```typescript
import { useRequest } from '@sierra-madre/core-ts-sdk';

function ProductList({ category }: { category: string }) {
  const { data, error, isLoading, status } = useRequest<Product[]>(
    '/api/products',
    {
      params: { category, limit: 20 },
      dependencies: [category], // Re-ejecuta cuando cambia la categoría
    }
  );

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error} (Status: {status})</div>;

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Hook con retry automático

```typescript
import { useRequestWithRetry } from '@sierra-madre/core-ts-sdk';

function ReliableComponent({ userId }: { userId: string }) {
  const { data, error, isLoading, status, retryAttempt, refetch } = useRequestWithRetry<User>(
    `/api/users/${userId}`,
    {
      retryCount: 3,
      retryDelay: 1000,
      retryCondition: (err) => err.status >= 500, // Solo reintenta errores del servidor
    }
  );

  if (isLoading) {
    return (
      <div>
        <p>Cargando...</p>
        {retryAttempt > 0 && <p>Intento {retryAttempt}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Status: {status}</p>
        <p>Intentos: {retryAttempt}</p>
        <button onClick={refetch}>Reintentar manualmente</button>
      </div>
    );
  }

  return <div>{data?.name}</div>;
}
```

### Hook con actualizaciones optimistas

```typescript
import { useRequestOptimistic } from '@sierra-madre/core-ts-sdk';

function OptimisticComponent({ userId }: { userId: string }) {
  const { data, error, isLoading, setOptimistic } = useRequestOptimistic<User>(
    `/api/users/${userId}`,
    {
      optimisticData: { id: userId, name: '', email: '', role: '' } as User,
    }
  );

  const handleNameChange = (newName: string) => {
    setOptimistic({ ...data!, name: newName });
  };

  return (
    <div>
      <h1>{data?.name}</h1>
      <input
        value={data?.name || ''}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Actualizar nombre..."
      />
      {isLoading && <p>Actualizando...</p>}
    </div>
  );
}
```

### Hook con dependencias

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
import { setAuthToken, removeAuthToken } from "@sierra-madre/core-ts-sdk";

// Guardar token después del login
setAuthToken("tu-jwt-token");

// Eliminar token en logout
removeAuthToken();
```

### Middleware personalizado

```typescript
import { createConditionalAuthMiddleware } from "@sierra-madre/core-ts-sdk";

// Middleware que solo añade token para ciertas URLs
const conditionalAuth = createConditionalAuthMiddleware((url) => {
  return url.startsWith("/api/protected");
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
  Order,
} from "@sierra-madre/core-ts-sdk";

// Uso con tipos
const result: ApiResult<User> = await request<User>("/api/users/1");
```

### Contratos compartidos

```typescript
// Los tipos están diseñados para trabajar con @sierra-madre/contracts
import type { Product, Order } from "@sierra-madre/core-ts-sdk";

interface ProductWithInventory extends Product {
  stock: number;
  warehouse: string;
}

const result = await request<ProductWithInventory>("/api/products/123");
```

## 🧪 Testing

### Ejecutar tests

```bash
npm test
npm run test:watch
```

### Ejemplo de test

```typescript
import { request, initializeApiClient } from "@sierra-madre/core-ts-sdk";

describe("API Client", () => {
  beforeEach(() => {
    initializeApiClient({
      baseURL: "https://api.test.com",
    });
  });

  it("should make successful requests", async () => {
    const result = await request("/test");
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

## 🔄 Mejoras implementadas

### Función request unificada

**Antes (múltiples funciones):**

```typescript
// Diferentes funciones para diferentes casos
const result1 = await request<User>("/api/users/1");
const result2 = await requestWithParams<Product[]>("/api/products", {
  category: "electronics",
});
const result3 = await requestWithTimeout<Order>("/api/orders/123", 5000);
```

**Ahora (una sola función configurable):**

```typescript
// Una sola función para todos los casos
const result1 = await request<User>("/api/users/1");
const result2 = await request<Product[]>("/api/products", {
  params: { category: "electronics" },
});
const result3 = await request<Order>("/api/orders/123", {
  config: { timeout: 5000 },
});

// Combinando parámetros y configuración
const result4 = await request<Product[]>("/api/products", {
  params: { category: "electronics", limit: 10 },
  config: { timeout: 8000, headers: { "X-Custom": "value" } },
});
```

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
