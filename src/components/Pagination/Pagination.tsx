import clsx from 'clsx';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

type PaginationProps = {
  totalPages: number;
  isFetching: boolean;
  onPageChange?: (page: number) => void;
}

const MAX_PAGES_VISIBLE = 5;

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  isFetching,
  onPageChange = () => {},
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const pages = React.useMemo(() => {
    const pagesArray: (number | '...')[] = [];
    const start = Math.max(
      2,
      currentPage - Math.floor(MAX_PAGES_VISIBLE / 2) + 1
    );
    const end = Math.min(
      totalPages - 1,
      currentPage + Math.floor(MAX_PAGES_VISIBLE / 2)
    );

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

  const handlePrev = () => handlePageChange(currentPage - 1);
  const handleNext = () => handlePageChange(currentPage + 1);

  const isPrevDisabled = currentPage <= 1 || isFetching;
  const isNextDisabled = currentPage >= totalPages || isFetching;

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (newPage > 1) {
        newSearchParams.set('page', String(newPage));
      } else {
        newSearchParams.delete('page');
      }
      setSearchParams(newSearchParams);

      onPageChange(newPage);
    }
  };

  return (
    <div className="pagination-controls">
      <button
        onClick={handlePrev}
        disabled={isPrevDisabled}
        className="pagination-button-arrow"
        aria-label="Previous Page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <div className="flex space-x-1">
        {pages.map((page: number | string, index: number) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                {page}
              </span>
            );
          }

          const isHiddenOnMobile =
            page !== 1 && page !== totalPages && page !== currentPage;
          const isActive = page === currentPage;

          const buttonClasses = clsx(
            'pagination-button',

            { 'hidden sm:block': isHiddenOnMobile },

            isActive ? 'pagination-active' : 'pagination-inactive'
          );

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              disabled={isFetching}
              className={buttonClasses}
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
        className="pagination-button-arrow"
        aria-label="Next Page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
