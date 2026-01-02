import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: any[] = [react()];
  
  if (mode === 'development') {
    plugins.push(componentTagger());
  }
  
  // Always include visualizer for bundle analysis
  plugins.push(visualizer({
    open: false,
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
  }));
  
  plugins.push(VitePWA({
    registerType: 'prompt',
    workbox: {
      skipWaiting: false,
      clientsClaim: true,
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        }
      ]
    },
    includeAssets: ['lovable-uploads/logo-favicon.png'],
    manifest: {
      name: 'Finanza Creativa',
      short_name: 'FinanzaCreativa',
      description: 'App per la gestione e simulazione di investimenti finanziari',
      theme_color: '#5D87FF',
      background_color: '#F5F6FA',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'lovable-uploads/logo-favicon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: 'lovable-uploads/logo-favicon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ]
    }
  }));

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor splitting for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            'chart-vendor': ['recharts'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging
      sourcemap: mode === 'production' ? false : true,
    },
    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        '@tanstack/react-query',
      ],
    },
  };
});
