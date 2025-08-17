import { debounce, Debouncer, createDebouncedFunction, debounceFunction } from '../src/tools/debouncer';

// Example 1: Using the pure JavaScript debounce function
export const pureDebounceExample = () => {
  const handleSearch = (searchTerm: string) => {
    
    // API call would go here
  };

  const debouncedSearch = debounce(() => handleSearch('test'), 300);

  // Usage
  debouncedSearch(); // This will trigger the search after 300ms
  debouncedSearch(); // This will reset the timer and wait another 300ms

  return { debouncedSearch };
};

// Example 2: Using the Debouncer class
export const debouncerExample = () => {
  const debouncer = new Debouncer();
  
  const handleInputChange = (value: string) => {
    
    // Process input changes
  };

  const debouncedInputHandler = (value: string) => {
    debouncer.debounce(() => handleInputChange(value), 500);
  };

  // Cancel pending debounced calls
  const cancelDebounce = () => {
    debouncer.cancel();
  };

  return { debouncedInputHandler, cancelDebounce };
};

// Example 3: Using createDebouncedFunction utility
export const createDebouncedFunctionExample = () => {
  // Original function
  const saveToDatabase = (data: { id: string; content: string }) => {
    
    // Database save operation
  };

  // Create debounced version
  const debouncedSave = createDebouncedFunction(saveToDatabase, 1000);

  // Usage
  const handleFormSubmit = (formData: { id: string; content: string }) => {
    debouncedSave(formData);
  };

  return { handleFormSubmit };
};

// Example 4: Using debounceFunction (simplest approach)
export const debounceFunctionExample = () => {
  const searchUsers = async (query: string) => {
    
    // const response = await fetch(`/api/users?q=${query}`);
    // return response.json();
  };

  const debouncedSearch = debounceFunction(searchUsers, 300);

  // Usage in event listener
  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
  };

  return { handleSearchInput };
};

// Example 5: API request debouncing
export const apiDebouncingExample = () => {
  const debouncer = new Debouncer();
  
  const fetchUserData = async (userId: string) => {
    try {
      
      // const response = await api.get(`/users/${userId}`);
      // return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const debouncedFetchUser = (userId: string) => {
    debouncer.debounce(() => fetchUserData(userId), 300);
  };

  return { debouncedFetchUser };
};

// Example 6: Form validation debouncing
export const formValidationExample = () => {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const debouncedValidateEmail = debounceFunction((email: string) => {
    const isValid = validateEmail(email);
    
    // Update UI based on validation result
  }, 500);

  return { debouncedValidateEmail };
};

// Example 7: Browser event handling
export const browserEventExample = () => {
  const handleResize = () => {
    
  };

  const debouncedResizeHandler = debounceFunction(handleResize, 250);

  // Add event listener
  window.addEventListener('resize', debouncedResizeHandler);

  // Remove event listener (when component unmounts)
  const cleanup = () => {
    window.removeEventListener('resize', debouncedResizeHandler);
  };

  return { cleanup };
}; 