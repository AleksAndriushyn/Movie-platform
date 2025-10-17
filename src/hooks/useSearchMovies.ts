
import { MOVIE_KEYS, searchMovies } from '@/api/movies';
import { useQuery } from '@tanstack/react-query';

export const useSearchMovies = (query: string, page: number) => {
  const finalQuery = query.trim();

  return useQuery({
    queryKey: MOVIE_KEYS.search(finalQuery, page),
    queryFn: () => searchMovies(finalQuery, page),

    enabled: !!finalQuery,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};
