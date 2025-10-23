import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Pagination from '@/components/Pagination/Pagination';
import { useSearchMovies } from '@/hooks/useSearchMovies';
import Spinner from '@/components/UI/Spinner';
import { MovieGrid } from '@/components/Movies/MovieGrid/MovieGrid';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('query') || '';
  const urlPage = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isFetching, isError, error } = useSearchMovies(
    urlQuery,
    urlPage
  );

  const movies = data?.movies || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

  let content;

  if (!urlQuery.trim()) {
    content = (
      <div className="text-center p-20 text-gray-400 text-xl">
        Start typing in the search bar to find movies and series.
      </div>
    );
  } else if (isLoading) {
    content = <Spinner />;
  } else if (isError) {
    content = (
      <div className="text-center p-20 text-red-500 text-xl">
        An error occurred: {error?.message || 'Could not fetch results.'}
      </div>
    );
  } else if (movies.length === 0 && totalResults === 0 && !isFetching) {
    content = (
      <div className="text-center p-20 text-gray-400 text-xl">
        No results found for "{urlQuery}". Try a different search term.
      </div>
    );
  } else {
    content = (
      <>
        <div className={isFetching ? 'opacity-50 transition' : 'transition'}>
          <MovieGrid movies={movies} />
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Pagination
              totalPages={totalPages}
              isFetching={isFetching}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6 border-b border-red-800/50 pb-4">
        <h1 className="text-5xl font-extrabold text-white shrink-0">
          {urlQuery.trim() ? `Results for "${urlQuery}"` : 'Search'}
        </h1>

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            isFetching={isFetching}
          />
        )}
      </div>

      <main className="pb-12">{content}</main>
    </Layout>
  );
};

export default SearchPage;
