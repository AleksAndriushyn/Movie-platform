import React from "react";
import { useMovies } from "@/hooks/useMovies";
import { useSearchParams } from "react-router-dom";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";
import getPageParam from "@/utils/page-param";

const HomePage: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	// set by the API when Google sign-in is cancelled or fails
	const loginFailed = searchParams.has("loginError");

	const dismissLoginError = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("loginError");
		setSearchParams(next, { replace: true });
	};
	const urlPage = getPageParam(searchParams);

	const { data, isLoading, isError, isFetching } = useMovies({ page: urlPage });

	const movies = data?.movies || [];
	const totalPages = data?.totalPages || 1;

	return (
		<>
			{loginFailed && (
				<div role="alert" className="mx-4 mb-2 flex items-center justify-between gap-4 rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">
					<span>Sign-in was cancelled or failed. Please try again.</span>
					<button type="button" onClick={dismissLoginError} className="text-red-200 hover:text-white" aria-label="Dismiss">
						✕
					</button>
				</div>
			)}
			<ListPageLayout
				title="Popular Movies"
				movies={movies}
				totalPages={totalPages}
				isLoading={isLoading}
				isFetching={isFetching}
				isError={isError}
			/>
		</>
	);
};

export default HomePage;
