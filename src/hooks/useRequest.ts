import { useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { Request } from '../types'




export const testInit = () => {
    return "holas"
  
}



const useRequest =  (request: Request) => {
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const [status, setStatus] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const query = async () => {
        setIsLoading(true)
        const response = await axiosClient(request)
        setData(response.data)
        setStatus(response.status)
        setError(response.error)
        setIsLoading(false)
        return response
    }
    const mutate = async (request: Request) => {
        setIsLoading(true)
        const response = await axiosClient(request)
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
    return {
        data,
        error,
        status,
        query,
        mutate,
        reset,
        isLoading
    }
}

export default useRequest