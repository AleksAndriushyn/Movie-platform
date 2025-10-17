import React from 'react';
import type { Movie } from '@/types/movie';
import { getImageUrl } from '@/utils/image-helper';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const rating = movie.vote_average.toFixed(1);
  const ratingColor = 
    movie.vote_average >= 8 ? 'bg-green-600' :
    movie.vote_average >= 6 ? 'bg-yellow-600' :
    'bg-red-600';

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer">
        <div className="relative">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          
          <div className={`absolute top-2 left-2 ${ratingColor} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}>
            {rating}
          </div>
        </div>

        <div className="p-4">
          <h3 
            title={movie.title} 
            className="text-lg font-semibold text-white truncate mb-1 hover:text-red-500 transition duration-150"
          >
            {movie.title}
          </h3>
          
          <p className="text-sm text-gray-400">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </p>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {movie.overview || 'Описание отсутствует.'}
          </p>
        </div>
      </div>
    </Link>
  );
};