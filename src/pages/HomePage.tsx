import React from 'react';
import { useMovies } from '@/hooks/useMovies';
import Header from '@/components/Layout/Header';
import Pagination from '@/components/Pagination/Pagination';
import { MovieGrid } from '@/components/Movies/MovieGrid/MovieGrid';
import Spinner from '@/components/UI/Spinner';
import { useSearchParams } from 'react-router-dom';

const TMDB_MAX_PAGES = 500;

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlPage = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isError, isFetching } = useMovies({ page: urlPage });

  const movies = data?.movies.filter((movie) => movie.poster_path) || [];
  const apiTotalPages = data?.totalPages || 1;
  const totalPages = Math.min(apiTotalPages, TMDB_MAX_PAGES);

  if (isError) {
    return (
      <div className="text-center p-20 text-red-500 bg-gray-900 min-h-screen">
        Error loading data. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between gap-4 items-center mb-6 border-b border-red-800/50 pb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white shrink-0">
            Trending Now
          </h1>

          <div className='hidden lg:block'>
            <Pagination totalPages={totalPages} isFetching={isFetching} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div
              className={isFetching ? 'opacity-50 transition' : 'transition'}
            >
              <MovieGrid data={movies} />
            </div>

            <div className="flex justify-center mt-12">
              <Pagination totalPages={totalPages} isFetching={isFetching} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
