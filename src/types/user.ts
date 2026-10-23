export interface CurrentUser {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  /** Shows the moderation link; the API checks admin rights itself. */
  isAdmin: boolean;
}

export type MovieListName = 'favorites' | 'watchlist';

/** Everything with its own page under the account menu. */
export type UserListName = MovieListName | 'ratings';

export interface ListMembership {
  favorites: number[];
  watchlist: number[];
  /** The user's 1-10 score by movie id. */
  ratings: Record<number, number>;
}
