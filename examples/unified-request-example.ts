/**
 * Ejemplo de uso de la función request unificada
 * Muestra todas las opciones de configuración en una sola función
 */

import {
  initializeSierraMadreSDK,
  request,
  setAuthToken,
  removeAuthToken,
} from "../src/index";

// Tipos para el ejemplo
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
}

// 1. Inicialización del SDK
const apiClient = initializeSierraMadreSDK({
  baseURL: "https://api.sierramadre.com",
  timeout: 10000,
});

// 2. Configuración de autenticación
setAuthToken("tu-jwt-token-aqui");

// 3. Petición básica (sin parámetros adicionales)
async function fetchUserBasic(userId: string) {
  const result = await request<User>(`/api/users/${userId}`);

  if (result.error) {
    console.error("Error al obtener usuario:", result.error.message);
    return null;
  }

  return result.data;
}

// 4. Petición con parámetros de consulta
async function fetchProductsWithParams(category: string, limit: number = 10) {
  const result = await request<Product[]>("/api/products", {
    params: {
      category,
      limit,
      page: 1,
      sort: "price_asc",
    },
  });

  if (result.error) {
    console.error("Error al obtener productos:", result.error.message);
    return [];
  }

  return result.data;
}

// 5. Petición con timeout personalizado
async function fetchOrderWithTimeout(orderId: string) {
  const result = await request<Order>(`/api/orders/${orderId}`, {
    config: {
      timeout: 5000, // 5 segundos
    },
  });

  if (result.error) {
    console.error("Error al obtener orden:", result.error.message);
    return null;
  }

  return result.data;
}

// 6. Petición con cancelación (AbortController)
async function fetchUserWithAbort(userId: string) {
  const controller = new AbortController();

  // Configurar timeout para abortar automáticamente
  setTimeout(() => controller.abort(), 3000);

  const result = await request<User>(`/api/users/${userId}`, {
    config: {
      signal: controller.signal,
    },
  });

  if (result.error) {
    if (result.error.code === "ABORT_ERR") {
    } else {
      console.error("Error al obtener usuario:", result.error.message);
    }
    return null;
  }

  return result.data;
}

// 7. Petición con headers personalizados
async function fetchProductsWithCustomHeaders(category: string) {
  const result = await request<Product[]>("/api/products", {
    params: { category },
    config: {
      headers: {
        "X-Custom-Header": "value",
        "Accept-Language": "es-ES",
      },
    },
  });

  if (result.error) {
    console.error("Error al obtener productos:", result.error.message);
    return [];
  }

  return result.data;
}

// 8. Petición con parámetros y timeout combinados
async function fetchProductsAdvanced(category: string, limit: number = 20) {
  const result = await request<Product[]>("/api/products", {
    params: {
      category,
      limit,
      include_inactive: false,
      sort_by: "created_at",
      sort_order: "desc",
    },
    config: {
      timeout: 8000,
      headers: {
        "Cache-Control": "no-cache",
      },
    },
  });

  if (result.error) {
    console.error("Error al obtener productos:", result.error.message);
    return [];
  }

  return result.data;
}

// 9. Ejemplo de manejo de errores con diferentes configuraciones
async function handleApiErrors() {
  try {
    // Petición que probablemente falle
    const result = await request("/api/non-existent-endpoint", {
      config: {
        timeout: 2000,
      },
    });

    if (result.error) {
      switch (result.error.status) {
        case 401:
          removeAuthToken();
          break;
        case 404:
          break;
        case 500:
          break;
        default:
      }
    }
  } catch (error) {
    console.error("Error inesperado:", error);
  }
}

// 10. Ejemplo de petición con múltiples parámetros complejos
async function fetchComplexData() {
  const result = await request<{
    users: User[];
    products: Product[];
    orders: Order[];
  }>("/api/dashboard", {
    params: {
      include_users: true,
      include_products: true,
      include_orders: true,
      date_from: "2024-01-01",
      date_to: "2024-12-31",
      group_by: "month",
    },
    config: {
      timeout: 15000,
      headers: {
        Accept: "application/json",
        "X-API-Version": "2.0",
      },
    },
  });

  if (result.error) {
    console.error(
      "Error al obtener datos del dashboard:",
      result.error.message,
    );
    return null;
  }

  return result.data;
}

// Exportar funciones para uso en otros archivos
export {
  fetchUserBasic,
  fetchProductsWithParams,
  fetchOrderWithTimeout,
  fetchUserWithAbort,
  fetchProductsWithCustomHeaders,
  fetchProductsAdvanced,
  handleApiErrors,
  fetchComplexData,
};
