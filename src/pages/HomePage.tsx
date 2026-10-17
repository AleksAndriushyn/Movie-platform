import React from "react";
import { useMovies } from "@/hooks/useMovies";
import { useSearchParams } from "react-router-dom";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";
import getPageParam from "@/utils/page-param";

const HomePage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const urlPage = getPageParam(searchParams);

	const { data, isLoading, isError, isFetching } = useMovies({ page: urlPage });

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	return (
		<ListPageLayout
			title="Popular Movies"
			movies={movies}
			totalPages={totalPages}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
		/>
	);
};

export default HomePage;
