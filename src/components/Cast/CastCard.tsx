import type { CastMember } from "@/types/movie";
import { getImageUrl } from "@/utils/image-helper";
import { Link } from "react-router-dom";

const CastCard: React.FC<{ actor: CastMember }> = ({ actor }) => {
  const actorImageUrl = actor.profile_path
    ? getImageUrl(actor.profile_path, 'w185')
    : 'https://via.placeholder.com/185x278.png?text=No+Image';

    const actorPageUrl = `https://www.themoviedb.org/person/${actor.id}`;
  
  return (
    <Link
      to={actorPageUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="cast-card">
        <img
          src={actorImageUrl}
          alt={actor.name}
          className="w-full h-48 object-cover rounded-lg shadow-md mb-2"
          loading="lazy"
        />
        <p className="text-white font-semibold text-sm">{actor.name}</p>
        <p className="text-gray-400 text-xs">{actor.character}</p>
      </div>
    </Link>
    
  );
};

export default CastCard;