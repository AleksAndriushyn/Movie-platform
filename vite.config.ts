import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const VERCEL_ACCESS_TOKEN = env.TMDB_API_ACCESS_TOKEN;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    define: {
      'import.meta.env.VITE_TMDB_API_ACCESS_TOKEN': JSON.stringify(VERCEL_ACCESS_TOKEN),
    },}
  }
);
