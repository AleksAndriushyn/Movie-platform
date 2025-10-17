import axios from "axios";
import type { ApiRequestConfig } from "@/types/api";

const API_KEY_V3 = import.meta.env.VITE_TMDB_API_KEY_V3;
const API_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.themoviedb.org/3';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: API_ACCESS_TOKEN ? `Bearer ${API_ACCESS_TOKEN}` : undefined,
  }
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
      throw new Error(error.response.data?.status_message || error.message);
    }
    throw error;
  }
};

apiInstance.interceptors.request.use((config) => {
    if (API_KEY_V3) {
        config.params = {
            ...config.params,
            api_key: API_KEY_V3,
        };
    }
    return config;
});