import type { PaginatedResponse } from "./api";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  backdrop_path: string | null;
}

export interface MoviesData {
    movies: Movie[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
}

export type MoviesResponse = PaginatedResponse<Movie>;