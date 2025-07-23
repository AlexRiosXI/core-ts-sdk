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






