import React from 'react'
import type { CastMember } from '@/types/movie'
import CastCard from './CastCard';
import useEmblaCarousel from 'embla-carousel-react';

interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  const [emblaRef] = useEmblaCarousel({
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
    </div>
  );
};