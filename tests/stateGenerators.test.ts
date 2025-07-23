import { z } from 'zod';
import { generateInitialState } from '../src/utils/stateGenerators';

describe('generateInitialState', () => {
  test('should generate initial state for basic types', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      isActive: z.boolean(),
      tags: z.array(z.string())
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      name: '',
      age: 0,
      isActive: false,
      tags: []
    });
  });

  test('should handle optional and nullable fields', () => {
    const schema = z.object({
      name: z.string(),
      bio: z.string().optional(),
      avatar: z.string().nullable(),
      email: z.string().email().optional()
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      name: '',
      bio: undefined,
      avatar: null,
      email: undefined
    });
  });

  test('should handle default values', () => {
    const schema = z.object({
      name: z.string(),
      theme: z.string().default('dark'),
      notifications: z.boolean().default(true),
      tags: z.array(z.string()).default(['default'])
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      name: '',
      theme: 'dark',
      notifications: true,
      tags: ['default']
    });
  });

  test('should handle nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
        preferences: z.object({
          theme: z.string().default('light'),
          notifications: z.boolean().default(false)
        })
      }),
      settings: z.object({
        language: z.string().optional(),
        timezone: z.string().default('UTC')
      }).optional()
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      user: {
        name: '',
        age: 0,
        preferences: {
          theme: 'light',
          notifications: false
        }
      },
      settings: {
        language: undefined,
        timezone: 'UTC'
      }
    });
  });

  test('should handle arrays with complex types', () => {
    const schema = z.object({
      products: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        tags: z.array(z.string()).default([])
      })),
      categories: z.array(z.string()).default(['default'])
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      products: [],
      categories: ['default']
    });
  });

  test('should handle enums', () => {
    const schema = z.object({
      status: z.enum(['pending', 'active', 'inactive']).default('pending'),
      role: z.enum(['admin', 'user', 'moderator'])
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      status: 'pending',
      role: undefined // enums without defaults return undefined
    });
  });

  test('should handle union types', () => {
    const schema = z.object({
      value: z.union([z.string(), z.number()]),
      status: z.union([z.literal('active'), z.literal('inactive')]).default('active')
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      value: '', // unions default to first type
      status: 'active'
    });
  });

  test('should handle complex nested structures', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          personal: z.object({
            firstName: z.string(),
            lastName: z.string(),
            email: z.string().email(),
            phone: z.string().optional()
          }),
          preferences: z.object({
            theme: z.string().default('auto'),
            language: z.string().optional(),
            notifications: z.boolean().default(true)
          })
        }),
        settings: z.object({
          privacy: z.object({
            profileVisible: z.boolean().default(true),
            emailVisible: z.boolean().default(false)
          }).optional()
        })
      }),
      metadata: z.object({
        tags: z.array(z.string()).default([]),
        createdAt: z.string().optional()
      })
    });

    const initialState = generateInitialState(schema);

    expect(initialState).toEqual({
      user: {
        profile: {
          personal: {
            firstName: '',
            lastName: '',
            email: '',
            phone: undefined
          },
          preferences: {
            theme: 'auto',
            language: undefined,
            notifications: true
          }
        },
        settings: {
          privacy: {
            profileVisible: true,
            emailVisible: false
          }
        }
      },
      metadata: {
        tags: [],
        createdAt: undefined
      }
    });
  });
}); 