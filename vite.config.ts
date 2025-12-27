import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: process.env.VITEST ? ['browser'] : undefined
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  build: {
    outDir: 'assets/dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'BlogApp',
      formats: ['iife'],
      fileName: () => 'app.js'
    },
    rollupOptions: {
      output: {
        extend: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'app.css';
          return assetInfo.name || 'unknown';
        }
      }
    }
  }
});
