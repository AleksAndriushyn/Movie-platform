import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useMovie } from '@/hooks/useMovie';
import { getImageUrl } from '@/utils/image-helper';
import Spinner from '@/components/UI/Spinner';
import clsx from 'clsx';

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

        <div className="md:ml-10 pt-4 mt-48 md:mt-0">
          <h1 className="movie-title">{movie.title}</h1>

          <div className="flex items-center space-x-4 mb-6">
            <p className="movie-meta-item">
              {new Date(movie.release_date).getFullYear()}
            </p>

            <button className="movie-trailer-button">Watch Trailer</button>
          </div>

          <h2 className="movie-overview-title">Overview</h2>
          <p className="text-gray-300 leading-relaxed max-w-4xl">
            {movie.overview}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-12 border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold mb-4">Cast & Crew</h2>
        <div className="text-gray-500">
          <p>... Load more data here (e.g., cast, genres, runtime) ...</p>
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
