import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  base: "/", // Ensures proper routing in production
});
