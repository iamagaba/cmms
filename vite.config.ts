import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react/jsx-runtime',
      'react-is',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
    exclude: [],
    // Force rebuild on changes
    force: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mantine/core": path.resolve(__dirname, "./src/mocks/mantine-core.tsx"),
      "@mantine/hooks": path.resolve(__dirname, "./src/mocks/mantine-hooks.tsx"),
      "@mantine/notifications": path.resolve(__dirname, "./src/mocks/mantine-notifications.tsx"),
      "@mantine/dates": path.resolve(__dirname, "./src/mocks/mantine-dates.tsx"),
      "@mantine/form": path.resolve(__dirname, "./src/mocks/mantine-form.tsx"),
      "@mantine/charts": path.resolve(__dirname, "./src/mocks/mantine-charts.tsx"),
      "@mantine/dropzone": path.resolve(__dirname, "./src/mocks/mantine-dropzone.tsx"),
      "@mantine/spotlight": path.resolve(__dirname, "./src/mocks/mantine-spotlight.tsx"),
      "mantine-datatable": path.resolve(__dirname, "./src/mocks/mantine-datatable.tsx"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-is'],
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks: (id) => {
          // Vendor chunks for large dependencies
          if (id.includes('node_modules')) {
            // React ecosystem - MUST be first to avoid duplication
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Calendar and date libraries
            if (id.includes('react-big-calendar') || id.includes('moment') || id.includes('date-fns') || id.includes('dayjs')) {
              return 'vendor-calendar';
            }
            // Map libraries
            if (id.includes('mapbox-gl') || id.includes('leaflet')) {
              return 'vendor-maps';
            }
            // Query and state management
            if (id.includes('@tanstack/react-query') || id.includes('react-hook-form')) {
              return 'vendor-state';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Other large libraries
            if (id.includes('framer-motion') || id.includes('embla-carousel')) {
              return 'vendor-animations';
            }
            // Remaining node_modules
            return 'vendor-misc';
          }

          // App chunks by feature
          if (id.includes('/pages/Calendar') || id.includes('/components/Calendar')) {
            return 'feature-calendar';
          }
          if (id.includes('/pages/Analytics') || id.includes('/components/charts')) {
            return 'feature-analytics';
          }
          if (id.includes('/pages/MapView') || id.includes('/components/map')) {
            return 'feature-maps';
          }
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: mode === 'development',
  },
}));
