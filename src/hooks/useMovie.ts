import { getMovie, MOVIE_KEYS } from '@/api/movies';
import { useQuery } from '@tanstack/react-query';

export const useMovie = (movieId: number) => {
  return useQuery({
    queryKey: MOVIE_KEYS.details(movieId), 
    queryFn: () => getMovie(movieId),
    enabled: !!movieId && movieId > 0, 
    staleTime: 1000 * 60 * 60,
  });
};