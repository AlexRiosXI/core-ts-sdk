



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


