
import { MOVIE_KEYS, searchMovies } from '@/api/movies';
import type { Movie, MoviesData } from '@/types/movie';
import { useQuery } from '@tanstack/react-query';

export const useSearchMovies = (query: string, page: number) => {
  const finalQuery = query.trim();

  return useQuery({
    queryKey: MOVIE_KEYS.search(finalQuery, page),
    queryFn: () => searchMovies(finalQuery, page),

    enabled: !!finalQuery,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    select: (data): MoviesData => ({
      movies: data.results.filter((movie: Movie) => movie.poster_path).slice(0, 20),
      totalPages: data.total_pages,
      currentPage: data.page,
      totalResults: data.total_results,
    }),
  });
};
