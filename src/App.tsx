import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage';
import { Route, Routes } from 'react-router-dom';
import MoviePage from './pages/MoviePage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage/>
          </Layout>
        } />
        <Route path="/movie/:movieId" element={
          <Layout>
            <MoviePage/>
          </Layout>
        } />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
