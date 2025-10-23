import React from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchMovies } from "@/hooks/useMovies";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";

const SearchPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const urlQuery = searchParams.get("query") || "";
	const urlPage = Number(searchParams.get("page")) || 1;

	const { data, isLoading, isFetching, isError } = useSearchMovies(
		urlQuery,
		urlPage
	);

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	return (
		<ListPageLayout
			title={urlQuery.trim() ? `Results for "${urlQuery}"` : "Search"}
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
		/>
	);
};

export default SearchPage;
