import { useEffect, useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { Request } from '../types'



const useRequest = <T> (request: Request) => {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)
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

    const reset = () => {
        setData(null)
        setError(null)
        setStatus(0)
    }
    useEffect(() => {
        if (request.autoQuery) {
            query()
        }
    }, [])
    return {
        data,
        error,
        status,
        query,
        reset,
        isLoading
    }
}

export default useRequest