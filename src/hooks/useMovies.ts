import { useQuery } from '@tanstack/react-query';
import { getAllMovies, getMovie, getMoviesByGenre, MOVIE_KEYS, searchMovies } from '@/api/movies';
import type { Movie, MoviesData } from '@/types/movie';
import { TMDB_MAX_PAGES } from '@/api/AxiosInstance';

export const useMovies = (params: { page: number }) => {
  return useQuery({
		queryKey: [...MOVIE_KEYS.popular, params.page],
		queryFn: () => getAllMovies(params),

		select: (data): MoviesData => ({
			movies: data.results.filter((movie) => movie.poster_path),
			totalPages: Math.min(data.total_pages, TMDB_MAX_PAGES),
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

export const useSearchMovies = (query: string, page: number) => {
  const finalQuery = query.trim();

  return useQuery({
		queryKey: MOVIE_KEYS.search(finalQuery, page),
		queryFn: () => searchMovies(finalQuery, page),

		enabled: !!finalQuery,
		staleTime: 1000 * 60 * 5,
		placeholderData: (previousData) => previousData,
		select: (data): MoviesData => ({
			movies: data.results.filter((movie: Movie) => movie.poster_path),
			totalPages: Math.min(data.total_pages, TMDB_MAX_PAGES),
			currentPage: data.page,
			totalResults: data.total_results,
		}),
	});
};

export const useMoviesByGenre = (genreId: number, page: number) => {
	return useQuery({
		queryKey: ["movies", "byGenre", genreId, page],
		queryFn: () => getMoviesByGenre(genreId, page),
		select: (data): MoviesData => ({
			movies: data.results.filter((movie: Movie) => movie.poster_path),
			totalPages: Math.min(data.total_pages, TMDB_MAX_PAGES),
			currentPage: data.page,
			totalResults: data.total_results,
		}),
		placeholderData: (previousData) => previousData,
	});
};