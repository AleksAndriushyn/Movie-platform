import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import MoviePage from "./pages/MoviePage";
import SearchPage from "./pages/SearchPage";
import GenrePage from "./pages/GenrePage";
import NotFoundPage from "./pages/NotFoundPage";
import ListPage from "./pages/ListPage";
import PrivacyPage from "./pages/PrivacyPage";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { ApiError } from "./api/AxiosInstance";

const MAX_RETRIES = 2;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 4xx (e.g. unknown movie id) won't succeed on retry, so fail fast
			retry: (failureCount, error) => {
				if (error instanceof ApiError && error.status && error.status < 500) {
					return false;
				}
				return failureCount < MAX_RETRIES;
			},
		},
	},
});

const App: React.FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Layout>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/movie/:movieId" element={<MoviePage />} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/genre/:genreId" element={<GenrePage />} />
					<Route
						path="/favorites"
						element={<ListPage list="favorites" title="Favorites" emptyMessage="No favorites yet. Tap the heart on any movie to add it." />}
					/>
					<Route
						path="/watchlist"
						element={<ListPage list="watchlist" title="Watchlist" emptyMessage="Your watchlist is empty. Tap the bookmark on any movie to save it for later." />}
					/>
					<Route path="/privacy" element={<PrivacyPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<SpeedInsights/>
			</Layout>
		</QueryClientProvider>
	);
};

export default App;
