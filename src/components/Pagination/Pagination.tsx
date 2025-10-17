import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    isFetching: boolean;
    onPageChange: (page: number) => void;
}

const MAX_PAGES_VISIBLE = 5;

const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    isFetching, 
    onPageChange 
}) => {
    const pages = React.useMemo(() => {
        const pagesArray: (number | '...')[] = [];
        const start = Math.max(2, currentPage - Math.floor(MAX_PAGES_VISIBLE / 2) + 1);
        const end = Math.min(totalPages - 1, currentPage + Math.floor(MAX_PAGES_VISIBLE / 2));

        if (totalPages > 0) {
            pagesArray.push(1);
        }

        if (start >= 3) {
            pagesArray.push('...');
        }

        for (let i = start; i <= end; i++) {
            pagesArray.push(i);
        }

        if (end < totalPages - 1) {
            pagesArray.push('...');
        }

        if (totalPages > 1 && !pagesArray.includes(totalPages)) {
            pagesArray.push(totalPages);
        }
        
        return pagesArray;
    }, [currentPage, totalPages]);

    const handlePrev = () => onPageChange(currentPage - 1);
    const handleNext = () => onPageChange(currentPage + 1);
    const handlePageClick = (pageNumber: number) => onPageChange(pageNumber);

    const isPrevDisabled = currentPage <= 1 || isFetching;
    const isNextDisabled = currentPage >= totalPages || isFetching;
    
    if (totalPages <= 1) return null;

    return (
        <div className="items-center space-x-2 text-white font-medium lg:flex hidden">
            <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                className="p-3 rounded-full bg-gray-700 hover:bg-red-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition duration-150"
                aria-label="Previous Page"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <div className="flex space-x-1">
                {pages.map((page:number|string, index:number) => {
                    if (page === '...') {
                        return <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">...</span>;
                    }

                    const isActive = page === currentPage;
                    
                    return (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page as number)}
                            disabled={isFetching}
                            className={`px-4 py-2 rounded-lg transition duration-150 text-sm 
                                ${isActive 
                                    ? 'bg-red-600 text-white shadow-lg' 
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="p-3 rounded-full bg-gray-700 hover:bg-red-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition duration-150"
                aria-label="Next Page"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>
    );
};

export default Pagination;