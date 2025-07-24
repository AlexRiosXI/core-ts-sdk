import axios from 'axios'
import { MutationRequest, Request } from '../types'
import { buildUrl } from '../utils/helpers'

const handleError = (error: any) => {
    if (error.response === undefined) {
        return {
            status: 500,
            data: {
                error: 'Internal server error'
            }
        }
    }
    return error.response
}



export const axiosClient = async (request: Request) => {
    const url = buildUrl(request.baseUrl, request.path, request.params || {})
    const headers = {
        'Content-Type': request.contentType,
        'Accept': request.responseType
    }
    switch (request.method) {
        case 'GET':
            try {                
                return await axios.get(url, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'POST':
            try {
                return await axios.post(url, request.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'PUT':
            try {
                return await axios.put(url, request.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'DELETE':
            try {
                return await axios.delete(url, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'PATCH':
            try {
                return await axios.patch(url, request.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        default:
            throw new Error(`Method ${request.method} not supported`)
    }
}


export const axiosMutation = async (mutation: MutationRequest) => {
    const url = buildUrl(mutation.baseUrl, mutation.path, mutation.params || {})
    const headers = {
        'Content-Type': mutation.contentType,
        'Accept': mutation.responseType
    }
    switch (mutation.method) {
        case 'POST':
            try {
                return await axios.post(url, mutation.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'PUT':
            try {
                return await axios.put(url, mutation.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'DELETE':
            try {
                return await axios.delete(url, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        case 'PATCH':
            try {
                return await axios.patch(url, mutation.body, { headers })
            } catch (error: any) {
                return handleError(error)
            }
        default:
            throw new Error(`Method ${mutation.method} not supported`)
    }
}