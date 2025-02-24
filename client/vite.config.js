import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      external: [
        '@mui/x-data-grid/theme/material/styles.css'
      ]
    }
  }
});