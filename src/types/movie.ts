import type { PaginatedResponse } from "./api";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  backdrop_path: string | null;
  runtime: number | null;
  genres: Genre[];
  credits?: Credits;
  videos?: {
    results: Video[];
  };
}

export interface MoviesData {
    movies: Movie[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: 'YouTube' | string;
  type: 'Trailer' | 'Teaser' | string;
}

export type MoviesResponse = PaginatedResponse<Movie>;