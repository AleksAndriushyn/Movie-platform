import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const VERCEL_AUTH_KEY = process.env.TMDB_API_ACCESS_TOKEN || process.env.TMDB_API_KEY_V3;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  define: {
    'import.meta.env.VITE_TMDB_AUTH_KEY': JSON.stringify(VERCEL_AUTH_KEY),
  },
})
