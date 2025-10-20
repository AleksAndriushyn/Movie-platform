import React from 'react'
import type { CastMember } from '@/types/movie'
import CastCard from './CastCard';
import { useCarousel } from '@/hooks/useCarousel';

const ArrowButton: React.FC<{ onClick: () => void; disabled: boolean; isPrev?: boolean }> = ({
  onClick,
  disabled,
  isPrev,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`absolute top-1/2 -translate-y-1/2 rounded-3xl bg-red-600 px-4 py-2
      text-white font-bold shadow-lg transition-all duration-200 hover:bg-red-700
      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-600
      ${isPrev ? 'left-2' : 'right-2'}`}
  >
    {isPrev ? '<' : '>'}
  </button>
);


interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  const [
    emblaRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext
  ] = useCarousel({
    align: 'start',
    loop: true,
    containScroll: 'trimSnaps',
    dragFree: true
  });

  if (!cast || cast.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {cast.slice(0, 15).map((actor) => (
            <div key={actor.id} className="relative flex-none" style={{ flexBasis: '150px' }}>
              <CastCard actor={actor} />
            </div>
          ))}
        </div>
      </div>
      
      <ArrowButton onClick={scrollPrev} disabled={!canScrollPrev} isPrev />
      <ArrowButton onClick={scrollNext} disabled={!canScrollNext} />
    </div>
  );
};