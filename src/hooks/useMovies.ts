import { useQuery } from '@tanstack/react-query';
import { getAllMovies, getMovie, MOVIE_KEYS } from '@/api/movies';
import type { MoviesData } from '@/types/movie';

export const useMovies = (params: { page: number }) => {
  return useQuery({
    queryKey: [...MOVIE_KEYS.popular, params.page],
    queryFn: () => getAllMovies(params),

    select: (data): MoviesData => ({
      movies: data.results.filter((movie) => movie.poster_path),
      totalPages: data.total_pages,
      currentPage: data.page,
      totalResults: data.total_results,
    }),
  });
};

export const useMovie = (movieId: number) => {
  return useQuery({
    queryKey: MOVIE_KEYS.details(movieId),
    queryFn: () => getMovie(movieId),
    enabled: !!movieId && movieId > 0,
    staleTime: 1000 * 60 * 60,
  });
};
