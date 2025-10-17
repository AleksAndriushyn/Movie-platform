import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const VERCEL_ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  define: {
    'import.meta.env.VITE_TMDB_API_ACCESS_TOKEN': JSON.stringify(VERCEL_ACCESS_TOKEN),
  },
})
