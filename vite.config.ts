import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const buildStamp = Date.now().toString(36);

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_TIMESTAMP__: JSON.stringify(Date.now()),
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${buildStamp}.js`,
        chunkFileNames: `assets/[name]-[hash]-${buildStamp}.js`,
        assetFileNames: `assets/[name]-[hash]-${buildStamp}.[ext]`,
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow connections from other devices on the LAN (smartphones)
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});