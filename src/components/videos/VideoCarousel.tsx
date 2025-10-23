import React from 'react';
import type { Video } from '@/types/movie';
import { VideoThumbnail } from './VideoThumbnail';
import useEmblaCarousel from 'embla-carousel-react';

type VideoCarouselProps = {
  videos: Video[];
  onVideoClick: (key: string) => void;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, onVideoClick }) => {
  const [emblaRef] = useEmblaCarousel({
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
    </div>
  );
};