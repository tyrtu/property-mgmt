import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true // Allows external network access
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false // Disable for production
  }
});