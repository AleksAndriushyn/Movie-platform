import axios from "axios";
import type { ApiRequestConfig } from "@/types/api";

const API_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.themoviedb.org/3';

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
  headers: {
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
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
      throw new ApiError(
        error.response.data?.status_message || error.message,
        error.response.status
      );
    }
    throw error;
  }
};
