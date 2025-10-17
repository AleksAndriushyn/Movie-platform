import { useQuery } from '@tanstack/react-query';
import { getPopularMovies } from '@/api/movies';
import type { PopularMoviesData } from '@/types/movie';

export const usePopularMovies = (params: { page: number }) => {
    return useQuery({
        queryKey: [params.page],
        queryFn: () => getPopularMovies(params),
        
        select: (data): PopularMoviesData => ({
            movies: data.results,
            totalPages: data.total_pages,
            currentPage: data.page,
        }),
    });
};