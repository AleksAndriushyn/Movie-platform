import React from "react";
import type { Movie } from "@/types/movie";
import MovieCard from "../MovieCard/MovieCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type MovieGridProps = {
	movies: Movie[];
};

const MovieGrid: React.FC<MovieGridProps> = ({ movies }) => {
	const isMobile = useMediaQuery("(max-width: 640px)");

	const priorityCount = isMobile ? 4 : 10;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
			{movies.map((movie, index) => (
				<MovieCard
					key={movie.id}
					movie={movie}
					eagerLoad={index < priorityCount}
				/>
			))}
		</div>
	);
};

export default MovieGrid;
