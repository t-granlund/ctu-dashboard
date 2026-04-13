import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/ctu-dashboard/',
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        architecture: resolve(__dirname, 'architecture.html'),
      },
    },
  },
});
