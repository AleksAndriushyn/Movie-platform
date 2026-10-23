import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteReview,
  getModerationQueue,
  getMovieReviews,
  getOwnReview,
  getTmdbReviews,
  moderateReview,
  reportReview,
  REVIEW_KEYS,
  writeReview,
} from '@/api/reviews';
import type { ReportReason } from '@/types/review';
import { useCurrentUser } from './useAuth';

const nextPage = (last: { page: number; totalPages: number }) =>
  last.page < last.totalPages ? last.page + 1 : undefined;

export const useMovieReviews = (movieId: number) => {
  return useInfiniteQuery({
    queryKey: REVIEW_KEYS.movie(movieId),
    queryFn: ({ pageParam }) => getMovieReviews(movieId, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    staleTime: 1000 * 60,
  });
};

export const useTmdbReviews = (movieId: number, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: REVIEW_KEYS.tmdb(movieId),
    queryFn: ({ pageParam }) => getTmdbReviews(movieId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPage({ page: last.page, totalPages: last.total_pages }),
    enabled,
    staleTime: 1000 * 60 * 60,
  });
};

export const useOwnReview = (movieId: number) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: REVIEW_KEYS.own(movieId),
    queryFn: () => getOwnReview(movieId),
    enabled: !!user,
  });
};

/** Writes or deletes the signed-in user's review, then refreshes both their review and the public list. */
export const useOwnReviewMutations = (movieId: number) => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.own(movieId) });
    queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.movie(movieId), exact: true });
  };

  const save = useMutation({
    mutationFn: ({ body, containsSpoilers }: { body: string; containsSpoilers: boolean }) =>
      writeReview(movieId, body, containsSpoilers),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: () => deleteReview(movieId),
    onSuccess: refresh,
  });

  return { save, remove };
};

export const useReportReview = (movieId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: number; reason: ReportReason }) =>
      reportReview(reviewId, reason),
    onSettled: () => queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.movie(movieId), exact: true }),
  });
};

export const useModerationQueue = (page: number, enabled: boolean) => {
  return useQuery({
    queryKey: [...REVIEW_KEYS.moderation, page],
    queryFn: () => getModerationQueue(page),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, action }: { reviewId: number; action: 'restore' | 'remove' }) =>
      moderateReview(reviewId, action),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.moderation });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
