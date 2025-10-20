import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useMovie } from '@/hooks/useMovie';
import { getImageUrl } from '@/utils/image-helper';
import Spinner from '@/components/UI/Spinner';
import clsx from 'clsx';
import formatRuntime from '@/utils/format-runtime';
import CastCard from '@/components/Cast/CastCard';

const MoviePage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const id = Number(movieId);
  const { data: movie, isLoading, isError } = useMovie(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movie]);

  if (isLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (isError || !movie) {
    return (
      <Layout>
        <div className="text-center p-20 text-red-500 text-2xl">
          Movie Not Found or API Error.
        </div>
      </Layout>
    );
  }

  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const rating = movie.vote_average.toFixed(1);
  const ratingColor =
    movie.vote_average >= 8
      ? 'bg-green-600'
      : movie.vote_average >= 6
      ? 'bg-yellow-600'
      : 'bg-red-600';

  const director = movie.credits?.crew.find(
    (member) => member.job === 'Director'
  );

  const writers = movie.credits?.crew.filter(
    (member) => member.department === 'Writing'
  );

  const topCast = movie.credits?.cast.slice(0, 15);

  return (
    <div>
      <div className="movie-hero-section">
        <div
          className="movie-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="movie-gradient-overlay" />
      </div>

      <div className="movie-details-container">
        <div className="movie-poster-wrapper">
          <img src={posterUrl} alt={movie.title} className="movie-poster" />

          <div
            className={clsx(
              ratingColor,
              'movie-card-rating movie-page-rating-chip'
            )}
          >
            {rating}
          </div>
        </div>

        <div className="md:ml-10 pt-4 mt-8 md:mt-0 flex-1">
          <h1 className="movie-title">{movie.title}</h1>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-6">
            <p className="movie-meta-item">
              {new Date(movie.release_date).getFullYear()}
            </p>
            <span className="text-gray-500">•</span>
            <p className="movie-meta-item">{formatRuntime(movie.runtime)}</p>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-2 flex-wrap">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="text-sm bg-gray-700 px-2 py-1 rounded">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button className="movie-trailer-button">Watch Trailer</button>
          </div>

          <h2 className="movie-overview-title">Overview</h2>
          <p className="text-gray-300 leading-relaxed max-w-4xl">
            {movie.overview}
          </p>

          {director && (
            <div className="flex items-center mt-2">
              <p className="font-bold text-white mr-2">Director:</p>
              <p className="text-gray-300">{director.name}</p>
            </div>
          )}

          {writers && writers.length > 0 && (
            <div className="flex items-start mt-2">
              <p className="font-bold text-white mr-2 flex-shrink-0">
                {writers.length > 1 ? 'Writers:' : 'Writer:'}
              </p>
              <p className="text-gray-300">
                {writers.map((writer) => writer.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-12 border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold mb-6">Cast</h2>
        <div className="flex overflow-x-auto space-x-6 pb-4
          scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 hover:scrollbar-thumb-gray-500"
        >
          {topCast?.map((actor) => (
            <CastCard key={actor.id} actor={actor} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
