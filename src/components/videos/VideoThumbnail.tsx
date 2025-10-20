import type { Video } from '@/types/movie';

interface VideoThumbnailProps {
  video: Video;
  onClick: () => void;
}

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-16 h-16 text-white drop-shadow-lg"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
      clipRule="evenodd"
    />
  </svg>
);

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video, onClick }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`;

  return (
    <button
      onClick={onClick}
      className="relative block w-full aspect-w-16 aspect-h-9 rounded-lg overflow-hidden group"
    >
      <img
        src={thumbnailUrl}
        alt={video.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayIcon />
      </div>
      <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-sm font-semibold truncate">{video.name}</p>
      </div>
    </button>
  );
};