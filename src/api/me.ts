import { apiClient, ApiError } from './AxiosInstance';
import type { MoviesResponse } from '@/types/movie';
import type { CurrentUser, ListMembership, MovieListName } from '@/types/user';

export const ME_KEYS = {
  user: ['me'],
  membership: ['me', 'lists'],
  list: (list: MovieListName, page: number) => ['me', 'lists', list, page],
};

// A full-page navigation: the API redirects to Google and back to returnUrl
export const getLoginUrl = (returnUrl: string) =>
  `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    return await apiClient<CurrentUser>({ url: '/me', method: 'GET' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};

export const logout = () => apiClient<void>({ url: '/auth/logout', method: 'POST' });

export const getListMembership = () =>
  apiClient<ListMembership>({ url: '/me/lists', method: 'GET' });

export const getList = (list: MovieListName, page: number) =>
  apiClient<MoviesResponse>({ url: `/me/lists/${list}`, method: 'GET', params: { page } });

export const addToList = (list: MovieListName, movieId: number) =>
  apiClient<void>({ url: `/me/lists/${list}/${movieId}`, method: 'PUT' });

export const removeFromList = (list: MovieListName, movieId: number) =>
  apiClient<void>({ url: `/me/lists/${list}/${movieId}`, method: 'DELETE' });
