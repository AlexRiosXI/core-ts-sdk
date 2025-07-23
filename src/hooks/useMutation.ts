import { useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { MutationRequest}from '../types'
import { generateInitialState } from '../utils/stateGenerators'
import { z } from 'zod'




const useMutation =  (mutation: MutationRequest) => {

    type T = z.infer<typeof mutation.schema>
    
    const [data, setData] = useState<T | null>(generateInitialState(mutation.schema) as T)
    const [errors, setErrors] = useState<z.infer<typeof mutation.schema> | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const mutate = async () => {
        console.log("mutate")
      
        const result = mutation.schema.safeParse(data)
        if (!result.success) {
            console.log("error")
            setErrors(result.error.flatten().fieldErrors)
            return false
        }else{
            setErrors(null)
        }
        
      
        

        return "hola"
        const response = await axiosClient(mutation)
        setData(response.data)
        setStatus(response.status)
        setError(response.error)
        setIsLoading(false)
        return response
    }

    const reset = () => {
        setData(null)
        setError(null)
        setStatus(0)
    }


    //Props generation
          const handleChange = (name: keyof T) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        setData((prev: any) => ({
          ...(prev || {}),
          [name]: e.target.value,
        } as T));


      };
    
      const register = (name: keyof T) => ({
        name,
        value: data?.[name] ?? "",
        onChange: handleChange(name),
        isInvalid: !!errors?.[name] ,
        errorMessage: errors?.[name]?.[0]
      });
    

  

    return {
        data,
        error,
        status,
        mutate,
        reset,
        isLoading,
        register,
        errors
        
    }
}

export default useMutation