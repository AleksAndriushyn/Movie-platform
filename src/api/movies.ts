import type { PaginatedResponse } from '@/types/api';
import { apiClient } from './AxiosInstance';
import type { Genre, Movie, MoviesResponse } from '@/types/movie';

export const MOVIE_KEYS = {
  popular: ['movies', 'popular'],
  details: (id: number) => ['movie', 'details', id],
  search: (query: string, page: number) => ['movies', 'search', query, page],
  byGenre: (genreId: number, page: number) => ['movies', 'byGenre', genreId, page],
  genres: ['genres'],
};

type GenreListResponse = {
  genres: Genre[];
}

export const getAllMovies = async (params: {
  page: number;
}): Promise<MoviesResponse> => {
  const response = await apiClient<MoviesResponse>({
    url: '/movies/popular',
    method: 'GET',
    params,
  });
  return response;
};

export const getMovie = async (movieId: number): Promise<Movie> => {
  const response = await apiClient<Movie>({
    url: `/movies/${movieId}`,
    method: 'GET',
  });
  return response;
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<MoviesResponse> => {
  const response = await apiClient<MoviesResponse>({
    url: '/movies/search',
    method: 'GET',
    params: {
      query: query,
      page: page,
    },
  });

  return response;
};

export const fetchMovieGenres = async (): Promise<Genre[]> => {
  const response = await apiClient<GenreListResponse>({
    url: '/genres',
    method: 'GET',
  });

  return response.genres;
};

export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<PaginatedResponse<Movie>> => {
  const response = await apiClient<PaginatedResponse<Movie>>({
    url: `/genres/${genreId}/movies`,
    method: 'GET',
    params: {
      page: page,
    },
  });
  return response;
};