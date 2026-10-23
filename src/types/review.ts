export type ReviewStatus = 'visible' | 'hidden' | 'removed';

export type ReportReason = 'spam' | 'offensive' | 'spoilers' | 'other';

export interface ReviewAuthor {
  name: string | null;
  avatarUrl: string | null;
}

export interface Review {
  id: number;
  author: ReviewAuthor;
  body: string;
  containsSpoilers: boolean;
  /** The author's own 1-10 rating of the movie, if they gave one. */
  authorRating: number | null;
  createdAt: string;
  updatedAt: string | null;
  isOwn: boolean;
  reportedByMe: boolean;
}

export interface ReviewPage {
  page: number;
  results: Review[];
  totalPages: number;
  totalResults: number;
}

export interface OwnReview {
  id: number;
  body: string;
  containsSpoilers: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface ModeratedReview {
  id: number;
  movieId: number;
  movieTitle: string | null;
  author: ReviewAuthor;
  authorEmail: string | null;
  body: string;
  containsSpoilers: boolean;
  status: ReviewStatus;
  createdAt: string;
  reportCount: number;
  reasons: Partial<Record<ReportReason, number>>;
}

export interface ModerationPage {
  page: number;
  results: ModeratedReview[];
  totalPages: number;
  totalResults: number;
}

/** TMDB's review shape (snake_case, passed through by the API). */
export interface TmdbReview {
  id: string;
  author: string;
  author_details: { name: string; username: string; rating: number | null };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TmdbReviewPage {
  page: number;
  results: TmdbReview[];
  total_pages: number;
  total_results: number;
}
