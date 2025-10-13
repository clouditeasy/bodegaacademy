import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Explicitly set jsxRuntime to avoid preamble issues
      jsxRuntime: 'automatic',
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Force full reload on error
    hmr: {
      overlay: true
    }
  },
  // Clear cache on start
  cacheDir: 'node_modules/.vite',
});
