import {
    z,
    ZodObject,
    ZodRawShape,
    ZodType,
    ZodString,
    ZodNumber,
    ZodBoolean,
    ZodArray
  } from "zod"
  
  export function emptyFromSchema<T extends ZodObject<ZodRawShape>>(schema: T): z.infer<T> {
    const shape = schema.shape
    const result: any = {}
  
    for (const key in shape) {
      const field = unwrapAll(schema.shape[key] as ZodType<unknown, any, any>)
  
      if (field instanceof ZodString) {
        result[key] = ""
      } else if (field instanceof ZodNumber) {
        result[key] = 0
      } else if (field instanceof ZodBoolean) {
        result[key] = false
      } else if (field instanceof ZodArray) {
        result[key] = []
      } else if (field instanceof ZodObject) {
        result[key] = emptyFromSchema(field)
      } else {
        result[key] = null
      }
    }
  
    return result
  }
  
  function unwrapAll(schema: ZodType<unknown, any, any>): ZodType<unknown, any, any> {
    let current: ZodType<unknown, any, any> = schema
  
    while (typeof (current as any).unwrap === "function") {
      current = (current as any).unwrap()
    }
  
    return current
  }
  

export const buildUrl = (baseUrl: string, path: string, params: Record<string, string>) => {
    if (!baseUrl.endsWith('/')) {
        baseUrl = `${baseUrl}/`
    }
    if (path.startsWith('/')) {
        path = path.slice(1)
    }
    if (params) {
        const queryString = new URLSearchParams(params).toString()
        path = `${path}?${queryString}`
    }
    return `${baseUrl}${path}`
}






// ... existing code ...

/**
 * Parsea un valor según el tipo que solicita el schema de Zod
 * @param value - El valor a parsear
 * @param fieldSchema - El schema del campo específico
 * @returns El valor parseado al tipo correcto
 */
export function parseValueBySchema(value: string, fieldSchema: z.ZodTypeAny): any {
  // Maneja tipos opcionales y nullables
  if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodNullable) {
    const unwrappedSchema = fieldSchema.unwrap() as z.ZodTypeAny;
    return parseValueBySchema(value, unwrappedSchema);
  }

  // Maneja tipos con valores por defecto
  if (fieldSchema instanceof z.ZodDefault) {
    const unwrappedSchema = (fieldSchema as any).unwrap() as z.ZodTypeAny;
    return parseValueBySchema(value, unwrappedSchema);
  }

  // Parsear según el tipo
  if (fieldSchema instanceof z.ZodNumber) {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (fieldSchema instanceof z.ZodBoolean) {
    return value === 'true' || value === '1' || value === 'on';
  }

  if (fieldSchema instanceof z.ZodString) {
    return value;
  }

  if (fieldSchema instanceof z.ZodArray) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  // Para otros tipos, devolver el valor tal como está
  return value;
}

export function getFieldSchema(schema: z.ZodTypeAny, fieldName: string): z.ZodTypeAny | null {
  if (schema instanceof z.ZodObject) {
    return schema.shape[fieldName] || null;
  }
  
  // Para otros tipos de schemas, intentar acceder a shape si existe
  if ('shape' in schema && typeof schema.shape === 'object') {
    return (schema.shape as any)[fieldName] || null;
  }
  
  return null;
}