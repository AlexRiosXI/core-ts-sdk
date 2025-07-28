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

const getAccessToken = () => {
    return sessionStorage.getItem('sm-access-token')
}


const getApi = (baseURL: string, headers: any) =>
    axios.create({
      baseURL,
      withCredentials: true,
      headers: headers,
      
    });
  

export const axiosClient = async (request: Request) => {
    
    const headers = {
        'Content-Type': request.contentType,
        'Accept': request.responseType,
        'Authorization': `Bearer ${getAccessToken()}`
    }
    const api = getApi(request.baseUrl, headers)
    switch (request.method) {
        case 'GET':
            try {                
                return await api.get(request.path, { params: request.params })
            } catch (error: any) {
                return handleError(error)
            }
        default:
            throw new Error(`Method ${request.method} not supported`)
    }
}


export const axiosMutation = async (mutation: MutationRequest) => {
    
    const headers = {
        'Content-Type': mutation.contentType,
        'Accept': mutation.responseType,
        'Authorization': `Bearer ${getAccessToken()}`
    }
    const api = getApi(mutation.baseUrl, headers)
    switch (mutation.method) {
        case 'POST':
            try {
                return await api.post(mutation.path, mutation.body)
            } catch (error: any) {
                return handleError(error)
            }
        case 'PUT':
            try {
                return await api.put(mutation.path, mutation.body)
            } catch (error: any) {
                return handleError(error)
            }
        case 'DELETE':
            try {
                return await api.delete(mutation.path)
            } catch (error: any) {
                return handleError(error)
            }
        case 'PATCH':
            try {
                return await api.patch(mutation.path, mutation.body)
            } catch (error: any) {
                return handleError(error)
            }
        default:
            throw new Error(`Method ${mutation.method} not supported`)
    }
}