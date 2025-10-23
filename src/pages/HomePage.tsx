import React from "react";
import { useMovies } from "@/hooks/useMovies";
import { useSearchParams } from "react-router-dom";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";

const HomePage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const urlPage = Number(searchParams.get("page")) || 1;

	const { data, isLoading, isError, isFetching } = useMovies({ page: urlPage });

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	return (
		<ListPageLayout
			title="Trending Now"
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
		/>
	);
};

export default HomePage;
