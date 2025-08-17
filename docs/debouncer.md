# Debouncer Utilities

Este módulo proporciona utilidades para implementar funcionalidad de debounce en tu aplicación usando **puro JavaScript**. El debounce es útil para limitar la frecuencia de ejecución de funciones, especialmente en casos como búsquedas en tiempo real, validación de formularios y llamadas a APIs.

## Funciones Disponibles

### `debounce(callback, delay)`

Función simple de debounce que devuelve una función debounced. **Sin dependencias de React**.

```typescript
import { debounce } from '@your-sdk/core';

const handleSearch = (searchTerm: string) => {
  
  // API call would go here
};

const debouncedSearch = debounce(() => handleSearch('test'), 300);

// Usage
debouncedSearch(); // Triggers after 300ms
debouncedSearch(); // Resets timer and waits another 300ms
```

### `debounceFunction(func, delay)`

Utilidad simple para crear una versión debounced de cualquier función.

```typescript
import { debounceFunction } from '@your-sdk/core';

const searchUsers = async (query: string) => {
  const response = await fetch(`/api/users?q=${query}`);
  return response.json();
};

const debouncedSearch = debounceFunction(searchUsers, 300);

// Usage
debouncedSearch('john'); // Will execute after 300ms delay
```

### `Debouncer` Class

Clase para crear instancias de debouncer reutilizables. Útil cuando necesitas múltiples debouncers o quieres cancelar llamadas pendientes.

```typescript
import { Debouncer } from '@your-sdk/core';

const debouncer = new Debouncer();

const handleInputChange = (value: string) => {
  
};

// Debounce la función
debouncer.debounce(() => handleInputChange('test'), 500);

// Cancelar llamadas pendientes
debouncer.cancel();
```

### `createDebouncedFunction(func, delay)`

Utilidad para crear una versión debounced de cualquier función existente.

```typescript
import { createDebouncedFunction } from '@your-sdk/core';

const saveToDatabase = (data: { id: string; content: string }) => {
  
};

const debouncedSave = createDebouncedFunction(saveToDatabase, 1000);

// Usar la función debounced
debouncedSave({ id: '1', content: 'Hello World' });
```

## Casos de Uso Comunes

### 1. Búsqueda en Tiempo Real

```typescript
import { debounceFunction } from '@your-sdk/core';

const searchUsers = async (query: string) => {
  const response = await fetch(`/api/users?q=${query}`);
  return response.json();
};

const debouncedSearch = debounceFunction(searchUsers, 300);

// En un input de búsqueda
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### 2. Validación de Formularios

```typescript
import { debounceFunction } from '@your-sdk/core';

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const debouncedValidateEmail = debounceFunction((email: string) => {
  const isValid = validateEmail(email);
  updateValidationUI(isValid);
}, 500);
```

### 3. Guardado Automático

```typescript
import { Debouncer } from '@your-sdk/core';

const debouncer = new Debouncer();

const autoSave = (content: string) => {
  debouncer.debounce(() => {
    localStorage.setItem('draft', content);
    
  }, 2000);
};
```

### 4. Eventos del Navegador

```typescript
import { debounceFunction } from '@your-sdk/core';

const handleResize = () => {
  
};

const debouncedResizeHandler = debounceFunction(handleResize, 250);

window.addEventListener('resize', debouncedResizeHandler);
```

### 5. Llamadas a API

```typescript
import { createDebouncedFunction } from '@your-sdk/core';

const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const debouncedFetchUser = createDebouncedFunction(fetchUserData, 300);

// Evita múltiples llamadas cuando el usuario cambia rápidamente de usuario
debouncedFetchUser('user123');
```

## Comparación de Funciones

| Función | Uso | Ventajas |
|---------|-----|----------|
| `debounce()` | Función simple | Fácil de usar, devuelve función |
| `debounceFunction()` | Cualquier función | Más directo, preserva argumentos |
| `Debouncer` class | Múltiples debouncers | Control total, cancelación |
| `createDebouncedFunction()` | Funciones complejas | Flexibilidad máxima |

## Consideraciones de Rendimiento

- **Delay apropiado**: Usa delays entre 200-500ms para búsquedas y 1000-2000ms para guardado automático
- **Cancelación**: Usa `debouncer.cancel()` cuando sea necesario limpiar llamadas pendientes
- **Memoria**: Las instancias de `Debouncer` mantienen referencias a timers, asegúrate de cancelarlos cuando ya no sean necesarios

## Compatibilidad

Las funciones son compatibles con:
- **Navegadores modernos**
- **Node.js**
- **TypeScript**
- **Sin dependencias externas**

## Tipos TypeScript

```typescript
// Función debounce simple
function debounce(callback: () => void, delay: number): void

// Función debounce utilitaria
function debounceFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void

// Clase Debouncer
class Debouncer {
  debounce(callback: () => void, delay: number): void
  cancel(): void
}

// Función utilitaria avanzada
function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
``` 