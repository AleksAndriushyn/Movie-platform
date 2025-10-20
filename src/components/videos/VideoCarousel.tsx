import React from 'react';
import type { Video } from '@/types/movie';
import { VideoThumbnail } from './VideoThumbnail';
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

interface VideoCarouselProps {
  videos: Video[];
  onVideoClick: (key: string) => void;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, onVideoClick }) => {
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

    if (!videos || videos.length === 0) {
        return <p className="text-gray-400">No videos available for this movie.</p>;
    }

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {videos.map((video) => (
                        <div key={video.id} className="relative ml-4 flex-none" style={{ flexBasis: '320px' }}>
                          <VideoThumbnail video={video} onClick={() => onVideoClick(video.key)} />
                        </div>
                    ))}
                </div>
            </div>

            <ArrowButton onClick={scrollPrev} disabled={!canScrollPrev} isPrev />
            <ArrowButton onClick={scrollNext} disabled={!canScrollNext} />
        </div>
    );
};