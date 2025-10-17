import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const VERCEL_AUTH_KEY = process.env.VITE_TMDB_API_KEY_V3;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  define: {
    'import.meta.env.VITE_TMDB_API_KEY_V3': JSON.stringify(VERCEL_AUTH_KEY),
  },
})
