import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useMovieGenres from "@/hooks/useMovieGenres";
import { useMoviesByGenre } from "@/hooks/useMovies";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";

const GenrePage: React.FC = () => {
	const { genreId } = useParams<{ genreId: string }>();
	const [searchParams] = useSearchParams();

	const id = Number(genreId);
	const page = Number(searchParams.get("page")) || 1;

	const { data, isLoading, isError, isFetching } = useMoviesByGenre(id, page);
	const { data: genres } = useMovieGenres();

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	const genre = genres?.find((g) => g.id === id);

	return (
		<ListPageLayout
			title={genre ? `${genre.name} Movies` : "Movies"}
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
		/>
	);
};

export default GenrePage;
