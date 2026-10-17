export interface CurrentUser {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export type MovieListName = 'favorites' | 'watchlist';

export type ListMembership = Record<MovieListName, number[]>;
