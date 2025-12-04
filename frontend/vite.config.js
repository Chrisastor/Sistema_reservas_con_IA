import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ESTO ES CRÍTICO: Forzar a Vite a usar una única copia de React
  resolve: {
    alias: {
      // Asegura que todas las importaciones de 'react' y 'react-dom'
      // apunten a la copia en node_modules de la raíz, evitando duplicados.
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    // Si necesitas proxy para Django, agrégalo aquí
    // proxy: {
    //   '/api': 'http://127.0.0.1:8000',
    // },
  }
});