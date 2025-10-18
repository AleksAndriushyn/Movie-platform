import React from 'react';
import type { Movie } from '@/types/movie';
import { MovieCard } from '../MovieCard/MovieCard';

interface MovieGridProps {
  data: Movie[];
}

export const MovieGrid: React.FC<MovieGridProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {data.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};