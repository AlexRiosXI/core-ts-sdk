import { useEffect, useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { Request } from '../types'

type BaseFilters = { page: number; per_page: number }
type FiltersType = BaseFilters & Record<string, unknown>

const useRequest = <T> (request: Request, id: number | string | null, overridePaginate: boolean = false) => {
  
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [filters, setFilters] = useState<FiltersType>({
      page: 1,
      per_page: 10,
    })


    
    const query = async (params = {}) => {
      
      
        setIsLoading(true)
        if(request.paginated){
          
          params = {...params, ...filters}
        }
        if(request.idFieldName && id){
          params = {...params, [request.idFieldName]: id}
        }
        if(overridePaginate){
          delete (params as any).page
          delete (params as any).per_page
        }
        
        const response = await axiosClient(request, params)
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
    const handleChange = (name: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        setFilters({...filters, [name]: e.target.value})
      };
    const register = (name: string) => ({
        name,
        value: filters?.[name] ?? "",
        onChange: handleChange(name),
        
      });
 
    useEffect(() => {
        
        if(request.paginated || overridePaginate){
            if(request.idFieldName){
                query({[request.idFieldName]: id})
            }else{
                query()
            }
        }
        else if (request.autoQuery && !request.paginated ) {
            if(request.idFieldName){   
                query({[request.idFieldName]: id})
            }else{
            query()
            }
        }else{
            return
        }
    }, [filters])
    return {
        data,
        error,
        status,
        query,
        reset,
        isLoading,
        filters,
        setFilters,
        register
    }
}

export default useRequest