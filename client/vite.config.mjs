import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000, 
      strictPort: false,
    },
    build: {
      outDir: 'build',
    },
    plugins: [react()],
  };
});
