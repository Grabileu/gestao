import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';  // ← adicione essa linha

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // ← adicione aqui
  ],
 resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/components': path.resolve(__dirname, './src/components'),
    '@/Pages': path.resolve(__dirname, './Pages'),
    '@/api': path.resolve(__dirname, './src/api'),
    // Se tiver Layout ou outras pastas na raiz, adicione aqui também
  }
},
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});