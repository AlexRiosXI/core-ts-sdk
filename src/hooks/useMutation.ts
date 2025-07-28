import { useEffect, useState } from 'react'
import { axiosClient, axiosMutation } from '../client/apiClient'
import { MutationRequest}from '../types'
import { generateInitialState } from '../utils/stateGenerators'
import { z } from 'zod'






const useMutation =  (mutation: MutationRequest) => {

    type T = z.infer<typeof mutation.schema>
    
    const [data, setData] = useState<T | null>(generateInitialState(mutation.schema) as T)
    const [errors, setErrors] = useState<z.infer<typeof mutation.schema> | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<number>(0)
    const [fetchedExistingData, setFetchedExistingData] = useState(false)
    
    const [isLoading, setIsLoading] = useState<boolean>(mutation.initialLoading ?? false)


    const fetchExistingData = async () => {
      if(mutation.existingDataRequest){
      const response = await axiosClient(mutation.existingDataRequest)
      console.log(response, "response")
      setData(response.data)
      setStatus(response.status)
      setError(response.error)
      setIsLoading(false)
      setFetchedExistingData(true)
      if(error){
        throw error
      }
    }
    }

    
    const mutate = async (onSuccess: (data: T) => void = () => {}, onError: (error: Error) => void = () => {}) => {
        const result = mutation.schema.safeParse(data)
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors)
            return false
        }else{
            setErrors(null)
        }
        mutation.body = data
        const response = await axiosMutation(mutation)
        if(response.status === mutation.succesfulStatusCode){
          
          onSuccess(response.data)
        }else{
          if(response.data){
            setError(response.data.error)
            onError(response.data.error)
          }else{
            setError(response.error)
            onError(response.error)
          }
        }
        setStatus(response.status)
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
        errorMessage: errors?.[name]?.[0],
        isDisabled: isLoading
      });
    
      //Partial validation tool
      const partialValidation = (fields: string[]) => {
        const result = mutation.schema.safeParse(data)
        if (!result.success) {
          const fieldErrorsTyped: Record<string, string[]> = result.error.flatten().fieldErrors as Record<string, string[]>;
          const filteredErrors: Record<string, string[]> = {};
          for (const field of fields) {
            if (fieldErrorsTyped[field]) {
              filteredErrors[field] = fieldErrorsTyped[field]!;
            }
          }
          if (Object.keys(filteredErrors).length > 0) {
            setErrors(filteredErrors)
            return false
          }
        }
      
        setErrors(null)
        return true
      }


      useEffect(() => {
        if(mutation.existingDataRequest && !fetchedExistingData){
          fetchExistingData()
        }
      }, [mutation.existingDataRequest, fetchedExistingData])


      useEffect(() => { 
      setErrors(null)
      }, [data])
   
      

    return {
        data,
        error,
        status,
        mutate,
        reset,
        isLoading,
        register,
        errors,
        partialValidation,
        setErrors,
        
        
    }
}

export default useMutation