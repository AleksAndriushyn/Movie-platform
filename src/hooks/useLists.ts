import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToList, getList, getListMembership, getLoginUrl, ME_KEYS, rateMovie, removeFromList, removeRating } from '@/api/me';
import { TMDB_MAX_PAGES } from '@/api/AxiosInstance';
import type { MoviesData } from '@/types/movie';
import type { ListMembership, MovieListName, UserListName } from '@/types/user';
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

export const useMovieList = (list: UserListName, page: number, enabled: boolean) => {
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

const redirectToLogin = () =>
  window.location.assign(getLoginUrl(window.location.pathname + window.location.search));

/**
 * Applies a change to the cached membership right away and rolls it back if the API fails,
 * so toggles and stars react instantly.
 */
const useOptimisticMembership = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  apply: (membership: ListMembership, variables: TVariables) => ListMembership
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey: ME_KEYS.membership });
      const previous = queryClient.getQueryData<ListMembership>(ME_KEYS.membership);
      if (previous) {
        queryClient.setQueryData<ListMembership>(ME_KEYS.membership, apply(previous, variables));
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ME_KEYS.membership, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEYS.membership });
    },
  });
};

/** Whether a movie is in a list, and a toggle that updates the UI before the API answers. */
export const useListToggle = (list: MovieListName, movieId: number) => {
  const { data: user } = useCurrentUser();
  const { data: membership } = useListMembership();

  const isInList = membership?.[list].includes(movieId) ?? false;

  const mutation = useOptimisticMembership(
    (add: boolean) => (add ? addToList(list, movieId) : removeFromList(list, movieId)),
    (previous, add) => {
      const ids = previous[list].filter((id) => id !== movieId);
      return { ...previous, [list]: add ? [movieId, ...ids] : ids };
    }
  );

  const toggle = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    mutation.mutate(!isInList);
  };

  return { isInList, toggle, isPending: mutation.isPending };
};

/** The user's score for a movie; null clears it. */
export const useMovieRating = (movieId: number) => {
  const { data: user } = useCurrentUser();
  const { data: membership } = useListMembership();

  const rating: number | null = membership?.ratings[movieId] ?? null;

  const mutation = useOptimisticMembership(
    (score: number | null) => (score === null ? removeRating(movieId) : rateMovie(movieId, score)),
    (previous, score) => {
      const ratings = { ...previous.ratings };
      if (score === null) {
        delete ratings[movieId];
      } else {
        ratings[movieId] = score;
      }
      return { ...previous, ratings };
    }
  );

  const setRating = (score: number | null) => {
    if (!user) {
      redirectToLogin();
      return;
    }
    mutation.mutate(score);
  };

  return { rating, setRating, isPending: mutation.isPending };
};
