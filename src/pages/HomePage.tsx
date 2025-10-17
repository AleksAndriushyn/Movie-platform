import React, { useState } from 'react';
import { usePopularMovies } from '@/hooks/usePopularMovies';
import Header from '@/components/Layout/Header';
import Pagination from '@/components/Pagination/Pagination';
import { MovieGrid } from '@/components/Movies/MovieGrid/MovieGrid';
import Spinner from '@/components/UI/Spinner';

const HomePage: React.FC = () => {
    const [page, setPage] = useState(1);
    
    const { data, isLoading, isError, isFetching } = usePopularMovies({ page });
    
    const movies = data?.movies || [];
    const totalPages = data?.totalPages || 1;
    const currentPage = data?.currentPage || 1;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (isError) {
        return <div className="text-center p-20 text-red-500 bg-gray-900 min-h-screen">Error loading data. Please try again later.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex justify-between gap-4 items-center mb-6 border-b border-red-800/50 pb-4">
                
                    <h1 className="text-5xl font-extrabold text-white shrink-0">
                        🔥 Trending Now
                    </h1>

                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        isFetching={isFetching}
                        onPageChange={handlePageChange}
                    />
                </div>

                {isLoading ? (
                    <div className="text-center p-20 text-gray-400 text-xl">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div className={isFetching ? 'opacity-50 transition' : 'transition'}>
                            <MovieGrid data={movies} /> 
                        </div>
                        
                        <div className="flex justify-center mt-12">
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                isFetching={isFetching}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default HomePage;