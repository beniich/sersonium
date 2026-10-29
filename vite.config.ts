import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'SENSORIUM - Sovereign Sensory Intelligence',
          short_name: 'SENSORIUM',
          description: "Plateforme souveraine d'intelligence sensorielle, orchestration Edge AI et resilience d'infrastructures critiques.",
          theme_color: '#0A0A0C',
          background_color: '#070709',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 15728640,
        },
        devOptions: { enabled: false, type: 'module' },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core
            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router-dom/') ||
                id.includes('node_modules/react-is/')) return 'vendor';

            // Firebase — lourd (~350 kB), charge uniquement si authentifie
            if (id.includes('node_modules/firebase/') ||
                id.includes('node_modules/@firebase/')) return 'firebase';

            // Three.js — lourd (~530 kB), charge uniquement sur pages 3D
            if (id.includes('node_modules/three/')) return 'three';

            // Recharts + sous-modules D3
            if (id.includes('node_modules/recharts/') ||
                id.includes('node_modules/d3-') ||
                id.includes('node_modules/d3/') ||
                id.includes('node_modules/victory-vendor/')) return 'recharts';

            // Chart.js separe de recharts
            if (id.includes('node_modules/chart.js/') ||
                id.includes('node_modules/react-chartjs-2/')) return 'chartjs';

            // Motion / Framer
            if (id.includes('node_modules/motion/') ||
                id.includes('node_modules/framer-motion/')) return 'motion';

            // Lucide icons
            if (id.includes('node_modules/lucide-react/')) return 'icons';

            // PDF — jspdf + html2canvas (lourd, uniquement a la demande)
            if (id.includes('node_modules/jspdf/') ||
                id.includes('node_modules/jspdf-autotable/') ||
                id.includes('node_modules/html2canvas/')) return 'pdf';

            // Socket.io temps reel
            if (id.includes('node_modules/socket.io-client/') ||
                id.includes('node_modules/engine.io-client/')) return 'socketio';

            // Google APIs — Maps + GenAI
            if (id.includes('node_modules/@vis.gl/react-google-maps/') ||
                id.includes('node_modules/@google/')) return 'google-apis';

            // Utilitaires legers
            if (id.includes('node_modules/axios/') ||
                id.includes('node_modules/zod/')) return 'utils';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
