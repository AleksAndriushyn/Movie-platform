import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import MoviePage from "./pages/MoviePage";
import SearchPage from "./pages/SearchPage";
import GenrePage from "./pages/GenrePage";

const queryClient = new QueryClient();

const App: React.FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Layout>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/movie/:movieId" element={<MoviePage />} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/genre/:genreId" element={<GenrePage />} />
				</Routes>
			</Layout>
		</QueryClientProvider>
	);
};

export default App;
