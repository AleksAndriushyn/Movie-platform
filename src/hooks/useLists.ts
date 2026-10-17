import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToList, getList, getListMembership, getLoginUrl, ME_KEYS, removeFromList } from '@/api/me';
import { TMDB_MAX_PAGES } from '@/api/AxiosInstance';
import type { MoviesData } from '@/types/movie';
import type { ListMembership, MovieListName } from '@/types/user';
import { useCurrentUser } from './useAuth';

export const useListMembership = () => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ME_KEYS.membership,
    queryFn: getListMembership,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMovieList = (list: MovieListName, page: number, enabled: boolean) => {
  return useQuery({
    queryKey: ME_KEYS.list(list, page),
    queryFn: () => getList(list, page),
    enabled,
    placeholderData: (previousData) => previousData,
    select: (data): MoviesData => ({
      movies: data.results,
      totalPages: Math.min(data.total_pages, TMDB_MAX_PAGES),
      currentPage: data.page,
      totalResults: data.total_results,
    }),
  });
};

/** Whether a movie is in a list, and a toggle that updates the UI before the API answers. */
export const useListToggle = (list: MovieListName, movieId: number) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data: membership } = useListMembership();

  const isInList = membership?.[list].includes(movieId) ?? false;

  const mutation = useMutation({
    mutationFn: (add: boolean) => (add ? addToList(list, movieId) : removeFromList(list, movieId)),
    onMutate: async (add) => {
      await queryClient.cancelQueries({ queryKey: ME_KEYS.membership });
      const previous = queryClient.getQueryData<ListMembership>(ME_KEYS.membership);
      if (previous) {
        const ids = previous[list].filter((id) => id !== movieId);
        queryClient.setQueryData<ListMembership>(ME_KEYS.membership, {
          ...previous,
          [list]: add ? [movieId, ...ids] : ids,
        });
      }
      return { previous };
    },
    onError: (_error, _add, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ME_KEYS.membership, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEYS.membership });
    },
  });

  const toggle = () => {
    if (!user) {
      window.location.assign(getLoginUrl(window.location.pathname + window.location.search));
      return;
    }
    mutation.mutate(!isInList);
  };

  return { isInList, toggle, isPending: mutation.isPending };
};
