import type { PaginatedResponse } from '@/types/api';
import { apiClient } from './AxiosInstance';
import type { Movie, MoviesData, MoviesResponse } from '@/types/movie';

export const MOVIE_KEYS = {
  popular: ['movies', 'popular'],
  details: (id: number) => ['movie', 'details', id],
  search: (query: string, page: number) => ['movies', 'search', query, page],
  genres: ['genres'],
};

export interface Genre {
  id: number;
  name: string;
}

interface GenreListResponse {
  genres: Genre[];
}

export const getAllMovies = async (params: {
  page: number;
}): Promise<MoviesResponse> => {
  const response = await apiClient<MoviesResponse>({
    url: '/movie/popular',
    method: 'GET',
    params,
  });
  return response;
};

export const getMovie = async (movieId: number): Promise<Movie> => {
  const response = await apiClient<Movie>({
    url: `/movie/${movieId}`,
    method: 'GET',
  });
  return response;
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<MoviesData> => {
  if (!query.trim()) {
    return { movies: [], currentPage: 1, totalPages: 1, totalResults: 0 };
  }

  const response = await apiClient<PaginatedResponse<Movie>>({
    url: `/search/movie`,
    method: 'GET',
    params: {
      query: query,
      page: page,
    },
  });

  return {
    movies: response.results as Movie[],
    currentPage: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
};

export const fetchMovieGenres = async (): Promise<Genre[]> => {
  const response = await apiClient<GenreListResponse>({
    url: '/genre/movie/list',
    method: 'GET',
  });

  return response.genres;
};