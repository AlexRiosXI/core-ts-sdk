import React, { useState } from 'react';
import { 
  useRequest, 
  useRequestWithRetry, 
  useRequestOptimistic 
} from '../src/hooks/useRequest';

// Types for the example
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

/**
 * Basic useRequest example
 * Shows loading state, error handling, and data management
 */
export function UserProfileComponent({ userId }: { userId: string }) {
  const { data, error, isLoading, status, refetch, cancel } = useRequest<User>(
    `/api/users/${userId}`,
    {
      config: {
        timeout: 5000,
      },
    }
  );

  if (isLoading) {
    return (
      <div className="loading">
        <p>Loading user profile...</p>
        <button onClick={cancel}>Cancel</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <p>Status: {status}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div>No user data available</div>;
  }

  return (
    <div className="user-profile">
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
      <p>Role: {data.role}</p>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}

/**
 * useRequest with query parameters
 * Shows how to pass parameters and dependencies
 */
export function ProductListComponent({ category }: { category: string }) {
  const { data, error, isLoading, status } = useRequest<Product[]>(
    '/api/products',
    {
      params: { 
        category, 
        limit: 20,
        sort: 'price_asc'
      },
      dependencies: [category], // Re-execute when category changes
    }
  );

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading products: {error}</p>
        <p>Status: {status}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Products in {category}</h2>
      {data?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Category: {product.category}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * useRequestWithRetry example
 * Shows automatic retry functionality
 */
export function ReliableDataComponent({ userId }: { userId: string }) {
  const { 
    data, 
    error, 
    isLoading, 
    status, 
    retryAttempt,
    refetch 
  } = useRequestWithRetry<User>(
    `/api/users/${userId}`,
    {
      retryCount: 3,
      retryDelay: 1000,
      retryCondition: (err) => err.status >= 500, // Only retry server errors
    }
  );

  if (isLoading) {
    return (
      <div>
        <p>Loading user data...</p>
        {retryAttempt > 0 && (
          <p>Retry attempt: {retryAttempt}</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Status: {status}</p>
        <p>Retry attempts: {retryAttempt}</p>
        <button onClick={refetch}>Manual Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>Email: {data?.email}</p>
    </div>
  );
}

/**
 * useRequestOptimistic example
 * Shows optimistic updates for better UX
 */
export function OptimisticUserComponent({ userId }: { userId: string }) {
  const [optimisticName, setOptimisticName] = useState<string>('');

  const { 
    data, 
    error, 
    isLoading, 
    status,
    setOptimistic 
  } = useRequestOptimistic<User>(
    `/api/users/${userId}`,
    {
      optimisticData: { id: userId, name: optimisticName, email: '', role: '' } as User,
    }
  );

  const handleNameChange = (newName: string) => {
    setOptimisticName(newName);
    setOptimistic({ ...data!, name: newName });
  };

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Status: {status}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <input
        type="text"
        value={data?.name || ''}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Update name..."
      />
      {isLoading && <p>Updating...</p>}
    </div>
  );
}

/**
 * Conditional request example
 * Shows how to enable/disable requests based on conditions
 */
export function ConditionalRequestComponent({ userId, shouldFetch }: { userId: string; shouldFetch: boolean }) {
  const { data, error, isLoading, status } = useRequest<User>(
    shouldFetch ? `/api/users/${userId}` : null,
    {
      enabled: shouldFetch,
      dependencies: [shouldFetch],
    }
  );

  if (!shouldFetch) {
    return <div>Request is disabled</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Status: {status}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>Email: {data?.email}</p>
    </div>
  );
}

/**
 * Advanced example with multiple requests
 * Shows how to manage multiple requests in a component
 */
export function DashboardComponent({ userId }: { userId: string }) {
  // User data request
  const userRequest = useRequest<User>(`/api/users/${userId}`);
  
  // User orders request
  const ordersRequest = useRequest<any[]>(`/api/users/${userId}/orders`, {
    enabled: !!userRequest.data, // Only fetch orders if user data is available
  });

  // User preferences request
  const preferencesRequest = useRequest<any>(`/api/users/${userId}/preferences`, {
    enabled: !!userRequest.data,
  });

  if (userRequest.isLoading) {
    return <div>Loading user data...</div>;
  }

  if (userRequest.error) {
    return (
      <div>
        <p>Error loading user: {userRequest.error}</p>
        <p>Status: {userRequest.status}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* User Info */}
      <section>
        <h2>User Information</h2>
        <p>Name: {userRequest.data?.name}</p>
        <p>Email: {userRequest.data?.email}</p>
        <p>Role: {userRequest.data?.role}</p>
      </section>

      {/* Orders */}
      <section>
        <h2>Orders</h2>
        {ordersRequest.isLoading && <p>Loading orders...</p>}
        {ordersRequest.error && <p>Error loading orders: {ordersRequest.error}</p>}
        {ordersRequest.data && (
          <div>
            {ordersRequest.data.map(order => (
              <div key={order.id}>
                <p>Order #{order.id}</p>
                <p>Total: ${order.total}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preferences */}
      <section>
        <h2>Preferences</h2>
        {preferencesRequest.isLoading && <p>Loading preferences...</p>}
        {preferencesRequest.error && <p>Error loading preferences: {preferencesRequest.error}</p>}
        {preferencesRequest.data && (
          <div>
            <p>Theme: {preferencesRequest.data.theme}</p>
            <p>Language: {preferencesRequest.data.language}</p>
          </div>
        )}
      </section>
    </div>
  );
} 