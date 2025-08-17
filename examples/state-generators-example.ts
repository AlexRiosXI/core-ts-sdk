/**
 * Ejemplo de uso de la función generateInitialState
 * Muestra cómo generar estados iniciales a partir de schemas de Zod
 */

import { z } from "zod";
import { generateInitialState } from "../src/utils/stateGenerators";

// 1. Schema básico
const basicUserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  isActive: z.boolean(),
});

const basicState = generateInitialState(basicUserSchema);

// Resultado esperado:
// { name: "", age: 0, email: "", isActive: false }

// 2. Schema con tipos opcionales y nullables
const advancedUserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  bio: z.string().optional(),
  avatar: z.string().nullable(),
  tags: z.array(z.string()),
  preferences: z.object({
    theme: z.string().default("dark"),
    notifications: z.boolean().default(true),
    language: z.string().optional(),
  }),
});

const advancedState = generateInitialState(advancedUserSchema);

// 3. Schema con arrays anidados
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  categories: z.array(z.string()),
  variants: z.array(
    z.object({
      size: z.string(),
      color: z.string(),
      stock: z.number(),
    }),
  ),
  metadata: z.object({
    tags: z.array(z.string()).default([]),
    rating: z.number().optional(),
    reviews: z
      .array(
        z.object({
          user: z.string(),
          comment: z.string(),
          rating: z.number(),
        }),
      )
      .default([]),
  }),
});

const productState = generateInitialState(productSchema);

// 4. Schema con tipos complejos
const formSchema = z.object({
  personalInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      country: z.string(),
      postalCode: z.string(),
    })
    .optional(),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    notifications: z.boolean().default(true),
    theme: z.enum(["light", "dark", "auto"]).default("auto"),
  }),
  tags: z.array(z.string()).default([]),
});

const formState = generateInitialState(formSchema);

// 5. Uso en React con useState

// 6. Comparación con la función anterior

import { emptyFromSchema } from "../src/utils/helpers";

const comparisonSchema = z.object({
  name: z.string(),
  age: z.number(),
  isActive: z.boolean(),
});

const state1 = generateInitialState(comparisonSchema);
const state2 = emptyFromSchema(comparisonSchema);
