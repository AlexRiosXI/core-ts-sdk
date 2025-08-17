import { z, ZodTypeAny, ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodOptional, ZodNullable, ZodDefault } from "zod";

/**
 * Genera un estado inicial basado en un schema de Zod
 * @param schema - El schema de Zod para generar el estado inicial
 * @returns Un objeto con los valores iniciales correspondientes al schema
 */
export function generateInitialState<T extends ZodTypeAny>(schema: T): z.infer<T> {
  return getInitialValue(schema) as z.infer<T>;
}

/**
 * Obtiene el valor inicial para un tipo específico de Zod
 * @param schema - El schema de Zod
 * @returns El valor inicial correspondiente al tipo
 */
function getInitialValue(schema: ZodTypeAny): any {
  // Maneja tipos opcionales y nullables
  if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
    return getInitialValue(schema.unwrap() as ZodTypeAny);
  }

  
  // Maneja tipos con valores por defecto
  if (schema instanceof ZodDefault) {
    try {
      return (schema as any)._def.defaultValue();
    } catch {
      return getInitialValue((schema as any).unwrap());
    }
  }

  // Maneja tipos básicos
  if (schema instanceof ZodString) {
    return "";
  }

  if (schema instanceof ZodNumber) {
    return 0;
  }

  if (schema instanceof ZodBoolean) {
    return false;
  }

  if (schema instanceof ZodArray) {
    return [];
  }

  if (schema instanceof ZodObject) {
    return getInitialValuesFromSchema(schema);
  }

  // Fallback para tipos no reconocidos
  return null;
}

/**
 * Genera valores iniciales para un objeto Zod
 * @param schema - El schema del objeto Zod
 * @returns Un objeto con los valores iniciales para cada campo
 */
function getInitialValuesFromSchema(schema: ZodObject<any>): Record<string, any> {
  const shape = schema.shape;
  const result: Record<string, any> = {};

  for (const key in shape) {
    const fieldSchema = shape[key];
    result[key] = getInitialValue(fieldSchema);
  }

  return result;
}

// Ejemplo de uso:
/*
import { z } from 'zod';
import { generateInitialState } from './stateGenerators';

// Schema de ejemplo
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  isActive: z.boolean(),
  tags: z.array(z.string()),
  profile: z.object({
    bio: z.string().optional(),
    avatar: z.string().nullable(),
    preferences: z.object({
      theme: z.string().default('light'),
      notifications: z.boolean().default(true)
    })
  })
});

// Generar estado inicial
const initialState = generateInitialState(userSchema);

// Resultado esperado:
// {
//   name: "",
//   age: 0,
//   email: "",
//   isActive: false,
//   tags: [],
//   profile: {
//     bio: undefined,
//     avatar: null,
//     preferences: {
//       theme: "light",
//       notifications: true
//     }
//   }
// }
*/
