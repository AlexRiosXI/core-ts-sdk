import { z } from "zod";

export type Request = {
    baseUrl: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
    responseType: 'json' | 'text' | 'blob' | 'arrayBuffer';
    timeout: number;
    contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
}

export type MutationRequest = {
    baseUrl: string;
    schema: z.ZodSchema;
    path: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
    responseType: 'json' | 'text' | 'blob' | 'arrayBuffer';
    timeout: number;
    contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
}