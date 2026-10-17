import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ListPageLayout } from "@/components/Layout/ListPageLayout";
import { getLoginUrl } from "@/api/me";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMovieList } from "@/hooks/useLists";
import getPageParam from "@/utils/page-param";
import type { MovieListName } from "@/types/user";

type ListPageProps = {
	list: MovieListName;
	title: string;
	emptyMessage: string;
};

const ListPage: React.FC<ListPageProps> = ({ list, title, emptyMessage }) => {
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const page = getPageParam(searchParams);

	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { data, isLoading, isFetching, isError } = useMovieList(list, page, !!user);

	if (!isUserLoading && !user) {
		return (
			<div className="text-center py-20">
				<title>{`${title} | MovieVerse`}</title>
				<h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
				<p className="text-gray-400 mb-8">Sign in with Google to keep your own lists of movies.</p>
				<a href={getLoginUrl(location.pathname + location.search)} className="auth-button inline-block w-auto">
					Sign in
				</a>
			</div>
		);
	}

	return (
		<ListPageLayout
			title={title}
			movies={data?.movies || []}
			totalPages={data?.totalPages || 1}
			isLoading={isUserLoading || isLoading}
			isFetching={isFetching}
			isError={isError}
			emptyMessage={emptyMessage}
		/>
	);
};

export default ListPage;
