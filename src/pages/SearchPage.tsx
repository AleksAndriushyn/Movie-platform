import React from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchMovies } from "@/hooks/useMovies";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";
import getPageParam from "@/utils/page-param";

const SearchPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const urlQuery = searchParams.get("query")?.trim() || "";
	const urlPage = getPageParam(searchParams);

	const { data, isLoading, isFetching, isError } = useSearchMovies(
		urlQuery,
		urlPage
	);

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	return (
		<ListPageLayout
			title={urlQuery ? `Results for "${urlQuery}"` : "Search"}
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
			emptyMessage={
				urlQuery
					? `No results found for "${urlQuery}". Try a different search term.`
					: "Type a movie title in the search bar to get started."
			}
		/>
	);
};

export default SearchPage;
