import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    root: 'frontend',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'frontend'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'frontend/index.html'),
          background: path.resolve(__dirname, 'frontend/src/background/background.ts'),
          content: path.resolve(__dirname, 'frontend/src/content/content.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
              return '[name].js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
