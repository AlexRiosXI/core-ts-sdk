import { useState } from 'react'
import { axiosClient } from '../client/apiClient'
import { MutationRequest}from '../types'



const useMutation = <T> (mutation: MutationRequest) => {
    const [data, setData] = useState<T | null>(null)
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
    return {
        data,
        error,
        status,
        mutate,
        reset,
        isLoading
    }
}

export default useMutation