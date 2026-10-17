import axios from "axios";
import type { ApiRequestConfig } from "@/types/api";

// Same-origin MovieVerse API: Vite proxies /api in dev, Vercel rewrites it in production.
// The TMDB token lives only on the server.
const API_BASE_URL = '/api';

export const TMDB_MAX_PAGES = 500;

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const apiClient = async <T>({
    url,
    method,
    data,
    params,
    config
}: ApiRequestConfig): Promise<T> => {
  try {
    const response = await apiInstance.request<T>({
      url,
      method,
      data,
      params,
      ...config,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // the API answers errors with ProblemDetails
      const problem = error.response.data;
      throw new ApiError(
        problem?.detail || problem?.title || error.message,
        error.response.status
      );
    }
    throw error;
  }
};
