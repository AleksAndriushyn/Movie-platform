import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite';

// MovieVerse API (backend/src/MovieVerse.Api), see backend/README.md
const API_DEV_URL = process.env.API_DEV_URL ?? 'http://localhost:5080';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': API_DEV_URL,
    },
  },
});
