import type { AxiosRequestConfig } from "axios";

export interface ApiRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, unknown>;
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}