import { apiClient } from './AxiosInstance';
import type { ModerationPage, OwnReview, ReportReason, ReviewPage, TmdbReviewPage } from '@/types/review';

export const REVIEW_KEYS = {
  movie: (movieId: number) => ['reviews', movieId],
  own: (movieId: number) => ['me', 'reviews', movieId],
  tmdb: (movieId: number) => ['reviews', movieId, 'tmdb'],
  moderation: ['admin', 'reviews'],
};

export const getMovieReviews = (movieId: number, page: number) =>
  apiClient<ReviewPage>({ url: `/movies/${movieId}/reviews`, method: 'GET', params: { page } });

export const getTmdbReviews = (movieId: number, page: number) =>
  apiClient<TmdbReviewPage>({ url: `/movies/${movieId}/tmdb-reviews`, method: 'GET', params: { page } });

export const getOwnReview = async (movieId: number): Promise<OwnReview | null> =>
  (await apiClient<{ review: OwnReview | null }>({ url: `/me/reviews/${movieId}`, method: 'GET' })).review;

export const writeReview = (movieId: number, body: string, containsSpoilers: boolean) =>
  apiClient<OwnReview>({ url: `/me/reviews/${movieId}`, method: 'PUT', data: { body, containsSpoilers } });

export const deleteReview = (movieId: number) =>
  apiClient<void>({ url: `/me/reviews/${movieId}`, method: 'DELETE' });

export const reportReview = (reviewId: number, reason: ReportReason) =>
  apiClient<void>({ url: `/reviews/${reviewId}/reports`, method: 'POST', data: { reason } });

export const getModerationQueue = (page: number) =>
  apiClient<ModerationPage>({ url: '/admin/reviews', method: 'GET', params: { page } });

export const moderateReview = (reviewId: number, action: 'restore' | 'remove') =>
  apiClient<void>({ url: `/admin/reviews/${reviewId}/${action}`, method: 'POST' });
