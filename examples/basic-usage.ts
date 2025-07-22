/**
 * Ejemplo básico de uso del SDK de Sierra Madre
 */

import { 
  initializeSierraMadreSDK,
  request,
  useApi,
  setAuthToken,
  removeAuthToken
} from '@sierra-madre/core-ts-sdk';

// 1. Inicialización del SDK
const apiClient = initializeSierraMadreSDK({
  baseURL: 'https://api.sierramadre.com',
  timeout: 10000,
});

// 2. Configuración de autenticación
setAuthToken('tu-jwt-token-aqui');

// 3. Ejemplo de petición básica
async function fetchUser(userId: string) {
  const result = await request<User>(`/api/users/${userId}`);
  
  if (result.error) {
    console.error('Error al obtener usuario:', result.error.message);
    return null;
  }
  
  console.log('Usuario obtenido:', result.data);
  return result.data;
}

// 4. Ejemplo de petición con parámetros
async function fetchProducts(category: string, limit: number = 10) {
  const result = await request<Product[]>('/api/products', {
    params: { category, limit }
  });
  
  if (result.error) {
    console.error('Error al obtener productos:', result.error.message);
    return [];
  }
  
  console.log('Productos obtenidos:', result.data);
  return result.data;
}

// 5. Ejemplo de hook de React
function UserProfileComponent({ userId }: { userId: string }) {
  const { data: user, error, isLoading, mutate } = useApi<User>(`/api/users/${userId}`);

  if (isLoading) {
    return <div>Cargando perfil del usuario...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>No se encontró el usuario</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      <button onClick={() => mutate()}>Actualizar datos</button>
    </div>
  );
}

// 6. Ejemplo de hook con parámetros
function ProductListComponent({ category }: { category: string }) {
  const { data: products, error, isLoading } = useApiWithParams<Product[]>(
    '/api/products',
    { category, limit: 20 }
  );

  if (isLoading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Productos en {category}</h2>
      {products?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Precio: ${product.price}</p>
        </div>
      ))}
    </div>
  );
}

// 7. Ejemplo de logout
function logout() {
  removeAuthToken();
  console.log('Usuario deslogueado');
}

// 8. Ejemplo de manejo de errores
async function handleApiError() {
  try {
    const result = await request('/api/non-existent-endpoint');
    
    if (result.error) {
      switch (result.error.status) {
        case 401:
          console.log('No autorizado - redirigir a login');
          logout();
          break;
        case 404:
          console.log('Recurso no encontrado');
          break;
        case 500:
          console.log('Error del servidor');
          break;
        default:
          console.log('Error desconocido:', result.error.message);
      }
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

// Exportar para uso en otros archivos
export {
  fetchUser,
  fetchProducts,
  UserProfileComponent,
  ProductListComponent,
  logout,
  handleApiError
}; 