import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'configure-rollup',
          resolveId(source) {
            if (source === '@mui/x-data-grid/theme/material/styles.css') {
              return this.resolve('@mui/x-data-grid/theme/material/styles.css');
            }
            return null;
          }
        }
      ]
    }
  }
});