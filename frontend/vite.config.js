import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/auth': 'http://localhost:8000',
      '/products': 'http://localhost:8000',
      '/orders': 'http://localhost:8000',
      '/notifications': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
      '/search': 'http://localhost:8000',
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  build: { 
    outDir: 'dist',
    cssCodeSplit: false,
    sourcemap: true,
  },
});
