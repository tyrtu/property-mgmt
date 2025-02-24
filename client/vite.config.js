import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssImport from 'postcss-import';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  css: {
    postcss: {
      plugins: [
        postcssImport() // Add CSS import resolver
      ]
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true // Fix MUI module resolution
    },
    rollupOptions: {
      external: [
        '@mui/x-data-grid/theme/material/styles.css' // Allow CSS imports
      ]
    }
  }
});