import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useMovieGenres from "@/hooks/useMovieGenres";
import { useMoviesByGenre } from "@/hooks/useMovies";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";

const GenrePage: React.FC = () => {
	const { genreId } = useParams<{ genreId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const id = Number(genreId);
	const page = Number(searchParams.get("page")) || 1;

	const { data, isLoading, isError, isFetching } = useMoviesByGenre(id, page);
	const { data: genres } = useMovieGenres();

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	const genre = genres?.find((g) => g.id === id);

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: newPage.toString() });
	};

	return (
		<ListPageLayout
			title={`Movies in ${genre?.name}`}
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
			handlePageChange={handlePageChange}
		/>
	);
};

export default GenrePage;
