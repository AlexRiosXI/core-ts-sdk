import { useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { MutationRequest}from '../types'
import { generateInitialState } from '../utils/stateGenerators'
import { z } from 'zod'




const useMutation =  (mutation: MutationRequest) => {

    type T = z.infer<typeof mutation.schema>
    
    const [data, setData] = useState<T | null>(generateInitialState(mutation.schema) as T)
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const mutate = async () => {
        setIsLoading(true)
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
        setData((prev) => ({
          ...(prev || {}),
          [name]: e.target.value,
        } as T));
      };
    
      const register = (name: keyof T) => ({
        name,
        value: data?.[name] ?? "",
        onChange: handleChange(name),
      });
    
    return {
        data,
        error,
        status,
        mutate,
        reset,
        isLoading,
        register
    }
}

export default useMutation