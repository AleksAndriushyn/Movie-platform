import { type Genre, MOVIE_KEYS, fetchMovieGenres } from '@/api/movies';
import { useQuery } from '@tanstack/react-query';

export const useMovieGenres = () => {
    return useQuery<Genre[], Error>({
        queryKey: MOVIE_KEYS.genres,
        queryFn: fetchMovieGenres,
        staleTime: 1000 * 60 * 60,
        placeholderData: (previousData) => previousData,
    });
};

export default useMovieGenres;