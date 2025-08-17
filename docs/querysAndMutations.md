# Hooks Documentation: useMutation and useRequest

## useMutation

The `useMutation` hook is used to handle mutation operations (POST, PUT, DELETE, PATCH) with schema validation and state management.

### Main Features

- **Schema validation**: Uses Zod for data validation
- **State management**: Automatically handles loading, errors and data
- **Props generation**: Automatically generates props for forms
- **Partial validation**: Allows validating specific fields
- **Existing data loading**: Optional for editing existing records

### Parameters

```typescript
interface MutationRequest {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  schema: z.ZodSchema;
  body?: any;
  succesfulStatusCode?: number;
  initialLoading?: boolean;
  existingDataRequest?: Request; // Optional for loading existing data, useful for edit forms
}
```

### Basic Example

```typescript
import { useMutation } from '@sierra-madre/core'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
})

const mutation = {
  url: '/api/users',
  method: 'POST' as const,
  schema: userSchema,
  succesfulStatusCode: 201
}

const MyComponent = () => {
  const {
    data,
    mutate,
    register,
    isLoading,
    errors,
    partialValidation
  } = useMutation(mutation)

  const handleSubmit = async () => {
    const success = await mutate(
      (data) => console.log('User created:', data),
      (error) => console.error('Error:', error)
    )

    if (success) {
      // Navigate or show success message
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('name')} placeholder="Name" />
      <input {...register('email')} placeholder="Email" />
      <input {...register('age')} type="number" placeholder="Age" />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

### Example with Existing Data (Edit)

```typescript
const editUserMutation = {
  url: '/api/users/123',
  method: 'PUT' as const,
  schema: userSchema,
  succesfulStatusCode: 200,
  existingDataRequest: {
    url: '/api/users/123',
    method: 'GET' as const,
    autoQuery: false
  }
}

const EditUserComponent = () => {
  const {
    data,
    mutate,
    register,
    isLoading,
    errors
  } = useMutation(editUserMutation)

  // Existing data is loaded automatically
  // and displayed in the form

  return (
    <form>
      <input {...register('name')} />
      <input {...register('email')} />
      <input {...register('age')} type="number" />
    </form>
  )
}
```

### Hook API

#### Returned Properties

- `data`: Form data or mutation response
- `error`: Error from the last operation
- `status`: HTTP status code
- `isLoading`: Loading state
- `errors`: Schema validation errors
- `fetchedExistingData`: Indicates if existing data has been loaded

#### Methods

- `mutate(onSuccess?, onError?)`: Executes the mutation
- `reset()`: Resets the hook state
- `register(fieldName)`: Generates props for form fields
- `partialValidation(fields)`: Validates specific fields
- `setErrors(errors)`: Manually sets errors

### Partial Validation

```typescript
const handleBlur = (fieldName: string) => {
  partialValidation([fieldName])
}

<input
  {...register('email')}
  onBlur={() => handleBlur('email')}
/>
```

---

## useRequest

The `useRequest` hook is used to perform simple GET requests with automatic state management.

### Main Features

- **Automatic state management**: Loading, errors and data
- **Optional auto-query**: Can execute automatically
- **Reusable**: Allows multiple executions

### Parameters

```typescript
interface Request {
  url: string;
  method: "GET";
  autoQuery?: boolean; // Default: false
}
```

### Basic Example

```typescript
import { useRequest } from '@sierra-madre/core'

const MyComponent = () => {
  const {
    data,
    query,
    isLoading,
    error,
    status
  } = useRequest({
    url: '/api/users',
    method: 'GET',
    autoQuery: true // Executes automatically when component mounts
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Example with Manual Query

```typescript
const UserList = () => {
  const {
    data,
    query,
    isLoading,
    error
  } = useRequest({
    url: '/api/users',
    method: 'GET',
    autoQuery: false // Does not execute automatically
  })

  const handleRefresh = () => {
    query() // Manually execute the request
  }

  return (
    <div>
      <button onClick={handleRefresh} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>

      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Hook API

#### Returned Properties

- `data`: Response data
- `error`: Error from the last request
- `status`: HTTP status code
- `isLoading`: Loading state

#### Methods

- `query()`: Manually executes the request
- `reset()`: Resets the hook state

### Common Use Cases

#### 1. Automatic Data Loading

```typescript
const { data, isLoading } = useRequest({
  url: "/api/dashboard/stats",
  method: "GET",
  autoQuery: true,
});
```

#### 2. Search with Parameters

```typescript
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data, query } = useRequest({
    url: `/api/search?q=${searchTerm}`,
    method: 'GET',
    autoQuery: false
  })

  const handleSearch = () => {
    query()
  }

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  )
}
```

#### 3. Pagination

```typescript
const UserList = () => {
  const [page, setPage] = useState(1)

  const { data, query } = useRequest({
    url: `/api/users?page=${page}`,
    method: 'GET',
    autoQuery: false
  })

  useEffect(() => {
    query()
  }, [page])

  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}

      <button onClick={() => setPage(p => p + 1)}>
        Next page
      </button>
    </div>
  )
}
```

## Best Practices

### For useMutation

1. **Always define validation schemas**: Use Zod to validate data before sending
2. **Handle errors appropriately**: Implement success and error callbacks
3. **Use partial validation**: For large forms, validate individual fields
4. **Clean up state**: Use `reset()` when necessary

### For useRequest

1. **Use autoQuery for initial data**: For data you need when the component loads
2. **Handle loading states**: Show appropriate loading indicators
3. **Implement error handling**: Show useful error messages
4. **Optimize re-renders**: Use `useCallback` for functions passed as props

### Complete Integration Example

```typescript
const UserManagement = () => {
  // Load user list
  const { data: users, query: refreshUsers } = useRequest({
    url: '/api/users',
    method: 'GET',
    autoQuery: true
  })

  // Mutation to create user
  const { mutate: createUser, register, isLoading: isCreating } = useMutation({
    url: '/api/users',
    method: 'POST',
    schema: userSchema,
    succesfulStatusCode: 201
  })

  const handleCreateUser = async () => {
    const success = await createUser(
      (newUser) => {
        console.log('User created:', newUser)
        refreshUsers() // Refresh list
      },
      (error) => {
        console.error('Error creating user:', error)
      }
    )
  }

  return (
    <div>
      {/* User list */}
      <div>
        {users?.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>

      {/* Creation form */}
      <form onSubmit={handleCreateUser}>
        <input {...register('name')} placeholder="Name" />
        <input {...register('email')} placeholder="Email" />
        <button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  )
}
```
