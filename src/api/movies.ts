import { apiClient } from "./AxiosInstance";
import type { Movie, PopularMoviesResponse } from "@/types/movie";

export const MOVIE_KEYS = {
  popular: ['movies', 'popular'],
    details: (id: number) => ['movie', 'details', id], 
    search: (query: string, page: number) => ['movies', 'search', query, page],
};

export const getPopularMovies = async (params: { page: number }): Promise<PopularMoviesResponse> => {
    const response = await apiClient<PopularMoviesResponse>({ url: '/movie/popular', method: 'GET', params });
    return response;
}

export const getMovie = async (movieId: number): Promise<Movie> => {
    const response = await apiClient<Movie>({
        url: `/movie/${movieId}`, 
        method: 'GET',
    });
    return response;
};